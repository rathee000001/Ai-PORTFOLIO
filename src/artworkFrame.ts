export type ArtworkFrame={columns:number;rows:number;index:number};
export function sourceFrame(width:number,height:number,frame?:ArtworkFrame){
 if(!frame)return {x:0,y:0,width,height};
 const {columns,rows,index}=frame;
 if(!Number.isInteger(columns)||!Number.isInteger(rows)||columns<1||rows<1||!Number.isInteger(index)||index<0||index>=columns*rows)throw new Error('Invalid artwork frame');
 return {x:index%columns*width/columns,y:Math.floor(index/columns)*height/rows,width:width/columns,height:height/rows};
}
