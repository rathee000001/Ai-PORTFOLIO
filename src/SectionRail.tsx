import type {Chapter} from './types';
import './sectionRail.css';
export default function SectionRail({chapters,active,onSelect,label}:{chapters:Chapter[];active:number;onSelect:(index:number)=>void;label:string}){
 return <nav className="section-rail" aria-label={label}>{chapters.map((chapter,index)=><button key={chapter.id} type="button" onClick={()=>onSelect(index)} aria-label={`${index+1}. ${chapter.title}`} aria-current={active===index?'step':undefined}><span className="section-rail-number">{String(index+1).padStart(2,'0')}</span><span className="section-rail-mark" aria-hidden="true"/><span className="section-rail-name" aria-hidden="true">{chapter.title}</span></button>)}</nav>;
}
