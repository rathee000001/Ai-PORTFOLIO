import {regionWeight} from './artworkMotion';
const bounds={x:1324,y:254,width:230,height:112};
const outline=[[1330,263],[1475,259],[1492,264],[1516,265],[1532,274],[1545,300],[1549,336],[1543,360],[1490,364],[1466,353],[1382,345],[1340,340],[1328,323]] as const;
export function supplyTruckPose(time:number){
 const phase=((time%20)+20)%20;
 const t=phase<3?0:phase<9?(phase-3)/6:phase<12?1:phase<18?1-(phase-12)/6:0;
 const eased=t*t*(3-2*t);
 return {x:12*eased,y:3*eased,state:phase<3||phase>=18?'loading':phase<9?'pulling-forward':phase<12?'waiting':'reversing-to-load'};
}
/** Original truck pixels and a small runtime repair plate; the source bitmap is never modified. */
export function prepareSupplyTruck(pixels:Uint8ClampedArray){
 const {x,y,width,height}=bounds,mask=new Uint8Array(width*height);
 const layer=document.createElement('canvas'),plate=document.createElement('canvas');
 layer.width=plate.width=width;layer.height=plate.height=height;
 const lc=layer.getContext('2d')!,pc=plate.getContext('2d')!,sprite=lc.createImageData(width,height),repair=pc.createImageData(width,height);
 let fill=new Float32Array(width*height*3),next=new Float32Array(width*height*3);
 for(let j=0;j<height;j++)for(let i=0;i<width;i++){
  const n=j*width+i,p=((y+j)*1672+x+i)*4,inside=regionWeight(outline,x+i+.5,y+j+.5,.1)>0;mask[n]=inside?1:0;
  for(let c=0;c<3;c++){sprite.data[n*4+c]=pixels[p+c];fill[n*3+c]=pixels[p+c];}
  sprite.data[n*4+3]=inside?255:0;
 }
 // Only the narrow exposed edge is visible during the twelve-pixel parking maneuver.
 // Initialize hidden pixels from their nearest horizontal scene boundary, then smooth.
 for(let j=0;j<height;j++)for(let i=0;i<width;i++){const n=j*width+i;if(!mask[n])continue;let left=i,right=i;while(left>0&&mask[j*width+left])left--;while(right<width-1&&mask[j*width+right])right++;const ratio=(i-left)/Math.max(1,right-left);for(let c=0;c<3;c++)fill[n*3+c]=fill[(j*width+left)*3+c]*(1-ratio)+fill[(j*width+right)*3+c]*ratio;}
 next.set(fill);
 for(let pass=0;pass<100;pass++){for(let j=1;j<height-1;j++)for(let i=1;i<width-1;i++){const n=j*width+i;if(!mask[n])continue;for(let c=0;c<3;c++)next[n*3+c]=(fill[(n-1)*3+c]+fill[(n+1)*3+c]+fill[(n-width)*3+c]+fill[(n+width)*3+c])*.25;}const swap=fill;fill=next;next=swap;}
 for(let n=0;n<mask.length;n++){for(let c=0;c<3;c++)repair.data[n*4+c]=fill[n*3+c];repair.data[n*4+3]=mask[n]?255:0;}
 lc.putImageData(sprite,0,0);pc.putImageData(repair,0,0);return {layer,plate};
}
export function drawSupplyTruck(ctx:CanvasRenderingContext2D,sprite:ReturnType<typeof prepareSupplyTruck>,time:number){const pose=supplyTruckPose(time);ctx.drawImage(sprite.plate,bounds.x,bounds.y);ctx.drawImage(sprite.layer,bounds.x+pose.x,bounds.y+pose.y);return pose;}
