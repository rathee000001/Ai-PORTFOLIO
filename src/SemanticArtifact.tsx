import type {CSSProperties} from 'react';
import type {Chapter,Project,ArtifactVisual} from './types';
import definitions from './data/artifactVisuals.json';
import IllustratedIcon from './IllustratedIcon';
import './semanticArtifact.css';
type ObjectItem=NonNullable<Chapter['objects']>[number];
export type ArtifactDefinition=ArtifactVisual;
export const artifactDefinition=(key?:string)=>(definitions as Record<string,ArtifactDefinition>)[key||''];
const worlds:Record<string,[string,number]>={experience:['a',0],'evidence-lane-plugin':['a',1],'evidence-lane-app':['a',2],'gold-nexus-alpha':['a',3],'gold-regression':['b',0],'gold-excel-tableau':['b',1],'chapters-for-change':['b',2],'book-fairies':['b',3],dataco:['c',0],'sec-analysis':['c',1],'meta-case':['c',2],hershey:['c',3]};
const f=[{h:1,low:4413.1298,mid:4553.7469,high:4667.6344},{h:5,low:4239.2555,mid:4502.6712,high:4803.0725},{h:10,low:4304.3651,mid:4557.7944,high:4861.8700},{h:20,low:4263.9960,mid:4468.2768,high:4715.8444},{h:30,low:4229.9844,mid:4487.9569,high:4816.4076}];
const point=(h:number,y:number)=>`${12+(h-1)/29*128},${76-(y-4200)/700*66}`;
export default function SemanticArtifact({object,project}:{object:ObjectItem;project:Project;index?:number}){const d=object.visualData||artifactDefinition(object.visual);if(!d)return null;const text=d.content.map(c=>Array.isArray(c)?c.join(' · '):c);const rows=d.content.filter(Array.isArray) as (string|number)[][];
 if(d.type==='world'){const [sheet,frame]=worlds[project.slug];return <span className="semantic-world" aria-hidden="true" style={{backgroundImage:`url('/worlds/project-objects-${sheet}.png')`,backgroundPosition:`${frame%2*100}% ${Math.floor(frame/2)*100}%`} as CSSProperties}/>;}
 if(d.type==='sprite')return <span className="semantic-sculpture" aria-hidden="true"><IllustratedIcon index={d.frame} sheet={d.sheet} size={126}/></span>;
 if(d.type==='orb')return <span className="semantic-intent" aria-hidden="true"><i/><b/><span>{text[0]}</span><small>{text.slice(1).join(' · ')}</small></span>;
 if(d.type==='files'){const kinds=project.slug==='hershey'?['report','table','research','receipt']:object.visual==='pdf-source'?['pdf','image','ocr','locator']:['word','excel','pdf','git'];return <span className="semantic-files" aria-hidden="true">{text.map((label,i)=><span key={label} className={`file-kind-${kinds[i]}`}>{['word','excel','git'].includes(kinds[i])?<img src={`/tool-icons/${({word:'microsoftword',excel:'microsoftexcel',git:'git'} as Record<string,string>)[kinds[i]]}.svg`} alt=""/>:<span className={`file-format-preview format-${kinds[i]}`}><strong>{({pdf:'PDF',image:'IMG',ocr:'OCR',locator:'PAGE',report:'REPORT',table:'DATA',research:'SOURCE',receipt:'RECEIPT'} as Record<string,string>)[kinds[i]]}</strong><i/><i/><i/></span>}<b>{label}</b></span>)}</span>;}
 if(d.type==='books')return <span className="semantic-books" aria-hidden="true">{text.map((label,i)=><span key={label} style={{'--spine':i} as CSSProperties}>{label}</span>)}</span>;
 if(d.type==='api')return <span className="semantic-api" aria-hidden="true">{object.visual==='api-contract'?<img src="/tool-icons/modelcontextprotocol.svg" alt=""/>:object.visual==='native-bridge'?<img src="/tool-icons/tauri.svg" alt=""/>:null}<b>{d.title}</b><span className="semantic-ports"><i/><i/><i/></span><small>{text.join(' / ')}</small></span>;
 if(d.type==='lock')return <span className="semantic-lock" aria-hidden="true"><i/><b>β</b><small>{text[0]}</small></span>;
 return <span className={`semantic-asset semantic-${({table:'sheet',comparison:'compare-view',timeline:'timeline-view'} as Record<string,string>)[d.type]||d.type} ${['property-table','excel-report','spreadsheet-source','coefficient-sheet','prediction-sheet','ratio-sheet','tableau-report'].includes(object.visual||'')?'semantic-office-sheet':''}`} aria-hidden="true"><span className="semantic-title">{d.title}</span>
 {d.type==='table'?<span className="semantic-table" style={{'--columns':d.headers?.length||3} as CSSProperties}>{d.headers?.map(h=><b key={h}>{h}</b>)}{rows.flatMap((row,i)=>row.map((cell,j)=><i key={`${i}-${j}`}>{cell}</i>))}</span>:null}
 {d.type==='code'?<><span className="semantic-window-dots"><i/><i/><i/></span><code>{object.sourceSnippet||text.join('\n')}</code><small>{object.sourceName||'Documented structure'}</small></>:null}
 {d.type==='board'||d.type==='glass-stack'?<span className="semantic-tiles">{text.map((item,i)=><i key={item} style={{'--tile':i} as CSSProperties}>{item}</i>)}</span>:null}
 {d.type==='comparison'||d.type==='fan'?<span className="semantic-comparison">{text.map((item,i)=><i key={item} style={{'--tile':i} as CSSProperties}><b>{String(i+1).padStart(2,'0')}</b>{item}</i>)}</span>:null}
 {d.type==='timeline'?<span className="semantic-timeline">{text.map((item,i)=><i key={item} style={{'--tile':i} as CSSProperties}>{item}</i>)}</span>:null}
 {d.type==='period'?<span className="semantic-period-content"><b>{text[0]}</b><small>{text[1]}</small></span>:null}
 {d.type==='formula'?<span className="semantic-formula-content">{text.map((item,i)=><i key={item} className={i===0?'formula-primary':''}>{item}</i>)}</span>:null}
 {d.type==='metrics'?<span className="semantic-metrics-content">{rows.map(([value,label])=><i key={String(label)}><b>{value}</b><small>{label}</small></i>)}</span>:null}
 {d.type==='bars'?<span className="semantic-bars-content">{rows.map(([label,value])=><i key={String(label)}><b style={{height:`${Number(value)/25*64}px`}}/><span>{value}{d.unit}</span><small>{label}</small></i>)}</span>:null}
 {d.type==='forecast'?<svg className="semantic-forecast-plot" viewBox="0 0 156 92"><path d="M7 7V80H148" fill="none" stroke="#b2c6df"/><polygon points={[...f.map(p=>point(p.h,p.high)),...[...f].reverse().map(p=>point(p.h,p.low))].join(' ')} fill="#84b9e747"/><polyline points={f.map(p=>point(p.h,p.mid)).join(' ')} fill="none" stroke="#f5ce75" strokeWidth="2.5"/></svg>:null}
 {d.type==='interval'?<span className="semantic-interval-content">{text.map((item,i)=><i key={item} style={{'--tile':i} as CSSProperties}>{item}</i>)}</span>:null}
 {['notes','review','passport','document','receipt'].includes(d.type)?<span className="semantic-record-content">{text.map((item,i)=><i key={item}><b>{String(i+1).padStart(2,'0')}</b>{item}</i>)}</span>:null}
 {d.type==='browser'?<><span className="semantic-address">{project.links.find(l=>/Live|prototype|Existing/.test(l.label))?.url.replace('https://','').slice(0,36)||'Project presentation'}</span><span className="semantic-page-content"><i/>{text.map(item=><b key={item}>{item}</b>)}</span></>:null}
 {d.type==='form'?<span className="semantic-form-content">{text.map(item=><i key={item}><small>{item}</small><b/></i>)}</span>:null}
 {d.type==='rank'?<span className="semantic-rank-content">{text.map((item,i)=><i key={item}><b>{i+1}</b>{item}</i>)}</span>:null}
 {d.type==='map'?<span className="semantic-map-content"><i/><i/><i/>{text.map(item=><b key={item}>{item}</b>)}</span>:null}
 {d.caption?<span className="semantic-caption">{d.caption}</span>:null}
 </span>;
}
