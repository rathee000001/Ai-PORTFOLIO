export const worldCategories=[
 {slug:'experience',name:'Experience',description:'Business analysis, property operations and recurring management reporting.',projectIds:['02-business-analyst'],asset:'/worlds/gias-city.png',color:'#ebc195',point:[.54,.55]},
 {slug:'ai-workflows',name:'AI Workflows',description:'The Evidence Lane Plugin and its earlier desktop App: two distinct project generations.',projectIds:['03-evidence-lane-plugin','04-evidence-lane-app'],asset:'/worlds/home-plugin-violet.png',color:'#c9a9ff',point:[.71,.55]},
 {slug:'forecasting',name:'Forecasting',description:'Gold Nexus Alpha leads a family of three forecasting and analytical projects.',projectIds:['05-gold-nexus-alpha','06-gold-regression','07-gold-excel-tableau'],asset:'/worlds/home-gna-world.png',color:'#ebc577',point:[.81,.54]},
 {slug:'campaigns',name:'Campaigns',description:'Literacy campaign strategy and the interactive supporter-journey prototype.',projectIds:['08-chapters-for-change','09-book-fairies'],asset:'/worlds/book-fairies-world.png',color:'#e8bdd0',point:[.88,.53]},
 {slug:'analysis',name:'Analysis',description:'Financial modeling and organizational-behavior case analysis.',projectIds:['11-sec-analysis','12-meta-case'],asset:'/worlds/sec-world.png',color:'#c2ccec',point:[.94,.52]},
 {slug:'operations-supply-chain',name:'Operations & Supply Chain',description:'Hershey’s public-evidence supply chain study and the independent DataCo Tableau analysis.',projectIds:['13-hershey','10-dataco'],asset:'/worlds/home-hershey-world.png',color:'#d6c191',point:[.87,.78]}
];
export type WorldCategory=typeof worldCategories[number];
export function worldDestination(category:WorldCategory,projects:{id:string;slug:string}[]):string {
 if(category.projectIds.length!==1)return `/worlds/${category.slug}`;
 const project=projects.find(p=>p.id===category.projectIds[0]);
 return project?project.slug==='experience'?'/experience':`/projects/${project.slug}`:`/worlds/${category.slug}`;
}

