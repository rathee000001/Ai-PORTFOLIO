import type {CSSProperties} from 'react';

import type {Project} from './types';

import './sceneWorld.css';

export default function SceneWorld({project,active,paused}:{project:Project;active:number;paused:boolean}){
 const chapter=project.chapters[active];
 return <div className={`scene-world ${paused?'scene-world-still':''} ${chapter.id==='skills-tools'?'scene-world-skills':''}`} data-scene={chapter.id}>
 {project.chapters.map((c,i)=>{const scene=c.scene;const cols=scene?.columns||1,rows=scene?.rows||1;const frame=scene?.frame||0,aspect=scene?.aspect||16/9;return <div key={c.id} className={`scene-view ${i===active?'scene-view-active':''}`} aria-hidden="true"><div className="scene-view-frame" style={{width:`max(100vw,${aspect*100}vh)`,height:`max(${100/aspect}vw,100vh)`,'--scene-image':`url("${scene?.asset||project.asset}")`,'--scene-columns':cols,'--scene-rows':rows,'--scene-col':frame%cols,'--scene-row':Math.floor(frame/cols)} as CSSProperties}/></div>;})}


 </div>;
}

