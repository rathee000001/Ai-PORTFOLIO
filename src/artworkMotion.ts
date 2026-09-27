import type {ArtworkFrame} from './artworkFrame';
export type ArtworkRegion={id:string;polygon:readonly (readonly [number,number])[];effect:'water'|'paper'|'light'|'mist'|'waterfall'|'pipeline'|'globe'|'page'|'network'|'stars'|'foliage'|'machine';amount:number;speed:number;feather:number;pivot?:readonly [number,number];radius?:number;phase?:number;baseGain?:number;material?:'neutral-mist'|'warm-mist'|'existing-stars'|'foliage'|'emissive'|'pond'};
export type ArtworkScene={source:string;regions:readonly ArtworkRegion[];frame?:ArtworkFrame;objectMotion?:'campaign-butterfly'|'supply-truck'};
const atlasRegions=(regions:ArtworkRegion[]):ArtworkRegion[]=>regions.map(r=>({...r,polygon:r.polygon.map(([x,y])=>[x*2,y*2] as const),amount:r.amount*2,feather:r.feather*2,...(r.pivot?{pivot:[r.pivot[0]*2,r.pivot[1]*2] as const}:{}),...(r.radius?{radius:r.radius*2}:{})}));
export function materialWeight(material:ArtworkRegion['material'],r:number,g:number,b:number){
 if(!material)return 1;const high=Math.max(r,g,b),low=Math.min(r,g,b),saturation=(high-low)/Math.max(1,high);
 if(material==='emissive')return Math.max(0,Math.min(1,(high-150)/80));
 if(material==='pond')return b>=g*.95||r>150&&r>g*1.1?1:0;
 if(material==='existing-stars')return Math.max(0,Math.min(1,(low-100)/130))*Math.max(0,Math.min(1,(.45-saturation)/.25));
 if(material==='warm-mist')return Math.max(0,Math.min(1,((r+g+b)/3-100)/45))*Math.max(0,Math.min(1,(.49-saturation)/.18));
 if(material==='foliage')return Math.max(0,Math.min(1,(g-b*1.3)/40))*Math.max(0,Math.min(1,(1.85-r/Math.max(1,g))/.65));
 return Math.max(0,Math.min(1,((r+g+b)/3-90)/80))*Math.max(0,Math.min(1,(.24-saturation)/.16));
}
export function regionWeight(polygon:ArtworkRegion['polygon'],x:number,y:number,feather:number){
 let inside=false,distance=Infinity;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const [ax,ay]=polygon[j],[bx,by]=polygon[i];
  if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
  const vx=bx-ax,vy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy||1)));
  distance=Math.min(distance,Math.hypot(x-ax-t*vx,y-ay-t*vy));
 }
 if(!inside)return 0;const value=Math.min(1,distance/Math.max(.01,feather));return value*value*(3-2*value);
}
export function prepareMotionClock(region:ArtworkRegion,time:number){const t=time*region.speed-(region.phase||0),sine=Math.sin(t),angle=sine*region.amount/(region.radius||70);return {t,sine,globeSin:Math.sin(angle),globeCos:Math.cos(angle)};}
export function localMotion(region:ArtworkRegion,x:number,y:number,time:number,weight:number,clock?:ReturnType<typeof prepareMotionClock>){
 if(weight===0)return {dx:0,dy:0,gain:1};
 const t=clock?.t??time*region.speed-(region.phase||0);
 if(region.effect==='machine')return {dx:Math.sin(t)*region.amount*weight,dy:Math.cos(t)*region.amount*.2*weight,gain:1};
 if(region.effect==='foliage'){const strength=Math.min(1,Math.hypot(x-(region.pivot?.[0]||x),y-(region.pivot?.[1]||y))/60);return {dx:Math.sin(t+y*.06)*region.amount*weight*strength,dy:Math.cos(t*.8+x*.04)*region.amount*.4*weight*strength,gain:1};}
 if(region.effect==='stars')return {dx:0,dy:0,gain:1+region.amount*Math.sin(t+Math.sin(x*.23+y*.77)*3)*weight};
 if(region.effect==='globe'){const [cx,cy]=region.pivot||[0,0],r=region.radius||70,nx=(x-cx)/r,ny=(y-cy)/r,z=Math.sqrt(Math.max(0,1-nx*nx-ny*ny)),angle=(clock?.sine??Math.sin(t))*region.amount/r;return {dx:Math.max(-region.amount,Math.min(region.amount,r*(nx*(clock?.globeCos??Math.cos(angle))+z*(clock?.globeSin??Math.sin(angle)))-r*nx))*weight,dy:0,gain:1};}
 if(region.effect==='page'){const distance=Math.max(-1,Math.min(1,(x-(region.pivot?.[0]||x))/60)),sine=clock?.sine??Math.sin(t);return {dx:sine*distance*region.amount*weight,dy:Math.abs(sine)*Math.abs(distance)*region.amount*.5*weight,gain:1};}
 if(region.effect==='network')return {dx:0,dy:0,gain:1+region.amount*(Math.pow(Math.max(0,clock?.sine??Math.sin(t)),3)-.25)*weight};
 if(region.effect==='water')return {dx:Math.sin(y*.55-t)*region.amount*weight,dy:Math.sin(x*.17+y*.09-t*.7)*region.amount*.18*weight,gain:1};
 if(region.effect==='paper')return {dx:(clock?.sine??Math.sin(t))*region.amount*weight,dy:Math.sin(t*.7)*region.amount*.3*weight,gain:1};
 if(region.effect==='mist')return {dx:Math.sin(y*.03-t*.35)*region.amount*weight,dy:Math.sin(x*.018-t*.2)*region.amount*.25*weight,gain:1};
 if(region.effect==='waterfall')return {dx:Math.sin(y*.21-t)*region.amount*.15*weight,dy:0,gain:1+.08*(.5+.5*Math.sin(y*.24-t*3))*weight};
 if(region.effect==='pipeline')return {dx:0,dy:0,gain:1+((region.baseGain??1)-1+region.amount*Math.pow(Math.max(0,Math.cos((x-600)/55-t)),8))*weight};
 return {dx:0,dy:0,gain:1+region.amount*(.5+.5*Math.sin(y*.06-t))*weight};
}
export const welcomeRegions:ArtworkRegion[]=[
 {id:'experience-river-above-bridge',polygon:[[632,427],[650,424],[671,427],[669,438],[638,439]],effect:'water',amount:1.15,speed:1.8,feather:2},
 {id:'experience-river-below-bridge',polygon:[[651,475],[670,478],[683,490],[680,511],[670,529],[666,518],[667,500]],effect:'water',amount:1.15,speed:1.8,feather:3},
 {id:'archive-existing-front-page',polygon:[[839,397],[864,395],[867,431],[845,435]],effect:'paper',amount:1.4,speed:.85,feather:3},
 {id:'archive-existing-lower-beam',polygon:[[817,488],[854,488],[855,548],[817,548]],effect:'light',amount:.12,speed:1.4,feather:6},
 {id:'supply-existing-water',polygon:[[1491,423],[1515,425],[1534,445],[1523,452],[1503,440]],effect:'water',amount:.8,speed:1.5,feather:3},
 {id:'forecasting-existing-globe',polygon:[[1040,352],[1064,357],[1086,375],[1104,401],[1103,429],[1084,456],[1055,473],[1028,470],[1002,455],[986,431],[982,406],[991,382],[1011,363]],effect:'globe',pivot:[1044,414],amount:3.6,speed:.22,feather:11},
 {id:'campaign-existing-left-book-page',polygon:[[1157,512],[1180,518],[1207,542],[1208,558],[1188,541],[1163,533]],effect:'page',pivot:[1208,551],amount:2.1,speed:.65,feather:3},
 {id:'campaign-existing-right-book-page',polygon:[[1210,539],[1241,515],[1259,520],[1241,538],[1212,558]],effect:'page',pivot:[1208,551],amount:2.1,speed:.65,feather:3},
 {id:'analysis-existing-input-node',polygon:[[1336,349],[1348,349],[1355,358],[1352,372],[1342,378],[1332,369]],effect:'network',amount:.32,speed:1.1,phase:0,feather:3},
 {id:'analysis-existing-central-node',polygon:[[1377,412],[1391,417],[1397,431],[1391,446],[1377,451],[1367,440],[1364,425]],effect:'network',amount:.27,speed:1.1,phase:1,feather:4},
 {id:'analysis-existing-output-node',polygon:[[1418,452],[1429,455],[1435,466],[1429,477],[1417,477],[1412,466]],effect:'network',amount:.32,speed:1.1,phase:2,feather:3},
 {id:'supply-existing-road-light',polygon:[[1480,419],[1498,414],[1517,416],[1535,423],[1526,432],[1507,440],[1511,452],[1536,463],[1534,472],[1500,458],[1499,438],[1524,425],[1494,422],[1484,428]],effect:'pipeline',amount:.25,speed:.9,feather:2}
];
export const artworkScenes={
 pluginResults:{source:'/worlds/plugin-scenes-a.png',frame:{columns:2,rows:2,index:3},regions:atlasRegions([
  {id:'plugin-results-original-overhead-world',polygon:[[532,27],[563,32],[591,53],[601,86],[592,120],[565,133],[530,127],[503,106],[495,74],[506,47]],effect:'globe',pivot:[549,80],radius:55,amount:1,speed:.2,feather:8},
  {id:'plugin-results-existing-downlight',polygon:[[530,131],[563,131],[571,181],[563,222],[537,226],[527,181]],effect:'light',amount:.12,speed:1.1,feather:6,material:'emissive'},
  {id:'plugin-results-original-central-world',polygon:[[569,255],[590,259],[606,276],[613,301],[598,319],[570,320],[550,305],[547,281],[555,264]],effect:'globe',pivot:[581,290],radius:34,amount:.8,speed:.23,feather:5},
  {id:'plugin-results-existing-document',polygon:[[482,245],[506,238],[507,319],[482,320]],effect:'paper',amount:.5,speed:.6,feather:4},
  {id:'plugin-results-existing-upper-card',polygon:[[555,177],[581,172],[582,225],[554,229]],effect:'network',amount:.14,speed:.8,phase:.5,feather:4},
  {id:'plugin-results-left-shelf-evidence',polygon:[[208,259],[273,276],[333,286],[393,293],[448,296],[448,313],[391,308],[330,302],[269,292],[206,275]],effect:'pipeline',amount:.18,speed:.85,feather:4,material:'emissive'},
  {id:'plugin-results-right-shelf-evidence',polygon:[[681,263],[734,246],[790,227],[828,213],[829,231],[794,243],[739,262],[685,279]],effect:'pipeline',amount:.18,speed:.85,feather:4,material:'emissive'},
  {id:'plugin-results-existing-base-reflection',polygon:[[476,385],[542,392],[603,392],[658,385],[664,397],[607,407],[541,405],[476,397]],effect:'network',amount:.14,speed:.8,phase:2,feather:4,material:'emissive'}
 ])},
 pluginBoundary:{source:'/worlds/plugin-scenes-a.png',frame:{columns:2,rows:2,index:2},regions:atlasRegions([
  {id:'plugin-boundary-existing-upper-beam',polygon:[[530,40],[558,38],[559,112],[533,111]],effect:'light',amount:.12,speed:1,feather:5,material:'emissive'},
  {id:'plugin-boundary-document-layer',polygon:[[316,121],[438,121],[437,335],[302,328]],effect:'paper',amount:.55,speed:.65,feather:8},
  {id:'plugin-boundary-existing-image-layer',polygon:[[470,174],[548,165],[548,312],[467,312]],effect:'network',amount:.12,speed:.85,phase:1,feather:5},
  {id:'plugin-boundary-existing-code-layer',polygon:[[585,211],[638,197],[638,305],[581,305]],effect:'light',amount:.13,speed:1,phase:2,feather:5},
  {id:'plugin-boundary-output-world',polygon:[[735,211],[750,216],[763,231],[770,250],[763,267],[749,277],[730,276],[715,264],[711,246],[720,224]],effect:'globe',pivot:[741,246],radius:31,amount:1,speed:.25,feather:5},
  {id:'plugin-boundary-output-beam',polygon:[[662,237],[706,235],[708,247],[663,250]],effect:'pipeline',amount:.24,speed:1.1,feather:3,material:'emissive'},
  {id:'plugin-boundary-document-base',polygon:[[348,345],[383,345],[392,359],[368,367],[340,358]],effect:'network',amount:.18,speed:1,phase:0,feather:3,material:'emissive'},
  {id:'plugin-boundary-image-base',polygon:[[487,326],[516,326],[528,338],[504,345],[481,338]],effect:'network',amount:.18,speed:1,phase:1,feather:3,material:'emissive'},
  {id:'plugin-boundary-code-base',polygon:[[603,322],[630,322],[635,332],[616,337],[597,331]],effect:'network',amount:.18,speed:1,phase:2,feather:3,material:'emissive'}
 ])},
 pluginSources:{source:'/worlds/plugin-scenes-a.png',frame:{columns:2,rows:2,index:1},regions:atlasRegions([
  {id:'plugin-sources-document-input',polygon:[[118,25],[190,48],[259,81],[333,110],[402,128],[478,130],[480,141],[400,141],[329,121],[252,93],[186,62],[116,38]],effect:'pipeline',amount:.25,speed:1.4,feather:3,material:'emissive'},
  {id:'plugin-sources-image-input',polygon:[[119,176],[173,185],[230,200],[294,217],[351,228],[406,237],[472,235],[476,248],[406,251],[346,240],[289,230],[227,213],[170,199],[117,189]],effect:'pipeline',amount:.25,speed:1.4,feather:3,material:'emissive'},
  {id:'plugin-sources-code-input',polygon:[[123,326],[174,311],[217,320],[295,329],[361,343],[407,346],[477,345],[478,358],[406,359],[358,356],[293,342],[217,333],[176,325],[125,340]],effect:'pipeline',amount:.25,speed:1.4,feather:3,material:'emissive'},
  {id:'plugin-sources-original-document',polygon:[[278,56],[302,64],[304,108],[277,102]],effect:'paper',amount:.65,speed:.7,phase:.8,feather:3},
  {id:'plugin-sources-original-image',polygon:[[249,191],[302,203],[308,260],[252,251]],effect:'paper',amount:.6,speed:.65,phase:1.6,feather:4},
  {id:'plugin-sources-original-code',polygon:[[273,306],[320,317],[318,367],[272,371]],effect:'paper',amount:.65,speed:.7,phase:2.2,feather:4},
  {id:'plugin-sources-document-output',polygon:[[558,83],[593,73],[596,138],[560,150]],effect:'light',amount:.12,speed:1.1,phase:1,feather:4},
  {id:'plugin-sources-image-output',polygon:[[570,207],[634,194],[635,267],[570,280]],effect:'light',amount:.12,speed:1.1,phase:1.8,feather:4},
  {id:'plugin-sources-code-output',polygon:[[552,324],[599,316],[604,390],[551,391]],effect:'light',amount:.12,speed:1.1,phase:2.6,feather:4}
 ])},
 pluginIntention:{source:'/worlds/plugin-scenes-a.png',frame:{columns:2,rows:2,index:0},regions:atlasRegions([
  {id:'plugin-intention-original-sphere',polygon:[[547,82],[583,83],[616,103],[635,133],[644,167],[637,199],[616,226],[581,244],[547,247],[515,232],[489,206],[478,172],[483,139],[503,108],[524,91]],effect:'globe',pivot:[561,164],radius:83,amount:1.1,speed:.3,feather:10},
  {id:'plugin-intention-existing-inner-core',polygon:[[544,145],[565,141],[582,159],[580,178],[565,190],[547,181],[540,164]],effect:'network',amount:.16,speed:1.1,feather:5,material:'emissive'},
  {id:'plugin-intention-existing-upper-trace',polygon:[[487,115],[505,88],[535,69],[569,60],[600,73],[622,91],[630,103],[619,108],[602,90],[570,76],[539,81],[513,98],[498,121]],effect:'pipeline',amount:.22,speed:1.1,feather:3,material:'emissive'},
  {id:'plugin-intention-existing-lower-trace',polygon:[[473,190],[493,207],[530,215],[565,211],[603,200],[639,183],[650,186],[634,202],[604,215],[565,227],[528,228],[490,220],[471,205]],effect:'pipeline',amount:.22,speed:1.1,feather:3,material:'emissive'},
  {id:'plugin-intention-pedestal-feed',polygon:[[541,249],[561,251],[579,246],[575,265],[563,280],[554,280],[547,268]],effect:'light',amount:.17,speed:1.3,feather:3,material:'emissive'},
  {id:'plugin-intention-original-pedestal-lights',polygon:[[499,287],[510,287],[506,326],[504,363],[494,364]],effect:'light',amount:.14,speed:1.3,feather:2,material:'emissive'},
  {id:'plugin-intention-existing-stair-reflection',polygon:[[449,406],[469,406],[466,435],[462,462],[444,462],[453,433]],effect:'light',amount:.12,speed:1.3,feather:4,material:'emissive'}
 ])},
 categorySupply:{source:'/worlds/home-hershey-world.png',objectMotion:'supply-truck',regions:[
  {id:'supply-category-river',polygon:[[639,282],[713,282],[765,295],[817,311],[889,321],[950,326],[948,346],[911,360],[852,351],[808,336],[755,320],[694,311],[650,301]],effect:'water',amount:1.7,speed:1.6,feather:7},
  {id:'supply-category-conveyor',polygon:[[1030,341],[1099,341],[1092,314],[1091,289],[1108,272],[1099,268],[1075,289],[1055,313]],effect:'machine',amount:.35,speed:8,feather:3},
  {id:'supply-category-farm-to-factory',polygon:[[770,448],[786,416],[833,390],[917,369],[966,347],[977,319],[958,290],[949,280],[961,277],[987,310],[988,340],[970,361],[921,380],[838,401],[797,423],[784,451]],effect:'pipeline',amount:.32,baseGain:.92,speed:1.2,feather:3,material:'emissive'},
  {id:'supply-category-ingredient-route',polygon:[[1050,449],[1042,430],[1045,411],[1069,391],[1108,381],[1143,390],[1183,412],[1226,435],[1252,443],[1244,453],[1216,445],[1176,422],[1137,400],[1108,393],[1076,402],[1056,419],[1057,433],[1064,444]],effect:'pipeline',amount:.3,baseGain:.92,speed:1.2,feather:3,material:'emissive'},
  {id:'supply-category-distribution-route',polygon:[[1193,294],[1216,315],[1264,332],[1322,349],[1359,374],[1377,396],[1380,414],[1371,435],[1359,434],[1367,413],[1363,395],[1352,381],[1315,360],[1257,344],[1207,326],[1186,302]],effect:'pipeline',amount:.32,baseGain:.92,speed:1.2,feather:3,material:'emissive'},
  {id:'supply-category-cocoa-leaves',polygon:[[616,339],[645,332],[681,348],[703,376],[674,385],[649,370],[623,362]],effect:'foliage',amount:1.5,speed:1.1,feather:5,pivot:[650,380],material:'foliage'},
  {id:'supply-category-factory-lights',polygon:[[781,221],[998,219],[1003,271],[784,265]],effect:'network',amount:.13,speed:.7,phase:1,feather:6,material:'emissive'}
 ] as ArtworkRegion[]},
 categoryAnalysis:{source:'/worlds/sec-world.png',regions:[
  {id:'analysis-category-source-ledger',polygon:[[720,455],[774,456],[802,506],[846,539],[880,553],[806,550],[771,520],[743,485]],effect:'light',amount:.24,speed:1.2,feather:5},
  {id:'analysis-category-linked-ledger',polygon:[[855,458],[902,459],[930,505],[974,535],[1025,553],[944,550],[906,525],[880,488]],effect:'light',amount:.24,speed:1.2,phase:1,feather:5},
  {id:'analysis-category-ratio-ledger',polygon:[[983,470],[1023,474],[1057,510],[1094,535],[1141,551],[1075,551],[1033,530],[1009,501]],effect:'light',amount:.24,speed:1.2,phase:2,feather:5},
  {id:'analysis-category-comparison-ledger',polygon:[[1116,464],[1152,466],[1180,509],[1222,539],[1271,552],[1196,552],[1161,529],[1138,497]],effect:'light',amount:.24,speed:1.2,phase:3,feather:5},
  {id:'analysis-category-limitations-ledger',polygon:[[1234,483],[1267,486],[1295,513],[1342,541],[1388,553],[1321,551],[1278,530],[1254,505]],effect:'light',amount:.24,speed:1.2,phase:4,feather:5},
  {id:'analysis-category-document-output',polygon:[[837,587],[879,587],[880,643],[837,643]],effect:'network',amount:.3,speed:1.2,phase:3,feather:4,material:'emissive'},
  {id:'analysis-category-table-output',polygon:[[989,585],[1040,585],[1040,638],[989,638]],effect:'network',amount:.3,speed:1.2,phase:3.5,feather:4,material:'emissive'},
  {id:'analysis-category-chart-output',polygon:[[1152,584],[1195,584],[1195,635],[1152,635]],effect:'network',amount:.3,speed:1.2,phase:4,feather:4,material:'emissive'},
  {id:'analysis-category-limitations-output',polygon:[[1307,585],[1353,585],[1353,634],[1307,634]],effect:'network',amount:.3,speed:1.2,phase:4.5,feather:4,material:'emissive'},
  {id:'analysis-category-existing-chart',polygon:[[1343,400],[1373,382],[1405,373],[1429,356],[1450,349],[1475,321],[1502,308],[1503,443],[1343,443]],effect:'pipeline',amount:.3,baseGain:.94,speed:1.2,feather:4},
  {id:'analysis-category-globe-surface',polygon:[[1610,374],[1652,379],[1670,398],[1670,514],[1643,536],[1599,540],[1560,522],[1534,492],[1526,452],[1543,412],[1574,386]],effect:'globe',pivot:[1610,456],radius:86,amount:1.5,speed:.18,feather:14},
  {id:'analysis-category-existing-lantern',polygon:[[1451,600],[1469,600],[1476,632],[1466,645],[1447,641],[1443,619]],effect:'network',amount:.14,speed:1.5,phase:1,feather:5,material:'emissive'}
 ] as ArtworkRegion[]},
 categoryCampaign:{source:'/worlds/book-fairies-world.png',objectMotion:'campaign-butterfly',regions:[
  {id:'campaign-category-left-book-page',polygon:[[592,178],[656,195],[719,225],[771,280],[809,456],[824,526],[766,496],[688,487],[610,491]],effect:'page',pivot:[835,535],amount:2.5,speed:.45,feather:12},
  {id:'campaign-category-right-book-page',polygon:[[799,269],[857,247],[970,235],[1013,235],[1032,367],[1089,486],[1015,483],[926,491],[846,524]],effect:'page',pivot:[835,535],amount:2.5,speed:.45,feather:12},
  {id:'campaign-category-pond-reflections',polygon:[[1358,666],[1430,647],[1526,638],[1615,651],[1614,697],[1532,725],[1448,750],[1343,765],[1261,754],[1266,711]],effect:'water',amount:2.1,speed:1.5,feather:9,material:'pond'},
  {id:'campaign-category-lower-pond',polygon:[[1215,782],[1247,776],[1289,791],[1332,814],[1324,837],[1240,842],[1210,818]],effect:'water',amount:1.7,speed:1.4,feather:7,material:'pond'},
  {id:'campaign-category-book-foliage',polygon:[[481,385],[512,363],[543,378],[566,414],[576,452],[548,475],[504,456],[484,425]],effect:'foliage',pivot:[527,460],amount:1.8,speed:1.1,feather:7,material:'foliage'},
  {id:'campaign-category-garden-foliage',polygon:[[1060,551],[1102,530],[1148,549],[1161,578],[1136,606],[1097,597],[1068,580]],effect:'foliage',pivot:[1120,602],amount:1.6,speed:1.2,feather:7,material:'foliage'},
  {id:'campaign-category-existing-book-light-trail',polygon:[[781,256],[821,226],[877,209],[926,224],[953,242],[941,257],[892,231],[849,237],[806,263]],effect:'pipeline',amount:.32,baseGain:.9,speed:1.1,feather:4,material:'emissive'},
  {id:'campaign-category-existing-garden-light-trail',polygon:[[997,253],[1075,289],[1156,351],[1244,410],[1360,454],[1462,491],[1468,509],[1350,471],[1234,429],[1146,369],[1062,306],[996,272]],effect:'pipeline',amount:.3,baseGain:.9,speed:1.1,feather:5,material:'emissive'},
  {id:'campaign-category-existing-tent-lights',polygon:[[1478,308],[1532,300],[1565,325],[1563,367],[1528,382],[1485,365]],effect:'network',amount:.12,speed:.7,phase:1,feather:6,material:'emissive'}
 ] as ArtworkRegion[]},
 categoryForecast:{source:'/worlds/home-gna-world.png',regions:[
  {id:'forecast-category-original-globe',polygon:[[1003,185],[1071,198],[1138,246],[1179,314],[1180,386],[1142,454],[1080,504],[1008,518],[938,492],[876,445],[845,377],[847,308],[886,243],[941,201]],effect:'globe',pivot:[1012,352],radius:172,amount:4,speed:.19,feather:15},
  {id:'forecast-category-gold-input',polygon:[[624,179],[650,179],[732,214],[831,272],[879,298],[860,314],[746,269],[650,235],[621,211]],effect:'pipeline',amount:.34,baseGain:.88,speed:1.35,feather:5,material:'emissive'},
  {id:'forecast-category-magenta-input',polygon:[[640,271],[699,277],[794,305],[930,337],[1015,368],[986,375],[885,350],[777,330],[666,317],[635,306]],effect:'pipeline',amount:.35,baseGain:.88,speed:1.35,feather:5,material:'emissive'},
  {id:'forecast-category-white-input',polygon:[[653,368],[703,360],[809,366],[927,370],[994,385],[967,397],[835,392],[737,410],[661,409],[641,392]],effect:'pipeline',amount:.28,baseGain:.87,speed:1.35,feather:5,material:'emissive'},
  {id:'forecast-category-lower-gold-input',polygon:[[662,438],[752,418],[847,400],[972,389],[1003,399],[897,420],[801,458],[717,489],[659,493],[643,480]],effect:'pipeline',amount:.34,baseGain:.88,speed:1.35,feather:5,material:'emissive'},
  {id:'forecast-category-existing-lens-signals',polygon:[[1171,287],[1237,286],[1305,281],[1384,294],[1409,315],[1411,369],[1390,403],[1308,414],[1236,405],[1173,399]],effect:'pipeline',amount:.32,baseGain:.9,speed:1.35,feather:7,material:'emissive'},
  {id:'forecast-category-existing-output-fan',polygon:[[1406,322],[1507,256],[1611,183],[1615,440],[1522,400],[1406,366]],effect:'pipeline',amount:.25,baseGain:.91,speed:1.35,feather:8,material:'emissive'},
  {id:'forecast-category-existing-observatory',polygon:[[1540,522],[1563,507],[1590,508],[1610,526],[1618,556],[1540,556]],effect:'network',amount:.18,speed:.8,phase:2,feather:5,material:'emissive'}
 ] as ArtworkRegion[]},
 welcome:{source:'/worlds/home-six-ordered.png',regions:welcomeRegions},
 about:{source:'/worlds/home-section-open.png',regions:[
  {id:'about-existing-mist-between-rocks',polygon:[[1044,578],[1055,582],[1064,586],[1080,589],[1088,595],[1087,602],[1073,600],[1065,595],[1058,590],[1050,586]],effect:'mist',amount:3.2,speed:1.1,feather:4,material:'warm-mist'},
  {id:'about-existing-low-mist',polygon:[[1086,605],[1096,601],[1107,605],[1117,615],[1111,625],[1101,625],[1093,617]],effect:'mist',amount:3.4,speed:1,feather:4,material:'warm-mist'},
  {id:'about-existing-stars-above-planet',polygon:[[1099,67],[1208,45],[1301,45],[1408,82],[1440,109],[1417,127],[1327,103],[1226,100],[1137,116],[1094,101]],effect:'stars',amount:.3,speed:.65,feather:9,material:'existing-stars'}
 ] as ArtworkRegion[]},
 follow:{source:'/worlds/home-section-follow.png',regions:[
  {id:'follow-existing-waterfall',polygon:[[886,339],[901,338],[900,371],[892,405],[880,411],[885,377]],effect:'waterfall',amount:1.1,speed:1.4,feather:3,material:'neutral-mist'},
  {id:'follow-existing-cloud-bank',polygon:[[860,424],[887,413],[907,432],[939,448],[969,443],[1009,454],[1024,480],[1004,501],[958,490],[922,467],[883,458]],effect:'mist',amount:3.8,speed:1.05,feather:9,material:'neutral-mist'},
  {id:'follow-existing-lower-cloud',polygon:[[1209,624],[1235,615],[1262,632],[1297,617],[1332,590],[1355,590],[1338,633],[1295,662],[1241,680],[1212,665]],effect:'mist',amount:4,speed:.95,feather:10,material:'neutral-mist'},
  {id:'follow-existing-canopy-leaves',polygon:[[763,104],[801,111],[817,132],[839,153],[844,180],[817,202],[802,224],[776,221],[759,202]],effect:'foliage',amount:1.7,speed:1.5,feather:6,pivot:[760,160],material:'foliage'}
 ] as ArtworkRegion[]},
 evidence:{source:'/worlds/home-section-evidence.png',regions:[
  {id:'evidence-existing-central-falls',polygon:[[1124,489],[1147,488],[1136,522],[1120,551],[1105,564],[1111,539]],effect:'waterfall',amount:1.1,speed:1.3,feather:3,material:'neutral-mist'},
  {id:'evidence-existing-upper-clouds',polygon:[[908,346],[935,334],[952,346],[977,333],[1007,350],[1015,367],[988,379],[945,371],[918,386],[899,376]],effect:'mist',amount:3.5,speed:1,feather:8,material:'neutral-mist'},
  {id:'evidence-existing-lower-clouds',polygon:[[1267,586],[1291,576],[1323,584],[1352,576],[1371,590],[1359,612],[1322,634],[1275,632],[1256,615]],effect:'mist',amount:3.7,speed:.9,feather:9,material:'neutral-mist'},
  {id:'evidence-existing-right-falls',polygon:[[1321,539],[1338,538],[1332,556],[1321,574],[1310,579],[1314,563]],effect:'waterfall',amount:.9,speed:1.2,feather:3,material:'neutral-mist'},
  {id:'evidence-existing-window-tree-leaves',polygon:[[760,363],[797,357],[833,377],[849,399],[829,425],[798,422],[769,402]],effect:'foliage',amount:1.6,speed:1.35,feather:6,pivot:[780,432],material:'foliage'}
 ] as ArtworkRegion[]},
 categoryAI:{source:'/worlds/home-plugin-violet.png',regions:[
  {id:'plugin-existing-upper-source-lines',polygon:[[594,258],[639,255],[731,287],[814,335],[879,355],[889,380],[838,374],[761,344],[682,299],[601,276]],effect:'pipeline',baseGain:.88,amount:.48,speed:1.6,feather:5},
  {id:'plugin-existing-middle-source-lines',polygon:[[596,367],[679,371],[749,381],[821,369],[883,357],[891,382],[824,395],[753,408],[668,402],[595,401]],effect:'pipeline',baseGain:.88,amount:.48,speed:1.6,feather:5},
  {id:'plugin-existing-lower-source-lines',polygon:[[620,508],[683,504],[732,461],[782,411],[838,392],[888,382],[889,414],[836,419],[796,442],[750,488],[693,525],[631,532]],effect:'pipeline',baseGain:.88,amount:.48,speed:1.6,feather:5},
  {id:'plugin-existing-document-layer',polygon:[[895,353],[984,340],[993,487],[889,480]],effect:'paper',amount:1.5,speed:.65,feather:9},
  {id:'plugin-existing-gate-input',polygon:[[997,390],[1048,399],[1109,402],[1119,418],[1064,433],[1003,429]],effect:'pipeline',baseGain:.88,amount:.45,speed:1.6,feather:5},
  {id:'plugin-existing-gate-output-beam',polygon:[[1171,408],[1279,409],[1281,427],[1171,426]],effect:'pipeline',baseGain:.88,amount:.42,speed:1.6,feather:4}
,
  {id:'category-ai-output-world',polygon:[[1340,365],[1366,370],[1383,389],[1388,417],[1378,447],[1357,461],[1334,457],[1318,439],[1311,413],[1320,383]],effect:'globe',pivot:[1350,414],radius:47,amount:2.4,speed:.25,feather:8},
  {id:'category-ai-blue-layer-top',polygon:[[1284,329],[1379,318],[1403,328],[1403,342],[1380,334],[1288,346]],effect:'network',amount:.2,speed:1.1,phase:1,feather:3},
  {id:'category-ai-blue-layer-bottom',polygon:[[1277,496],[1376,505],[1421,496],[1423,511],[1386,524],[1281,514]],effect:'network',amount:.2,speed:1.1,phase:2.5,feather:3}
 ] as ArtworkRegion[]},
 pluginOpening:{source:'/worlds/home-plugin-violet.png',regions:[
  {id:'plugin-existing-upper-source-lines',polygon:[[594,258],[639,255],[731,287],[814,335],[879,355],[889,380],[838,374],[761,344],[682,299],[601,276]],effect:'pipeline',amount:.48,speed:1.6,feather:5},
  {id:'plugin-existing-middle-source-lines',polygon:[[596,367],[679,371],[749,381],[821,369],[883,357],[891,382],[824,395],[753,408],[668,402],[595,401]],effect:'pipeline',amount:.48,speed:1.6,feather:5},
  {id:'plugin-existing-lower-source-lines',polygon:[[620,508],[683,504],[732,461],[782,411],[838,392],[888,382],[889,414],[836,419],[796,442],[750,488],[693,525],[631,532]],effect:'pipeline',amount:.48,speed:1.6,feather:5},
  {id:'plugin-existing-document-layer',polygon:[[895,353],[984,340],[993,487],[889,480]],effect:'paper',amount:1.5,speed:.65,feather:9},
  {id:'plugin-existing-gate-input',polygon:[[997,390],[1048,399],[1109,402],[1119,418],[1064,433],[1003,429]],effect:'pipeline',amount:.45,speed:1.6,feather:5},
  {id:'plugin-existing-gate-output-beam',polygon:[[1171,408],[1279,409],[1281,427],[1171,426]],effect:'pipeline',amount:.42,speed:1.6,feather:4},
  {id:'plugin-opening-original-code-card',polygon:[[718,354],[762,362],[762,412],[716,408]],effect:'paper',amount:1,speed:.7,phase:.6,feather:4},
  {id:'plugin-opening-original-source-document',polygon:[[672,214],[703,218],[707,266],[669,258]],effect:'paper',amount:1.2,speed:.65,phase:1.4,feather:4},
  {id:'plugin-opening-original-output-world',polygon:[[1340,365],[1366,370],[1383,389],[1388,417],[1378,447],[1357,461],[1334,457],[1318,439],[1311,413],[1320,383]],effect:'globe',pivot:[1350,414],radius:47,amount:2.4,speed:.25,feather:8},
  {id:'plugin-opening-original-blue-layer',polygon:[[1284,329],[1379,318],[1403,328],[1403,342],[1380,334],[1288,346]],effect:'network',amount:.22,speed:1.1,phase:1,feather:3},
  {id:'plugin-opening-original-output-base',polygon:[[1277,496],[1376,505],[1421,496],[1423,511],[1386,524],[1281,514]],effect:'network',amount:.22,speed:1.1,phase:2.5,feather:3}
 ] as ArtworkRegion[]},
 experienceCity:{source:'/worlds/gias-city.png',regions:[
  {id:'city-upper-channel',polygon:[[772,212],[805,219],[815,242],[838,254],[858,276],[856,306],[878,326],[917,341],[934,353],[920,366],[880,363],[856,345],[837,324],[835,290],[820,276],[804,250],[785,237]],effect:'water',amount:1.25,speed:1.35,feather:7},
  {id:'city-left-river',polygon:[[95,269],[178,263],[258,252],[334,245],[367,247],[373,271],[343,286],[320,306],[322,328],[309,348],[281,345],[248,322],[224,314],[187,308],[156,319],[119,303]],effect:'water',amount:1.45,speed:1.4,feather:8},
  {id:'city-right-plaza-channel',polygon:[[1126,393],[1172,390],[1221,388],[1288,378],[1319,381],[1302,405],[1278,426],[1215,442],[1151,449],[1126,433]],effect:'water',amount:1.45,speed:1.4,feather:7},
  {id:'city-below-right-bridge',polygon:[[1144,491],[1193,490],[1235,501],[1239,522],[1226,544],[1212,565],[1196,582],[1177,568],[1148,550],[1110,532],[1119,509]],effect:'water',amount:1.5,speed:1.4,feather:7},
  {id:'city-central-river',polygon:[[809,638],[862,623],[976,624],[1040,647],[1019,682],[913,706],[846,682]],effect:'water',amount:1.8,speed:1.4,feather:8},
  {id:'city-downstream-river',polygon:[[1167,762],[1231,759],[1308,790],[1324,823],[1433,827],[1513,846],[1520,913],[1376,913],[1267,861]],effect:'water',amount:1.8,speed:1.4,feather:10},
  {id:'city-existing-west-bridge-lights',polygon:[[526,477],[612,473],[723,472],[723,486],[611,488],[531,490]],effect:'pipeline',amount:.18,baseGain:.96,speed:.85,feather:3,material:'emissive'},
  {id:'city-existing-east-bridge-lights',polygon:[[1118,453],[1202,449],[1291,445],[1292,459],[1204,462],[1120,468]],effect:'pipeline',amount:.18,baseGain:.96,speed:.85,feather:3,material:'emissive'}
 ]},
 experienceRecords:{source:'/worlds/gias-scenes.png',frame:{columns:2,rows:2,index:0},regions:atlasRegions([
  {id:'records-river',polygon:[[224,430],[308,400],[357,379],[394,385],[431,406],[502,438],[502,459],[268,461]],effect:'water',amount:1,speed:1.5,feather:5},
  {id:'records-existing-sheet',polygon:[[109,65],[143,65],[156,102],[126,105]],effect:'paper',amount:1,speed:.7,feather:3},
  {id:'records-existing-front-sheet',polygon:[[188,107],[220,119],[229,156],[196,145]],effect:'paper',amount:1.1,speed:.65,phase:.9,feather:3},
  {id:'records-existing-middle-sheet',polygon:[[299,224],[320,223],[341,244],[316,250]],effect:'paper',amount:1,speed:.7,phase:1.5,feather:3},
  {id:'records-existing-near-model-sheet',polygon:[[445,207],[463,214],[466,237],[447,229]],effect:'paper',amount:.9,speed:.65,phase:2.1,feather:2},
  {id:'records-existing-input-paths',polygon:[[155,156],[285,191],[387,220],[530,260],[527,278],[379,241],[280,214],[156,177]],effect:'pipeline',amount:.3,speed:1.4,feather:4,material:'emissive'},
  {id:'records-existing-lower-input-paths',polygon:[[199,256],[276,249],[357,235],[426,245],[520,269],[518,279],[423,256],[357,246],[278,260],[200,266]],effect:'pipeline',amount:.3,speed:1.4,feather:3,material:'emissive'},
  {id:'records-model-glass-edges',polygon:[[580,206],[637,207],[638,261],[614,269],[580,259]],effect:'network',amount:.18,speed:1,phase:2,feather:4,material:'emissive'}
 ])},
 experienceStakeholders:{source:'/worlds/gias-scenes.png',frame:{columns:2,rows:2,index:1},regions:atlasRegions([
  {id:'stakeholder-river',polygon:[[118,236],[180,225],[212,236],[191,260],[152,270],[117,261]],effect:'water',amount:1,speed:1.3,feather:4},
  {id:'stakeholder-left-channel',polygon:[[21,269],[45,257],[71,257],[90,273],[118,279],[123,286],[94,301],[57,305],[23,315]],effect:'water',amount:.8,speed:1.35,feather:4},
  {id:'stakeholder-upper-channel',polygon:[[393,215],[426,207],[454,219],[474,227],[477,240],[453,249],[423,245],[400,232]],effect:'water',amount:.75,speed:1.3,feather:4},
  {id:'stakeholder-existing-decision-path',polygon:[[477,302],[510,319],[545,353],[600,313],[641,307],[646,320],[608,332],[570,371],[541,371],[501,335],[473,319]],effect:'pipeline',amount:.25,speed:1.1,feather:4,material:'emissive'},
  {id:'stakeholder-existing-bridge-lights',polygon:[[237,259],[280,241],[328,220],[377,203],[394,203],[386,214],[331,231],[282,253],[242,269]],effect:'pipeline',amount:.22,speed:1,feather:3,material:'emissive'},
  {id:'stakeholder-commercial-model',polygon:[[584,192],[602,193],[604,286],[616,300],[598,304],[585,287]],effect:'network',amount:.2,speed:.9,phase:1,feather:3,material:'emissive'},
  {id:'stakeholder-property-grid',polygon:[[632,358],[682,346],[716,356],[704,386],[662,391],[631,379]],effect:'network',amount:.18,speed:.9,phase:2.4,feather:3,material:'emissive'}
 ])},
 experienceReporting:{source:'/worlds/gias-scenes.png',frame:{columns:2,rows:2,index:2},regions:atlasRegions([
  {id:'reporting-existing-glass-bars',polygon:[[593,180],[618,180],[618,318],[598,320]],effect:'light',amount:.09,speed:.7,feather:4},
  {id:'reporting-tall-glass-bar',polygon:[[735,116],[772,116],[772,276],[745,295],[731,293]],effect:'light',amount:.12,speed:.8,phase:1.5,feather:4},
  {id:'reporting-middle-glass-bar',polygon:[[688,145],[724,145],[725,270],[704,301],[686,296]],effect:'light',amount:.12,speed:.8,phase:.8,feather:4},
  {id:'reporting-window-river',polygon:[[228,177],[251,173],[278,185],[301,192],[296,205],[258,200],[235,191]],effect:'water',amount:.6,speed:1.4,feather:4},
  {id:'reporting-window-central-water',polygon:[[328,184],[351,183],[375,193],[401,201],[409,211],[394,215],[369,207],[343,205],[327,195]],effect:'water',amount:.65,speed:1.35,feather:3},
  {id:'reporting-table-connected-paths',polygon:[[308,367],[357,346],[395,331],[438,317],[483,314],[485,323],[439,326],[401,341],[363,356],[314,378]],effect:'pipeline',amount:.22,speed:1.1,feather:3,material:'emissive'},
  {id:'reporting-table-output-path',polygon:[[492,419],[510,402],[547,381],[585,357],[617,341],[622,349],[590,367],[553,392],[517,411],[498,429]],effect:'pipeline',amount:.22,speed:1.1,feather:3,material:'emissive'}
 ])},
 experienceOutcome:{source:'/worlds/gias-scenes.png',frame:{columns:2,rows:2,index:3},regions:atlasRegions([
  {id:'outcome-existing-river',polygon:[[388,300],[425,292],[460,302],[478,322],[451,341],[415,338],[388,321]],effect:'water',amount:.8,speed:1.3,feather:4},
  {id:'outcome-upper-river',polygon:[[95,154],[129,145],[159,151],[173,168],[160,185],[125,186],[94,174]],effect:'water',amount:.7,speed:1.2,feather:4},
  {id:'outcome-left-river-bend',polygon:[[200,191],[221,193],[250,203],[282,207],[301,224],[306,239],[286,246],[263,226],[231,218],[207,214]],effect:'water',amount:.7,speed:1.3,feather:4},
  {id:'outcome-downstream-water',polygon:[[561,368],[594,369],[625,382],[668,390],[700,416],[684,433],[645,414],[609,404],[580,392]],effect:'water',amount:.8,speed:1.3,feather:4},
  {id:'outcome-existing-left-bridge',polygon:[[228,251],[276,248],[321,246],[352,244],[352,252],[320,255],[275,257],[230,260]],effect:'pipeline',amount:.2,speed:1,feather:2,material:'emissive'},
  {id:'outcome-existing-right-bridge',polygon:[[509,253],[552,249],[607,247],[609,254],[553,258],[512,261]],effect:'pipeline',amount:.2,speed:1,feather:2,material:'emissive'},
  {id:'outcome-existing-foreground-record',polygon:[[173,398],[186,385],[224,392],[225,399],[208,407],[187,406]],effect:'paper',amount:.5,speed:.6,feather:3}
 ])},
 experienceFinale:{source:'/worlds/gias-finale.png',regions:[
  {id:'finale-window-water',polygon:[[887,531],[928,519],[979,532],[1027,526],[1057,552],[1043,566],[975,568],[908,560]],effect:'water',amount:1.1,speed:1.2,feather:6},
  {id:'finale-window-upper-river',polygon:[[867,294],[882,296],[898,311],[917,319],[919,343],[936,354],[952,365],[944,386],[922,386],[901,370],[884,346],[881,325]],effect:'water',amount:1.1,speed:1.3,feather:5},
  {id:'finale-window-east-channel',polygon:[[1090,391],[1121,393],[1152,390],[1186,391],[1194,407],[1178,420],[1147,425],[1106,425],[1076,419]],effect:'water',amount:1.2,speed:1.3,feather:5},
  {id:'finale-existing-glass-chart',polygon:[[1314,588],[1330,588],[1330,546],[1357,546],[1357,530],[1407,530],[1407,506],[1434,506],[1434,626],[1314,622]],effect:'light',amount:.12,speed:.8,feather:5},
  {id:'finale-existing-chart-output',polygon:[[1466,516],[1486,511],[1487,636],[1464,636]],effect:'light',amount:.12,speed:.8,phase:1.2,feather:4},
  {id:'finale-table-model-connections',polygon:[[940,679],[1002,663],[1074,650],[1155,644],[1215,653],[1209,665],[1148,657],[1081,664],[1008,677],[947,691]],effect:'pipeline',amount:.2,speed:1,feather:4,material:'emissive'},
  {id:'finale-existing-hanging-leaves',polygon:[[1456,75],[1481,71],[1508,88],[1514,127],[1499,155],[1508,183],[1490,209],[1465,229],[1452,215],[1465,184],[1461,153],[1471,127],[1450,108]],effect:'foliage',amount:1.2,speed:1.1,feather:5,pivot:[1491,81],material:'foliage'}
 ]}
} as const;
export function originalMotionProfile(project:string,chapter:string):keyof typeof artworkScenes|undefined{
 if(project==='evidence-lane-plugin'&&chapter==='chapter-4')return 'pluginResults';
 if(project==='evidence-lane-plugin'&&chapter==='chapter-3')return 'pluginBoundary';
 if(project==='evidence-lane-plugin'&&chapter==='chapter-2')return 'pluginSources';
 if(project==='evidence-lane-plugin'&&chapter==='chapter-1')return 'pluginIntention';
 if(project==='evidence-lane-plugin'&&(chapter==='chapter-0'||chapter==='opening-evidence'))return 'pluginOpening';
 if(project!=='experience')return undefined;
 const profiles:Record<string,keyof typeof artworkScenes>={'workflow-commercial-review':'experienceRecords','workflow-service':'experienceReporting','chapter-0':'experienceCity','opening-evidence':'experienceCity','chapter-1':'experienceRecords','chapter-2':'experienceStakeholders','chapter-3':'experienceReporting','chapter-4':'experienceOutcome','skills-tools':'experienceFinale'};
 return profiles[chapter];
}
