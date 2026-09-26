import test from 'node:test';import assert from 'node:assert/strict';
import {sourceFrame} from '../src/artworkFrame.ts';
test('atlas crop resolves every quadrant without rounding half-pixel boundaries',()=>{
 assert.deepEqual(sourceFrame(1672,941,{columns:2,rows:2,index:0}),{x:0,y:0,width:836,height:470.5});
 assert.deepEqual(sourceFrame(1672,941,{columns:2,rows:2,index:3}),{x:836,y:470.5,width:836,height:470.5});
});
test('single images retain the whole source and invalid frames fail explicitly',()=>{
 assert.deepEqual(sourceFrame(1672,941),{x:0,y:0,width:1672,height:941});assert.throws(()=>sourceFrame(1672,941,{columns:2,rows:2,index:4}));
});
