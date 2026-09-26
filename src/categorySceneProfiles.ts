import type {artworkScenes} from './artworkMotion';
export function categoryMotionProfile(category:{slug:string;asset:string}):keyof typeof artworkScenes|undefined{
 if(category.slug==='ai-workflows'&&category.asset==='/worlds/home-plugin-violet.png')return 'categoryAI';
 if(category.slug==='forecasting'&&category.asset==='/worlds/home-gna-world.png')return 'categoryForecast';
 if(category.slug==='campaigns'&&category.asset==='/worlds/book-fairies-world.png')return 'categoryCampaign';
 if(category.slug==='analysis'&&category.asset==='/worlds/sec-world.png')return 'categoryAnalysis';
 if(category.slug==='operations-supply-chain'&&category.asset==='/worlds/home-hershey-world.png')return 'categorySupply';
 return undefined;
}
