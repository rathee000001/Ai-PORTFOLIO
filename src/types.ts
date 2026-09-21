export type SceneArtifact = {label:string;kind:'file'|'table'|'chart'|'record'|'plan'|'code';detail:string};
export type ArtifactVisual = {type:string;title:string;content:(string|(string|number)[])[];headers?:string[];sheet?:'skills'|'domain';frame?:number;caption?:string;unit?:string};
export type Chapter = { id: string; title: string; body: string; motion: string; detail: string; insights?:{label:string;body:string}[]; metrics?:{value:string;label:string}[]; camera?:{zoom:number;x:number;y:number}; linkLabels?:string[]; composition?:{id:string;layout:string};objects?:{name:string;visual?:string;visualData?:ArtifactVisual;kind:'file'|'record'|'table'|'chart'|'database'|'network'|'plan'|'code'|'api'|'check'|'book'|'package'|'map';format:string;detail:string;fields:string[];sourceName?:string;sourceSnippet?:string}[];scene?:{asset:string;aspect?:number;frame?:number;columns?:number;rows?:number;artifacts?:SceneArtifact[]} };
export type Project = { id: string; slug: string; shortTitle: string; title: string; headline: string; family: string; accent: string; background: string; secondary: string; world: string; status: string; concept: string; asset?:string; sceneAtlas?:string; description: string; limits: string; chapters: Chapter[]; links: { label: string; url: string }[]; skills?:{label:string;description:string;evidenceId:string}[]; tools?:{icon:string;name:string;purpose:string}[];skillNote?:string;linkedSkills?:string[];skillBasis?:string;scopeMetrics?:{value:string;label:string}[];toolchainGroups?:{name:string;tools:{name:string;description:string}[]}[] };






