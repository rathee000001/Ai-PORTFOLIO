export function createArtworkPatch(width:number,height:number){
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const context=canvas.getContext('2d');if(!context)throw new Error('Canvas 2D is unavailable');
 return {canvas,context};
}
/** Transparent pixels must preserve earlier regions rather than erase them. */
export function compositeArtworkPatch(target:CanvasRenderingContext2D,patch:ReturnType<typeof createArtworkPatch>,image:ImageData,x:number,y:number){
 patch.context.putImageData(image,0,0);target.drawImage(patch.canvas,x,y);
}
