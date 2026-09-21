import {useEffect,useState} from 'react';
import projectData from './data/projects.json';
import type {Project} from './types';
import HomeGateway from './HomeGateway';
import {CategoryWorld} from './Gateway';
import {worldCategories,worldDestination} from './worldCategories';
import ExperienceStory,{SingleWorldRedirect} from './ExperienceStory';
import ProjectStory from './ProjectStory';
const projects=projectData as Project[];
export default function StoryRouter(){
 const [path,setPath]=useState(()=>location.pathname),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),[paused,setPaused]=useState(()=>{try{return localStorage.getItem('portfolio:motion:v1')==='paused';}catch{return false;}});
 useEffect(()=>{const pop=()=>setPath(location.pathname);window.addEventListener('popstate',pop);const media=matchMedia('(prefers-reduced-motion: reduce)');const changed=()=>setReduced(media.matches);media.addEventListener('change',changed);return()=>{window.removeEventListener('popstate',pop);media.removeEventListener('change',changed);};},[]);
 const toggle=()=>setPaused(value=>{try{localStorage.setItem('portfolio:motion:v1',!value?'paused':'running');}catch{/* optional preference */}return !value;});
 const shared={paused,reduced,onToggleMotion:toggle};const category=worldCategories.find(c=>path===`/worlds/${c.slug}`);const project=projects.find(p=>path===(p.slug==='experience'?'/experience':`/projects/${p.slug}`));
 useEffect(()=>{document.title=category?`${category.name} World — Praveen Rathee`:project?`${project.shortTitle} — Praveen Rathee`:'Ai PORTFOLIO — Praveen Rathee';},[category,project]);
 if(path==='/')return <HomeGateway projects={projects} {...shared}/>;
 if(category?.projectIds.length===1)return <SingleWorldRedirect to={worldDestination(category,projects)}/>;
 if(category)return <CategoryWorld category={category} projects={projects} {...shared}/>;
 if(project?.slug==='experience')return <ExperienceStory project={project} {...shared}/>;
 if(project?.asset)return <ProjectStory key={project.id} project={project} projects={projects} {...shared}/>;
 return <main style={{padding:'15vh 8vw',color:'#fff',background:'#102019',minHeight:'100vh'}}><h1>This world is not on the map.</h1><p>The project URL may have changed. All published portfolio routes are available from the entrance.</p><a href="/" style={{color:'#efc686'}}>Return to the worlds →</a></main>;
}


import './dimensionalControls.css';

import './mobileNavigationFix.css';

import './readabilityCorrections.css';
import './frostedStoryLayout.css';
