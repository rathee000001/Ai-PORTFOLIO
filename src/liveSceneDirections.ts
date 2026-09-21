export type LiveKind='archive'|'engine'|'forecast'|'prism'|'workbook'|'campaign'|'garden'|'logistics'|'filings'|'forum'|'factory'|'city'|'gallery';
export type LiveDirection={kind:LiveKind;x:number;y:number;scale:number;pace:number};
const sequence:Record<string,LiveKind[]>={
 experience:['city','workbook','city','forum','workbook','filings','forum'],
 'evidence-lane-plugin':['archive','forum','archive','archive','engine','filings','engine','archive','filings','engine'],
 'evidence-lane-app':['engine','archive','engine','filings','engine','archive','engine','engine'],
 'gold-nexus-alpha':['forecast','archive','forecast','workbook','prism','forecast','archive','forecast','workbook'],
 'gold-regression':['prism','workbook','prism','prism','forecast','forecast','filings','workbook'],
 'gold-excel-tableau':['workbook','workbook','workbook','prism','forecast','workbook','filings','workbook'],
 'chapters-for-change':['campaign','forum','campaign','forum','campaign','filings','garden','forum'],
 'book-fairies':['garden','garden','garden','campaign','garden','forecast','engine','garden'],
 dataco:['logistics','workbook','logistics','city','logistics','workbook','filings','logistics'],
 'sec-analysis':['filings','filings','filings','workbook','forecast','filings','filings','workbook'],
 'meta-case':['forum','forum','forum','forum','city','forum','filings','forum'],
 hershey:['factory','garden','factory','archive','filings','logistics','workbook','city','archive','factory']
};
// Each section has a semantic activity assignment. Opening scenes keep the focal world unobscured.
export function sceneDirection(slug:string,section:number):LiveDirection{const kinds=sequence[slug]||['gallery'];return{kind:kinds[section]||kinds[0],x:slug==='gold-regression'?68:slug==='experience'?73:74,y:slug==='hershey'?62:51,scale:section===0?1:.78,pace:slug==='book-fairies'?15:slug==='evidence-lane-app'?8:11};}
export const homeDirections:LiveDirection[]=[{kind:'gallery',x:72,y:48,scale:1,pace:14},{kind:'garden',x:76,y:52,scale:1,pace:18},{kind:'city',x:74,y:60,scale:.9,pace:15},{kind:'garden',x:74,y:52,scale:1,pace:17}];
