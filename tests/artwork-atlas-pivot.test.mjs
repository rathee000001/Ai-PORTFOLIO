import test from 'node:test';import assert from 'node:assert/strict';
import {artworkScenes,localMotion} from '../src/artworkMotion.ts';
test('atlas sphere center and radius share the rendered polygon coordinate system',()=>{
 const sphere=artworkScenes.pluginIntention.regions.find(r=>r.effect==='globe');
 assert.deepEqual(sphere.pivot,[1122,328]);assert.equal(sphere.radius,166);
 const center=localMotion(sphere,1122,328,1,1),edge=localMotion(sphere,1288,328,1,1);
 assert.ok(Math.abs(center.dx)>.5);assert.ok(Math.abs(edge.dx)<.01);
});
