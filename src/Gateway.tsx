import HomeIdentity from './HomeIdentity';
import {useEffect,useState} from 'react';
import type {CSSProperties} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight,Pause,Play} from 'lucide-react';
import NavOrb from './NavOrb';
import type {Project} from './types';
import {worldCategories} from './worldCategories';
import type {WorldCategory} from './worldCategories';
import './gateway.css';
type Shared={paused:boolean;reduced:boolean;onToggleMotion:()=>void;showHomeCharacter?:boolean};
export { Header };
function Header({paused,reduced,onToggleMotion,showHomeCharacter=false}:Shared){return <header className="gate-header">{location.pathname==='/'?<HomeIdentity still={paused||reduced} showCharacter={showHomeCharacter}/>:<span className="gate-identity-space" aria-hidden="true"/>}<nav aria-label="World navigation"><a href="/#categories" title="Return to the six clickable world portals"><NavOrb kind="earth" still={paused||reduced}/> World entrance</a><a href="/#home-1" title="Read about Praveen and the approach behind the work"><NavOrb kind="person" still={paused||reduced}/> About Praveen</a></nav><button onClick={onToggleMotion} aria-label={reduced?'Reduced motion':paused?'Resume motion':'Pause motion'} aria-pressed={paused||reduced} disabled={reduced}>{paused||reduced?<Play size={16}/>:<Pause size={16}/>}<span>{reduced?'Reduced motion':paused?'Resume motion':'Pause motion'}</span></button></header>;}
export function Gateway(props:Shared){
 const [departing,setDeparting]=useState<string|null>(null);
 useEffect(()=>{if(window.location.hash.startsWith('#world-')){history.replaceState({},'','/');window.scrollTo({top:0,behavior:'instant'});}},[]);
 const enter=(event:React.MouseEvent<HTMLAnchorElement>,category:WorldCategory)=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();setDeparting(category.slug);window.setTimeout(()=>{window.location.href=`/worlds/${category.slug}`;},props.paused||props.reduced?0:650);};
 return <div className={`gate ${departing?'gate-departing':''} ${props.paused||props.reduced?'gate-still':''}`}><div className="gate-setting" aria-hidden="true"/><Header {...props}/><main className="gate-introduction"><p className="gate-kicker">PRAVEEN RATHEE · A CONNECTED PORTFOLIO</p><h1>From business<br/>questions to<br/><em>inspectable work.</em></h1><p className="gate-bio">I’m Praveen Rathee—a business analyst with property-operations experience and an MBA in Operations & Supply Chain Management. My projects span forecasting, AI workflows, supply-chain research, strategy and interactive communication.</p><p className="gate-instruction"><strong>Choose a world. Then choose a project.</strong><br/>Each project opens its own universe. Scroll there to follow its story, inspect the evidence and open the original work.</p><a className="gate-start" href="#categories">Choose your world <ArrowRight size={18}/></a><div className="gate-profile-links"><a href="https://www.linkedin.com/in/praveen-rathee-8b028030b/" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={13}/></a><a href="https://github.com/rathee000001" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={13}/></a></div></main><nav id="categories" className="gate-categories" aria-label="Enter a category world">{worldCategories.map((category,i)=><a key={category.slug} href={`/worlds/${category.slug}`} onClick={e=>enter(e,category)} style={{'--world-color':category.color,'--world-number':i} as CSSProperties}><span className="gate-orbit" aria-hidden="true"><i/><b/></span><strong>{category.name}</strong><small>{category.projectIds.length===1?'Explore experience':`${category.projectIds.length} project worlds`}</small><ArrowUpRight size={16}/></a>)}</nav><div className="gate-footer"><span>Experience and projects retain their own stories.</span><span>World → Project → Story & evidence</span></div></div>;
}
export function CategoryWorld({category,projects,...props}:Shared&{category:WorldCategory;projects:Project[]}){
 const members=category.projectIds.map(id=>projects.find(p=>p.id===id)!).filter(Boolean);
 return <div className={`category-world ${props.paused||props.reduced?'gate-still':''}`} style={{'--world-color':category.color,'--world-art':`url("${category.asset}")`} as CSSProperties}><div className="category-setting" aria-hidden="true"/><Header {...props}/><main><div className="category-intro"><a className="category-back" href="/"><ArrowLeft size={15}/> Back to the entry worlds</a><p className="gate-kicker">CATEGORY WORLD</p><h1>{category.name}</h1><p>{category.description}</p><p className="category-guide">Select a project node to enter its dedicated story. Its opening section links to the original website, repository or project files.</p></div><div className={`project-constellation nodes-${members.length}`} aria-label={`${category.name} project worlds`}>{members.map((project,i)=><article className="constellation-node" key={project.id} style={{'--node-color':project.accent,'--node-position':i} as CSSProperties}><a className="project-planet" href={`/projects/${project.slug}`} aria-label={`Open ${project.shortTitle} story`}><span style={{backgroundImage:`url("${project.asset||project.concept}")`}}/><i/><ArrowUpRight size={25}/></a><p>{project.status}</p><h2><a href={`/projects/${project.slug}`}>{project.shortTitle}</a></h2><div className="node-summary">{project.description}</div></article>)}</div></main></div>;
}






