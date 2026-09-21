import WorldArtifacts from './WorldArtifacts';
import {useEffect,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight} from 'lucide-react';
import {Header} from './Gateway';
import SceneWorld from './SceneWorld';
import SectionRail from './SectionRail';
import SkillsConstellation from './SkillsConstellation';
import EvidenceLink from './EvidenceLink';
import {worldCategories} from './worldCategories';
import type {Project} from './types';
import './projectJourney.css';
export default function ProjectJourney({project,projects,paused,reduced,onToggleMotion}:{project:Project;projects:Project[];paused:boolean;reduced:boolean;onToggleMotion:()=>void}){
 const sections=useRef<(HTMLElement|null)[]>([]);const content=useRef<HTMLElement>(null);const [active,setActive]=useState(0);const motionOff=paused||reduced;
 const family=worldCategories.find(c=>c.projectIds.includes(project.id));const related=projects.filter(p=>p.id!==project.id&&family?.projectIds.includes(p.id));
 const go=(index:number)=>{const el=sections.current[index];if(!el)return;history.replaceState({},'',`${location.pathname}#section-${index}`);scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:motionOff?'instant':'smooth'});};
 useEffect(()=>{document.title=`${project.shortTitle} — Praveen Rathee`;let pending=0;const read=()=>{pending=0;let next=0;sections.current.forEach((el,index)=>{if(el&&el.getBoundingClientRect().top<=innerHeight*.35)next=index;});setActive(next);if(content.current){const top=content.current.getBoundingClientRect().top;content.current.style.clipPath=`inset(${Math.max(0,(innerWidth<700?125:105)-top)}px 0 0 0)`;}};const schedule=()=>{if(!pending)pending=requestAnimationFrame(read);};const hashIndex=Number(location.hash.replace('#section-',''));const target=sections.current[Number.isInteger(hashIndex)?hashIndex:0];if(target)scrollTo({top:target.getBoundingClientRect().top+scrollY,behavior:'instant'});window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);read();return()=>{cancelAnimationFrame(pending);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};},[project.id,project.shortTitle]);
 return <div className={`project-journey ${motionOff?'journey-still':''}`} style={{'--case-accent':project.accent,'--mobile-accent':project.accent,'--case-secondary':project.secondary} as CSSProperties}>
 <SceneWorld project={project} active={active} paused={motionOff}/><WorldArtifacts key={`${project.id}-${active}`} project={project} active={active}/><div className="journey-veil" aria-hidden="true"/><Header paused={paused} reduced={reduced} onToggleMotion={onToggleMotion}/>
 <main ref={content} className="journey-content">{project.chapters.map((chapter,index)=><section key={chapter.id} id={`section-${index}`} ref={el=>{sections.current[index]=el;}} className={`journey-section ${chapter.id==='skills-tools'?'journey-finale':''}`} aria-label={`${index+1}. ${chapter.title}`}>
 {index===0?<a className="journey-back" href={family&&project.slug!=='experience'?`/worlds/${family.slug}`:'/'}><ArrowLeft size={14}/>{project.slug==='experience'?'World entrance':family?.name||'World entrance'}</a>:null}
 <p className="journey-kicker">{String(index+1).padStart(2,'0')} / {project.title}</p>
 {index===0?<h1>{chapter.title}</h1>:<h2>{chapter.title}</h2>}
 <p className="journey-lead">{chapter.body}</p><p className="journey-detail">{chapter.detail}</p>
 {chapter.insights?.length?<div className="journey-insights">{chapter.insights.map(insight=><div key={insight.label}><h3>{insight.label}</h3><p>{insight.body}</p></div>)}</div>:null}
 {chapter.metrics?.length?<div className="journey-metrics">{chapter.metrics.map(m=><div key={m.label}><strong>{m.value}</strong><span>{m.label}</span></div>)}</div>:null}
 {index===0?<><p className="journey-status">{project.status}</p><div className="journey-links" aria-label="Original project and evidence links">{project.links.map(l=><EvidenceLink key={l.url} url={l.url} label={l.label}/>)}</div></>:null}
 {chapter.id==='skills-tools'?<SkillsConstellation project={project}/>:null}
 <WorldArtifacts project={project} active={index} inline/>
 {index===project.chapters.length-1&&related.length?<div className="journey-related"><h3>Explore the connected work</h3>{related.map(p=><a key={p.id} href={`/projects/${p.slug}`}>{p.shortTitle}<ArrowUpRight size={15}/></a>)}</div>:null}
 </section>)}</main>
 <SectionRail chapters={project.chapters} active={active} onSelect={go} label={`${project.shortTitle} story sections`}/>
 <div className="journey-position"><button disabled={active===0} onClick={()=>go(active-1)} aria-label="Previous section"><ArrowLeft size={14}/><span>Previous</span></button><span>{String(active+1).padStart(2,'0')} / {String(project.chapters.length).padStart(2,'0')} · {project.shortTitle}</span><button disabled={active===project.chapters.length-1} onClick={()=>go(active+1)} aria-label="Next section"><span>Next</span><ArrowRight size={14}/></button></div>
 </div>;
}


