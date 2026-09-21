import {useEffect,useRef} from 'react';
import type {CSSProperties} from 'react';
import type {LiveDirection} from './liveSceneDirections';
import './livingScene.css';
export default function LivingScene({direction,paused,accent='#d8d2a6'}:{direction:LiveDirection;paused:boolean;accent?:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(paused)return;let frame=0;let x=0,y=0;const move=(e:PointerEvent)=>{x=(e.clientX/innerWidth-.5)*12;y=(e.clientY/innerHeight-.5)*8;if(!frame)frame=requestAnimationFrame(()=>{frame=0;ref.current?.style.setProperty('--live-pointer-x',`${x}px`);ref.current?.style.setProperty('--live-pointer-y',`${y}px`);});};window.addEventListener('pointermove',move,{passive:true});return()=>{window.removeEventListener('pointermove',move);cancelAnimationFrame(frame);};},[paused]);
 const kind=direction.kind;return <div ref={ref} className={`living-scene live-${kind} ${paused?'live-still':''}`} aria-hidden="true" style={{'--live-x':`${direction.x}%`,'--live-y':`${direction.y}%`,'--live-scale':direction.scale,'--live-pace':`${direction.pace}s`,'--live-color':accent} as CSSProperties}>
  <div className="live-atmosphere"/>
  <div className="live-focus"><i className="live-halo"/><i className="live-halo halo-two"/>
   {Array.from({length:kind==='city'||kind==='logistics'?8:12},(_,i)=><span key={i} className="live-subject" style={{'--item':i,'--phase':`${-i*1.13}s`,'--spread':`${(i*37)%100}%`} as CSSProperties}><b/><em/><small/></span>)}
  </div>
 </div>;
}
