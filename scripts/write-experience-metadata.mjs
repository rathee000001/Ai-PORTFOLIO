import fs from 'node:fs';
const project=JSON.parse(fs.readFileSync('src/data/projects.json','utf8')).find(p=>p.slug==='experience');
if(!project?.metadata?.title||!project.metadata.description)throw new Error('Experience metadata is required');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
let html=fs.readFileSync('dist/index.html','utf8');
html=html.replace(/<title>[^]*?<\/title>/,'<title>'+escape(project.metadata.title)+'</title>');
for(const [attribute,key,value] of [['name','description',project.metadata.description],['property','og:title',project.metadata.title],['property','og:description',project.metadata.description]]){
 const pattern=new RegExp('<meta '+attribute+'="'+key+'"[^>]*>');if(!pattern.test(html))throw new Error('Missing template metadata '+key);html=html.replace(pattern,'<meta '+attribute+'="'+key+'" content="'+escape(value)+'"/>');
}
html=html.replace('</head>','<link rel="canonical" href="https://ai-portfolio-kohl-beta.vercel.app/experience"/><meta property="og:url" content="https://ai-portfolio-kohl-beta.vercel.app/experience"/></head>');
fs.mkdirSync('dist/experience',{recursive:true});fs.writeFileSync('dist/experience/index.html',html);console.log('Generated direct-route Experience metadata.');
