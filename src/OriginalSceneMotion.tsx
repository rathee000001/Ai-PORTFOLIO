import {useEffect,useRef} from 'react';
import {artworkScenes,localMotion,materialWeight,prepareMotionClock,regionWeight} from './artworkMotion';
import type {ArtworkScene} from './artworkMotion';
import {sourceFrame} from './artworkFrame';
import {compositeArtworkPatch,createArtworkPatch} from './artworkComposite';
import {drawCampaignButterfly,prepareCampaignButterfly} from './campaignButterfly';
import {drawSupplyTruck,prepareSupplyTruck} from './supplyTruck';

/** Local inverse sampling of the original artwork. The original background remains untouched. */
export default function OriginalSceneMotion({paused,scene='welcome'}:{paused:boolean;scene?:keyof typeof artworkScenes}){
 const canvas=useRef<HTMLCanvasElement>(null);
 const savedClock=useRef({key:'',time:0});
 const {source,regions,frame:sourceCrop,objectMotion}:ArtworkScene=artworkScenes[scene];
 useEffect(()=>{
  const node=canvas.current,context=node?.getContext('2d');if(!node||!context)return;
  const key=`${source}:${sourceCrop?.columns||1}:${sourceCrop?.rows||1}:${sourceCrop?.index||0}`;
  if(savedClock.current.key!==key){savedClock.current={key,time:0};context.clearRect(0,0,node.width,node.height);}
  node.dataset.motionState=paused?'paused':'loading';
  if(paused)return;
  const picture=new Image();let frame=0,disposed=false,last=0,clock=savedClock.current.time,lastReport=0;
  let pixels:Uint8ClampedArray|null=null;
  let butterfly:ReturnType<typeof prepareCampaignButterfly>|null=null;
  let truck:ReturnType<typeof prepareSupplyTruck>|null=null;
  const patches=regions.map(region=>{
   const x=Math.floor(Math.min(...region.polygon.map(p=>p[0]))),y=Math.floor(Math.min(...region.polygon.map(p=>p[1])));
   const width=Math.ceil(Math.max(...region.polygon.map(p=>p[0])))-x+1,height=Math.ceil(Math.max(...region.polygon.map(p=>p[1])))-y+1;
   const image=context.createImageData(width,height),weights=new Float32Array(width*height);
   for(let j=0;j<height;j++)for(let i=0;i<width;i++)weights[j*width+i]=regionWeight(region.polygon,x+i,y+j,region.feather);
   return {region,x,y,width,height,image,weights,indices:new Uint32Array(0),activePixels:0,buffer:createArtworkPatch(width,height)};
  });
  const draw=(now:number)=>{
   if(disposed||document.hidden||!pixels)return;
   frame=requestAnimationFrame(draw);if(now-last<1000/30)return;
   const dt=last?Math.min((now-last)/1000,.1):0;last=now;clock+=dt;savedClock.current.time=clock;const started=performance.now();
   context.clearRect(0,0,1672,941);
   for(const patch of patches){
    const {region,x,y,width,image,weights}=patch,prepared=prepareMotionClock(region,clock);
    for(const n of patch.indices){
     const j=Math.floor(n/width),i=n-j*width,w=weights[n];
     const motion=localMotion(region,x+i,y+j,clock,w,prepared),sx=Math.max(0,Math.min(1670,x+i+motion.dx)),sy=Math.max(0,Math.min(939,y+j+motion.dy));
     const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy,a=(iy*1672+ix)*4,b=a+4,c=a+1672*4,d=c+4;
     for(let channel=0;channel<3;channel++){
      const value=(pixels[a+channel]*(1-fx)+pixels[b+channel]*fx)*(1-fy)+(pixels[c+channel]*(1-fx)+pixels[d+channel]*fx)*fy;
      const gain=region.effect==='stars'?motion.gain:region.effect==='light'||region.effect==='waterfall'||region.effect==='pipeline'||region.effect==='network'?1+(motion.gain-1)*Math.max(0,(value-100)/155):1;
      image.data[n*4+channel]=value*gain;
     }
     image.data[n*4+3]=Math.round(w*255);
    }
    compositeArtworkPatch(context,patch.buffer,image,x,y);
   }
   if(butterfly)node.dataset.objectMotion=JSON.stringify(drawCampaignButterfly(context,butterfly,clock));
   if(truck)node.dataset.objectMotion=JSON.stringify(drawSupplyTruck(context,truck,clock));
   node.dataset.motionTime=clock.toFixed(2);node.dataset.motionState='running';
   if(now-lastReport>1000){lastReport=now;node.dataset.renderMs=(performance.now()-started).toFixed(2);node.dataset.regionSignatures=JSON.stringify(patches.map(p=>{let signature=2166136261;for(let i=0;i<p.image.data.length;i+=17)signature=Math.imul(signature^p.image.data[i],16777619);return {id:p.region.id,signature:signature>>>0,activePixels:p.activePixels};}));}
  };
  const start=()=>{cancelAnimationFrame(frame);last=0;if(document.hidden)node.dataset.motionState='inactive';if(!disposed&&!document.hidden&&pixels)frame=requestAnimationFrame(draw);};
  picture.onload=()=>{if(disposed)return;const buffer=document.createElement('canvas');buffer.width=1672;buffer.height=941;const reader=buffer.getContext('2d',{willReadFrequently:true});if(!reader)return;const crop=sourceFrame(picture.naturalWidth,picture.naturalHeight,sourceCrop);reader.drawImage(picture,crop.x,crop.y,crop.width,crop.height,0,0,1672,941);pixels=reader.getImageData(0,0,1672,941).data;for(const patch of patches){const indices:number[]=[];for(let j=0;j<patch.height;j++)for(let i=0;i<patch.width;i++){const n=j*patch.width+i,p=((patch.y+j)*1672+patch.x+i)*4;patch.weights[n]*=materialWeight(patch.region.material,pixels[p],pixels[p+1],pixels[p+2]);if(Math.round(patch.weights[n]*255)>0)indices.push(n);}patch.indices=Uint32Array.from(indices);patch.activePixels=indices.length;}if(objectMotion==='campaign-butterfly')butterfly=prepareCampaignButterfly(pixels);if(objectMotion==='supply-truck')truck=prepareSupplyTruck(pixels);start();};
  picture.onerror=()=>{node.dataset.motionState='source-unavailable';};picture.src=source;document.addEventListener('visibilitychange',start);
  return()=>{disposed=true;cancelAnimationFrame(frame);picture.onload=null;picture.onerror=null;document.removeEventListener('visibilitychange',start);};
 },[paused,source,regions,sourceCrop,scene,objectMotion]);
 return <canvas ref={canvas} width={1672} height={941} aria-hidden="true" data-original-scene-motion={scene} data-region-count={regions.length} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',pointerEvents:'none'}}/>;
}
