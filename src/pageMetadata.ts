import type {Project} from './types';
export function applyPageMetadata(project:Project|undefined,title:string){
 document.title=project?.metadata?.title||title;
 const description=project?.metadata?.description||'Praveen Rathee — business analysis, forecasting, AI workflows and evidence-led project stories.';
 const ogDescription=project?.metadata?.description||'Explore business analysis, forecasting, AI workflows and supply-chain research through connected project stories and original evidence.';
 for(const [selector,content] of [['meta[name="description"]',description],['meta[property="og:title"]',project?.metadata?.title||'Ai PORTFOLIO — Praveen Rathee'],['meta[property="og:description"]',ogDescription]])document.querySelector(selector)?.setAttribute('content',content);
 const canonical=document.querySelector<HTMLLinkElement>('link[rel="canonical"]');if(canonical)canonical.href='https://ai-portfolio-kohl-beta.vercel.app'+location.pathname;
 document.querySelector('meta[property="og:url"]')?.setAttribute('content','https://ai-portfolio-kohl-beta.vercel.app'+location.pathname);
}
