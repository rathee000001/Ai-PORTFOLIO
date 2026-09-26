import {regionWeight} from './artworkMotion';
import {campaignButterflyPose} from './campaignButterflyPath';
const sourceWidth=1672,bounds={x:1100,y:285,width:65,height:80},anchor={x:1124,y:338};
const envelope=[[1102,310],[1117,317],[1122,327],[1125,319],[1130,307],[1138,295],[1144,288],[1151,287],[1155,300],[1157,319],[1153,328],[1158,333],[1161,342],[1160,350],[1154,358],[1146,359],[1140,356],[1141,362],[1136,363],[1126,351],[1116,339],[1102,320]] as const;
export function prepareCampaignButterfly(pixels:Uint8ClampedArray){
 const {x,y,width,height}=bounds;
 const candidate=new Uint8Array(width*height),object=new Uint8Array(width*height),outside=new Uint8Array(width*height);
 for(let j=0;j<height;j++)for(let i=0;i<width;i++){const p=((y+j)*sourceWidth+x+i)*4,r=pixels[p],g=pixels[p+1],b=pixels[p+2];candidate[j*width+i]=r>150&&r>g*1.08&&g>b*1.08&&regionWeight(envelope,x+i+.5,y+j+.5,.1)>0?1:0;}
 const queue:number[]=[];for(let j=48;j<59;j++)for(let i=19;i<32;i++){const n=j*width+i;if(candidate[n]){object[n]=1;queue.push(n);}}
 const adjacent=(n:number,visit:(other:number)=>void)=>{const xx=n%width,yy=Math.floor(n/width);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=xx+dx,b=yy+dy;if(a>=0&&a<width&&b>=0&&b<height)visit(b*width+a);}};
 for(let k=0;k<queue.length;k++)adjacent(queue[k],n=>{if(candidate[n]&&!object[n]){object[n]=1;queue.push(n);}});
 const air:number[]=[];for(let j=0;j<height;j++)for(let i=0;i<width;i++)if(i===0||j===0||i===width-1||j===height-1){const n=j*width+i;if(!object[n]&&!outside[n]){outside[n]=1;air.push(n);}}
 for(let k=0;k<air.length;k++)adjacent(air[k],n=>{if(!object[n]&&!outside[n]){outside[n]=1;air.push(n);}});
 for(let n=0;n<object.length;n++)if(!outside[n])object[n]=1;
 const erase=new Uint8Array(width*height);for(let j=0;j<height;j++)for(let i=0;i<width;i++)if(object[j*width+i])for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const a=i+dx,b=j+dy;if(a>=0&&a<width&&b>=0&&b<height)erase[b*width+a]=1;}
 const inside=(px:number,py:number)=>{const xx=px-x,yy=py-y;return xx>=0&&xx<width&&yy>=0&&yy<height&&!!erase[yy*width+xx];};
 const plate=document.createElement('canvas');plate.width=width;plate.height=height;const pc=plate.getContext('2d')!,data=pc.createImageData(width,height);
 for(let j=0;j<height;j++)for(let i=0;i<width;i++){if(!erase[j*width+i])continue;let total=0;const rgb=[0,0,0];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]])for(let radius=3;radius<40;radius++){const sx=x+i+dx*radius,sy=y+j+dy*radius;if(inside(sx,sy))continue;const p=(sy*sourceWidth+sx)*4;if(pixels[p]>170&&pixels[p+1]>90&&pixels[p+2]<pixels[p+1]*.85)continue;const w=1/(radius*radius);for(let c=0;c<3;c++)rgb[c]+=pixels[p+c]*w;total+=w;break;}if(total){for(let c=0;c<3;c++)data.data[(j*width+i)*4+c]=rgb[c]/total;data.data[(j*width+i)*4+3]=255;}}
 // Diffuse only the concealed pixels; fixed boundary pixels retain the original garden.
 // This removes directional seams from nearest-boundary sampling when the insect moves away.
 let fill=new Float32Array(width*height*3),next=new Float32Array(width*height*3);
 for(let j=0;j<height;j++)for(let i=0;i<width;i++){const n=j*width+i,p=((y+j)*sourceWidth+x+i)*4;for(let c=0;c<3;c++)fill[n*3+c]=erase[n]?data.data[n*4+c]:pixels[p+c];}
 next.set(fill);
 for(let iteration=0;iteration<180;iteration++){for(let j=1;j<height-1;j++)for(let i=1;i<width-1;i++){const n=j*width+i;if(!erase[n])continue;for(let c=0;c<3;c++)next[n*3+c]=(fill[(n-1)*3+c]+fill[(n+1)*3+c]+fill[(n-width)*3+c]+fill[(n+width)*3+c])*.25;}const swap=fill;fill=next;next=swap;}
 for(let n=0;n<erase.length;n++)if(erase[n])for(let c=0;c<3;c++)data.data[n*4+c]=fill[n*3+c];
 pc.putImageData(data,0,0);
 const layers=[0,1].map(part=>{const layer=document.createElement('canvas');layer.width=width;layer.height=height;const ctx=layer.getContext('2d')!,image=ctx.createImageData(width,height);for(let j=0;j<height;j++)for(let i=0;i<width;i++){const index=j*width+i;if(!object[index])continue;const px=x+i,py=y+j,t=Math.max(0,Math.min(1,((px-1120)*17+(py-337)*22)/(17*17+22*22))),isBody=Math.hypot(px-1120-17*t,py-337-22*t)<3.5; if((part===1)!==isBody)continue;const p=(py*sourceWidth+px)*4,n=index*4;for(let c=0;c<3;c++)image.data[n+c]=pixels[p+c];image.data[n+3]=255;}ctx.putImageData(image,0,0);return layer;});
 return {plate,layers,bounds};
}
export function drawCampaignButterfly(ctx:CanvasRenderingContext2D,sprite:ReturnType<typeof prepareCampaignButterfly>,time:number){
 const pose=campaignButterflyPose(time),{x,y}=sprite.bounds;ctx.drawImage(sprite.plate,x,y);
 for(let i=0;i<sprite.layers.length;i++){ctx.save();ctx.translate(anchor.x+pose.x,anchor.y+pose.y);ctx.rotate(pose.tilt);if(i===0){ctx.rotate(.82);ctx.scale(1,pose.wing);ctx.rotate(-.82);}ctx.drawImage(sprite.layers[i],x-anchor.x,y-anchor.y);ctx.restore();}
 return pose;
}
