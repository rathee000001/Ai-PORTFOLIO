import IllustratedIcon from './IllustratedIcon';
import {useMemo,useState} from 'react';
import {Search,Boxes,ArrowRight,CheckCheck} from 'lucide-react';
import type {Project} from './types';
import iconCatalog from './data/toolIconCatalog.json';
import {skillDefinitions} from './skillDefinitions';
import './skillExplorer.css';
type Entry={id:string;name:string;group:string;groups:string[];definition:string;usage:string;related:{label:string;body:string}[]};
const canonical=(name:string)=>name.toLowerCase().replace(/\(programming language\)|\(software\)/g,'').replace(/[^a-z0-9]/g,'');
const terms:Record<string,{pattern:RegExp;definition:string}>={
 api:{pattern:/api|mcp|sdk|connector|http|transport|request/i,definition:'A contract that lets software components exchange requests and results.'},
 data:{pattern:/data|sql|table|pandas|numpy|parquet|json|csv|etl|schema/i,definition:'Methods and tools for structuring, moving, validating and querying information.'},
 model:{pattern:/model|forecast|regression|xgboost|pytorch|arima|statsmodel|feature|scikit|neural/i,definition:'An analytical method or modeling tool used to represent relationships and evaluate results.'},
 source:{pattern:/source|research|document|pdf|ocr|parse|extract|citation/i,definition:'Methods and tools for finding, reading and attributing the evidence used in the work.'},
 governance:{pattern:/govern|review|valid|risk|qual|test|check|security|accept|integrity/i,definition:'Controls that make decisions, quality checks, permissions and limitations explicit.'},
 workflow:{pattern:/workflow|process|plan|operation|requirement|business|stakeholder|management/i,definition:'A way to translate a business question into requirements, coordinated work and usable decisions.'},
 web:{pattern:/react|next|html|css|javascript|typescript|three|interface|dashboard|visual|vercel|github/i,definition:'Technology or design work that makes the project usable, navigable and inspectable.'}
};
function matching(name:string,p:Project){const tokens=name.toLowerCase().replace(/\([^)]*\)/g,'').split(/[^a-z0-9]+/).filter(t=>t.length>3&&!['analysis','management','software','programming'].includes(t));return(p.skills||[]).map(s=>({...s,score:tokens.reduce((n,t)=>n+((s.label+' '+s.description).toLowerCase().includes(t)?1:0),0)})).filter(s=>s.score>0).sort((a,b)=>b.score-a.score).slice(0,3).map(s=>({label:s.label,body:s.description}));}
function entriesFor(p:Project){const entries:Entry[]=[];const seen=new Set<string>();
 const add=(name:string,group:string,usage:string,definition?:string,related?:Entry['related'])=>{const id=canonical(name);if(seen.has(id)){const existing=entries.find(e=>e.id===id)!;if(!existing.groups.includes(group))existing.groups.push(group);if(existing.usage!==usage&&!existing.related.some(r=>r.body===usage))existing.related.push({label:group==='Dependencies'?'Role in the registered toolchain':'Associated implementation',body:usage});return;}seen.add(id);const kind=Object.values(terms).find(k=>k.pattern.test(name));entries.push({id,name,group,groups:[group],usage,definition:definition||skillDefinitions[id]||kind?.definition||'A specific capability or tool connected to the project’s implementation and review.',related:related||matching(name,p)});};
 for(const t of p.tools||[])add(t.name,'Tools',t.purpose);
 for(const name of p.linkedSkills||[]){const related=matching(name,p);add(name,'Skills',related.length?related[0].body:`This skill is associated with ${p.shortTitle} on the professional profile. The project story and implementation capabilities provide the context for that association.`,undefined,related);const entry=entries.find(e=>e.id===canonical(name))!;if(/^(python|typescript|javascript|react|next\.js|three\.js|pytorch|xgboost|scikit-learn|pandas|numpy|statsmodels|sqlite|sql|tableau|microsoft excel|html|cascading style|github|llamaindex)/i.test(name)&&!entry.groups.includes('Tools'))entry.groups.push('Tools');}
 for(const s of p.skills||[])add(s.label,'Implementation',s.description,s.label.startsWith('Earlier implementation:')?'A capability from an earlier reviewed implementation, retained here as development history.':undefined,[{label:'Applied in this project',body:s.description}]);
 for(const group of p.toolchainGroups||[])for(const tool of group.tools)add(tool.name,'Dependencies',tool.description,`Part of the ${group.name.toLowerCase()} toolchain. Catalogue presence describes scope; actual readiness is checked for the selected operation.`,[]);
 return entries;
}
function logo(name:string){const key=canonical(name);const catalog=iconCatalog as Record<string,string>;return catalog[key]||null;}
function Orb({name,large=false}:{name:string;large?:boolean}){const src=logo(name);return <span className={`explorer-orb ${large?'explorer-orb-large':''}`} aria-hidden="true">{src?<img src={src} alt="" width={large?42:25} height={large?42:25}/>:<IllustratedIcon name={name} size={large?55:36}/>}</span>;}
export default function SkillExplorer({project}:{project:Project}){const entries=useMemo(()=>entriesFor(project),[project]);const [query,setQuery]=useState(''),[filter,setFilter]=useState('All'),[selected,setSelected]=useState(entries[0]?.id);const groups=['All','Skills','Tools','Implementation',...(project.toolchainGroups?.length?['Dependencies']:[])];const visible=entries.filter(e=>(filter==='All'||e.groups.includes(filter))&&`${e.name} ${e.usage}`.toLowerCase().includes(query.toLowerCase()));const chosen=visible.find(e=>e.id===selected)||visible[0];
 return <section className={`skill-explorer explorer-${project.world}`} aria-label={`${project.shortTitle} skills and tools explorer`}>
 <div className="explorer-instruction"><Boxes size={19}/><p>Select a skill or tool to see what it is and how it connects to this project. Search or scroll the collection to explore more.</p></div>
 {project.scopeMetrics?<div className="explorer-scope">{project.scopeMetrics.map(m=><div key={m.label}><strong>{m.value}</strong><span>{m.label}</span></div>)}</div>:null}
 <div className="explorer-controls"><label><Search size={17}/><span className="sr-only">Search project skills and tools</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a skill, tool or dependency…"/></label><div className="explorer-filters" aria-label="Filter skill collection">{groups.map(g=><button key={g} onClick={()=>setFilter(g)} aria-pressed={filter===g}>{g}<small>{g==='All'?entries.length:entries.filter(e=>e.groups.includes(g)).length}</small></button>)}</div></div>
 <div className="explorer-workspace"><div className="explorer-collection" aria-label="Scrollable skill and tool collection" tabIndex={0}>{visible.map(e=><button key={e.id} className="explorer-choice" aria-pressed={chosen?.id===e.id} onClick={()=>setSelected(e.id)} aria-controls={`skill-detail-${project.slug}`}><Orb name={e.name}/><span><strong>{e.name}</strong><small>{e.groups.join(" · ")}</small></span><ArrowRight size={14}/></button>)}{!visible.length?<p className="explorer-empty">No matching items. Try a broader term or choose All.</p>:null}</div>
 {chosen?<article id={`skill-detail-${project.slug}`} className="explorer-detail" aria-live="polite" aria-atomic="true"><header><Orb name={chosen.name} large/><div><p>{project.shortTitle} · {chosen.group}</p><h3>{chosen.name}</h3></div></header><div className="explorer-explanation"><h4>What it is</h4><p>{chosen.definition}</p><h4>How it appears in this project</h4><p>{chosen.usage}</p></div>{chosen.related.length?<div className="explorer-proof"><h4><CheckCheck size={17}/> Connected implementation</h4>{chosen.related.map(r=><div key={r.label}><strong>{r.label}</strong><p>{r.body}</p></div>)}</div>:null}<p className="explorer-basis">{chosen.group==='Dependencies'?'Registered toolchain assignment. Installation and operation-specific readiness are separate checks.':chosen.group==='Skills'?project.skillBasis:'Project-source and profile-evaluation mapping.'}</p></article>:null}</div></section>;
}




