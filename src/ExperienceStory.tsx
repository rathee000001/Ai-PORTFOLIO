import {useEffect} from 'react';
import ProjectStory from './ProjectStory';
import type {Project} from './types';
export default function ExperienceStory(props:{project:Project;paused:boolean;reduced:boolean;onToggleMotion:()=>void}){return <ProjectStory {...props} projects={[props.project]}/>;}
export function SingleWorldRedirect({to}:{to:string}){useEffect(()=>{window.location.replace(to);},[to]);return <a href={to}>Opening the experience story…</a>;}
