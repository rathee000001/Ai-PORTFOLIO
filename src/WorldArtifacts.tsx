import ArtifactPreview, {artifactDefinition} from './SemanticArtifact';
import ArtifactFacts from './ArtifactFacts';
import {useState} from 'react';

import type {Project} from './types';
import './worldArtifacts.css';

export default function WorldArtifacts({project,active,inline=false}:{project:Project;active:number;inline?:boolean}){const [selected,setSelected]=useState(0);const chapter=project.chapters[active];const objects=chapter.objects||[];if(!objects.length)return null;const index=Math.min(selected,objects.length-1);const current=objects[index];const detailId=`scene-object-${project.slug}-${active}-${inline?'inline':'desktop'}`;
 return <section className={`world-workbench ${inline?'world-workbench-inline':''} workbench-${project.world} composition-${chapter.composition?.layout||'hero'}`} data-object-count={objects.length} aria-label="Explore the work in this scene"><div className="workbench-objects">{objects.map((object,i)=>{return <button key={object.name} className={`workbench-object object-${object.kind}`} aria-label={object.name} aria-pressed={i===index} onClick={()=>setSelected(i)} aria-controls={detailId}><span className="artifact-visual-slot"><ArtifactPreview object={object} project={project} index={i}/></span><strong>{object.name}</strong><small>{(object.visualData||artifactDefinition(object.visual))?.title}</small></button>;})}</div><div className="workbench-readout" id={detailId} aria-live="polite" tabIndex={0} aria-label="Selected object details"><p>{chapter.scene?.artifacts?.[0]?.label||'Inside this part of the work'}</p><h3>{current.name}</h3><span>{current.detail}</span><ArtifactFacts visual={current.visual} definition={current.visualData}/>{current.sourceSnippet?<div className="workbench-source"><strong>{current.sourceName}</strong><pre>{current.sourceSnippet}</pre></div>:null}<div className="workbench-fields">{current.fields.map(field=><span key={field}>{field}</span>)}</div></div><p className="workbench-hint">Select an object to follow its role in the work.</p></section>;
}





import './sectionCompositions.css';

