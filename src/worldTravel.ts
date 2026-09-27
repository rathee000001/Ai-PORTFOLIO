import {useEffect,useRef} from 'react';
import {flushSync} from 'react-dom';
const depth=(path:string)=>path==='/'?0:path.startsWith('/worlds/')?1:2;
const stage=()=>document.querySelector<HTMLElement>('.entry-scene,.category-setting,.scene-world');
const origin=(element?:HTMLElement|null)=>{const r=element?.getBoundingClientRect();return r?`${Math.max(0,Math.min(100,(r.left+r.width/2)/innerWidth*100))}% ${Math.max(0,Math.min(100,(r.top+r.height/2)/innerHeight*100))}%`:'65% 45%';};
/** Animate real scene layers before changing routes, then reveal the destination nodes. */
export function useWorldTravel(path:string,setPath:(path:string)=>void,disabled:boolean){
 const current=useRef(path);current.current=path;
 useEffect(()=>{
  let disposed=false,busy=false,pendingHistory:URL|null=null;const animations=new Set<Animation>();
  const animate=async(element:HTMLElement|null,frames:Keyframe[],duration:number,hold=false)=>{if(!element||disabled)return;const a=element.animate(frames,{duration,easing:'cubic-bezier(.22,.65,.22,1)',fill:'both'});animations.add(a);try{await a.finished;}catch{/* cancelled by motion preference or unmount */}finally{if(!hold){a.cancel();animations.delete(a);}}};
  const travel=async(url:URL,source:HTMLElement|null,fromHistory=false)=>{
   if(busy){if(fromHistory)pendingHistory=url;return;}busy=true;const backwards=depth(url.pathname)<depth(current.current);
   document.documentElement.dataset.worldTravel=backwards?'leaving-world':'entering-world';
   const background=stage(),base=background?getComputedStyle(background).transform:'none',transform=base==='none'?'':base;
   const point=origin(source),copy=document.querySelector<HTMLElement>('.entry-copy,.category-world main,.journey-content');
   await Promise.all([animate(background,[{transform:`${transform} scale(1)`,transformOrigin:point,opacity:1},{transform:`${transform} scale(${backwards?.68:2.65})`,transformOrigin:point,opacity:.08}],480),animate(copy,[{opacity:1},{opacity:0}],280,true)]);
   if(disposed)return;
   for(const a of animations)a.cancel();animations.clear();
   if(!fromHistory)history.pushState({...history.state,portfolioTravel:true},'',url.pathname+url.search+url.hash);
   flushSync(()=>setPath(url.pathname));
   const homeMatch=url.pathname==='/'?url.hash.match(/^#home-([0-3])$/):null;
   const anchor=url.hash?document.getElementById(url.hash.slice(1)):null;
   scrollTo({top:homeMatch?Number(homeMatch[1])*innerHeight:anchor?anchor.getBoundingClientRect().top+scrollY:0,behavior:'instant'});
   if(disposed)return;
   document.documentElement.dataset.worldTravel='arriving';
   const incoming=stage(),incomingBase=incoming?getComputedStyle(incoming).transform:'none',prefix=incomingBase==='none'?'':incomingBase;
   const nodes=Array.from(document.querySelectorAll<HTMLElement>('.constellation-node'));
   await Promise.all([animate(incoming,[{transform:`${prefix} scale(${backwards?1.7:.62})`,transformOrigin:'65% 45%',opacity:.15},{transform:`${prefix} scale(1)`,transformOrigin:'65% 45%',opacity:1}],520),...nodes.map((node,i)=>animate(node,[{opacity:0,transform:`translateY(${35+i*8}px) scale(.75)`},{opacity:1,transform:'translateY(0) scale(1)'}],520+i*60))]);
   delete document.documentElement.dataset.worldTravel;busy=false;
   if(pendingHistory){const next=pendingHistory;pendingHistory=null;if(next.pathname!==current.current)void travel(next,null,true);}
  };
  const click=(event:MouseEvent)=>{if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const link=(event.target as Element)?.closest<HTMLAnchorElement>('a[href]');if(!link||link.target&&link.target!=='_self'||link.hasAttribute('download'))return;const url=new URL(link.href,location.href);if(url.origin!==location.origin||url.pathname===location.pathname||!/^\/(?:$|worlds\/|projects\/|experience$)/.test(url.pathname))return;event.preventDefault();event.stopPropagation();void travel(url,link);};
  const pop=()=>{if(location.pathname!==current.current)void travel(new URL(location.href),null,true);};
  document.addEventListener('click',click,true);window.addEventListener('popstate',pop);
  return()=>{disposed=true;for(const a of animations)a.cancel();delete document.documentElement.dataset.worldTravel;document.removeEventListener('click',click,true);window.removeEventListener('popstate',pop);};
 },[disabled,setPath]);
}

/** Travel within the existing inline workbench; no dialog or popup is created. */
export function animateWorkbench(button:HTMLElement,readout:HTMLElement|null,closing=false){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.querySelector('.journey-still,.entry-still,.gate-still'))return;
 const background=stage(),point=origin(button);if(background){for(const a of background.getAnimations())a.cancel();background.animate([{transform:'scale(1)',transformOrigin:point},{transform:`scale(${closing?.96:1.1})`,transformOrigin:point},{transform:'scale(1)',transformOrigin:point}],{duration:620,easing:'cubic-bezier(.22,.65,.22,1)'});}
 button.animate(closing?[{transform:'scale(1.13)'},{transform:'scale(1)'}]:[{transform:'scale(1)'},{transform:'scale(1.13)'},{transform:'scale(1)'}],{duration:520,easing:'ease-out'});
 if(readout){for(const a of readout.getAnimations())a.cancel();readout.animate(closing?[{opacity:.65,transform:'scale(1.03)'},{opacity:1,transform:'scale(1)'}]:[{opacity:.15,transform:'translateY(28px) scale(.94)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:480,easing:'ease-out'});}
}
