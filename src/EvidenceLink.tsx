import IllustratedIcon from './IllustratedIcon';
import {ArrowUpRight,Globe} from 'lucide-react';
import type {CSSProperties} from 'react';
import './evidenceLink.css';
function destination(url:string,label:string){const parsed=new URL(url);const host=parsed.hostname.toLowerCase();
 if(/guide|documentation|docs/i.test(label)||parsed.pathname.startsWith('/docs'))return{icon:'guide',color:'#c6dcf0',name:'Documentation'};
 if(host.includes('linkedin.com'))return{icon:'linkedin',color:'#8dc9ff',name:'LinkedIn'};
 if(host==='github.com'||host.endsWith('.github.io'))return{icon:'github',color:'#c1cfff',name:'GitHub'};
 if(host.endsWith('.vercel.app')||host==='evidencelane.org'||host==='www.evidencelane.org')return{icon:'vercel',color:'#c7e9ff',name:'Vercel'};
 if(host==='drive.google.com'||host==='docs.google.com')return{icon:'googledrive',color:'#a7dfb2',name:'Google Drive'};
 if(host.includes('tableau.com'))return{icon:'tableau',color:'#9ac9f2',name:'Tableau'};
 if(host==='youtu.be'||host.includes('youtube.com'))return{icon:'youtube',color:'#ff9a9a',name:'YouTube'};
 if(host.includes('devpost.com'))return{icon:'devpost',color:'#8bd6e5',name:'Devpost'};
 return{icon:null,color:'#b8e4c9',name:'Website'};
}
export default function EvidenceLink({url,label}:{url:string;label:string}){const d=destination(url,label);return <a className="glass-evidence-link" href={url} style={{'--link-color':d.color} as CSSProperties} title={`${label} · ${d.name}`}><span className="glass-evidence-orb" aria-hidden="true">{d.icon==='guide'?<IllustratedIcon index={8} size={25}/>:d.icon?<img src={`/tool-icons/${d.icon}.svg`} alt="" width="21" height="21"/>:<Globe size={20}/>}</span><span>{label}</span><ArrowUpRight size={13} className="glass-evidence-arrow"/></a>;}

