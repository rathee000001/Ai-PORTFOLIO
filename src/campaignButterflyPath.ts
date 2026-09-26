const ease=(t:number)=>t*t*(3-2*t);
/** Source-image route: the existing butterfly approaches the flower immediately below it. */
export function campaignButterflyPose(time:number){
 const phase=((time%18)+18)%18;let x=0,y=0,tilt=0,state='hover';
 if(phase<3){x=Math.sin(phase*Math.PI*2/3)*2;y=Math.sin(phase*Math.PI*4/3)*1.5;}
 else if(phase<7){const t=(phase-3)/4,e=ease(t);x=-27*e+Math.sin(t*Math.PI)*4;y=28*e-Math.sin(t*Math.PI)*8;tilt=-.08*e;state='approaching-flower';}
 else if(phase<10){x=-27;y=28;tilt=-.08;state='on-flower';}
 else if(phase<14){const t=(phase-10)/4,e=ease(t);x=-27*(1-e)+Math.sin(t*Math.PI)*4;y=28*(1-e)-Math.sin(t*Math.PI)*10;tilt=-.08*(1-e);state='returning';}
 else{x=Math.sin((phase-14)*Math.PI/2)*2;y=Math.sin((phase-14)*Math.PI)*1.5;}
 return {x,y,wing:1-(state==='on-flower'?.06:.18)*Math.pow(Math.sin(time*(state==='on-flower'?1.5:4.5)),2),tilt,state};
}
