import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,command,modelView,checks} from '../shared/engine.js';
const doIt=(s,a)=>command(s,a).state;
test('cargo manifest stays private; sharing mass changes route; overload really fails',()=>{
 let s=createState('context');assert.equal(modelView(s).cargoMass,null);assert.equal('actualMass' in modelView(s),false);
 s=doIt(s,{type:'plan'});assert.equal(s.plan.routeId,'A');const old=s.plan.id;
 const failure=doIt(s,{type:'approve',planId:old});assert.equal(failure.destroyed,true);assert.equal(failure.delivered,false);assert.equal(failure.status,'needs_retry');
 s=doIt(s,{type:'set_cargo',mass:4});assert.equal(s.plan,null);assert.equal(doIt(s,{type:'approve',planId:old}).fuel,100);
 s=doIt(s,{type:'plan'});assert.equal(s.plan.routeId,'B');s=doIt(s,{type:'approve',planId:s.plan.id});assert.equal(s.status,'complete');assert.equal(s.fuel,65);assert.deepEqual(checks(s),[true,true]);
 assert.deepEqual(doIt(s,{type:'approve',planId:s.plan.id}),s);
});
test('cargo constraints cannot be bypassed by asking for insufficient or nonexistent bridge',()=>{
 let s=doIt(createState('context'),{type:'set_cargo',mass:7});assert.equal(doIt(s,{type:'plan'}).plan,null);
 for(const mass of [-1,NaN,Infinity,'4',21])assert.equal(doIt(createState('context'),{type:'set_cargo',mass}).cargoMass,null);
});
test('specimen test catches a color rule and accepts a correct rule across new combinations',()=>{
 let s=createState('examples');assert.equal(doIt(s,{type:'run_sort'}).status,'active');
 s=doIt(s,{type:'set_sort_rule',feature:'color',keepValue:'blue'});s=doIt(s,{type:'run_sort'});assert.equal(s.sortResults.filter(x=>x.pass).length,2);assert.equal(s.status,'active');
 s=doIt(s,{type:'set_sort_rule',feature:'shape',keepValue:'round'});assert.equal(s.sortResults.length,0);s=doIt(s,{type:'run_sort'});assert.equal(s.status,'complete');assert.deepEqual(checks(s),[true,true,true,true]);assert.equal(s.sortRuns,2);
 assert.equal(doIt(createState('examples'),{type:'set_sort_rule',feature:'shape',keepValue:'blue'}).sortRule,null);
});
test('policy fixes preserve earlier constraints and require current passing tests for release',()=>{
 let s=createState('iterate');s=doIt(s,{type:'run_trials'});assert.equal(s.trialResults.filter(x=>x.pass).length,1);assert.equal(doIt(s,{type:'approve_release',planId:s.plan.id}).status,'active');
 s=doIt(s,{type:'set_policy',avoidObstacles:true});s=doIt(s,{type:'run_trials'});assert.equal(s.trialResults.filter(x=>x.pass).length,2);
 s=doIt(s,{type:'set_policy',amount:30,holdIfNeeded:true});assert.equal(s.policy.avoidObstacles,true);assert.equal(s.trialResults.length,0);
 s=doIt(s,{type:'run_trials'});assert.deepEqual(s.trialResults.map(x=>x.route),['A','B','HOLD']);assert.ok(s.trialResults.every(x=>x.pass));assert.equal(s.fuel,100);
 const tested=s;const old=s.plan.id;s=doIt(s,{type:'set_policy',amount:0});assert.equal(s.trialResults.length,0);assert.equal(doIt(s,{type:'approve_release',planId:old}).status,'active');
 const done=doIt(tested,{type:'approve_release',planId:tested.plan.id});assert.equal(done.status,'complete');assert.equal(done.released,true);assert.deepEqual(checks(done),[true,true]);
});
test('a good policy may pass the first test without an artificial required failure',()=>{
 let s=doIt(createState('iterate'),{type:'set_policy',avoidObstacles:true,amount:30,holdIfNeeded:true});s=doIt(s,{type:'run_trials'});assert.equal(s.trialRuns,1);assert.ok(s.trialResults.every(x=>x.pass));
});
