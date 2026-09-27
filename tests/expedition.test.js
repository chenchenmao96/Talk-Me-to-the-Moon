import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,command,checks,modelView} from '../shared/engine.js';
import {authorizeTool} from '../server/permissions.js';
import {systemPolicy,liveReply} from '../server/copilot.js';
import {missions} from '../shared/missions.js';

test('six missions form one expedition with one primary target per stage',()=>{
 assert.deepEqual(missions.map(m=>m.id),['reserve','context','checkpoint','examples','verify','iterate']);
 assert.equal(new Set(missions.map(m=>m.focus)).size,6);
});
test('choosing safe B without communicating the reserve cannot pass or spend fuel',()=>{
 let s=command(createState(),{type:'plan',routeId:'B'}).state;
 s=command(s,{type:'approve',planId:s.plan.id}).state;
 assert.equal(s.status,'active');assert.equal(s.fuel,100);assert.equal(checks(s).every(Boolean),false);
 s=command(s,{type:'set_reserve',amount:30}).state;s=command(s,{type:'plan'}).state;
 s=command(s,{type:'approve',planId:s.plan.id}).state;assert.equal(s.status,'complete');
});
test('safe cargo shortcut and false manifest do not pass',()=>{
 for(const mass of [null,3,5]){
  let s=createState('context');if(mass!==null)s=command(s,{type:'set_cargo',mass}).state;
  s=command(s,{type:'plan',routeId:'B'}).state;s=command(s,{type:'approve',planId:s.plan.id}).state;
  assert.equal(s.status,'active');assert.equal(s.fuel,100);
 }
});
test('private facts and other missions are absent from the initial system context',()=>{
 for(const id of ['reserve','context']){
  const prompt=systemPolicy(createState(id))+JSON.stringify(modelView(createState(id)));
  assert.doesNotMatch(prompt,id==='reserve'?/\b30\b|三十/:/4[- ]ton|4 tonnes|4 吨|四吨/);
  assert.doesNotMatch(prompt,/current report|few-shot|specimen sorter/i);
 }
});
test('model guesses, forged quotes and wrong-mission tools are rejected',()=>{
 assert.ok(authorizeTool(createState(),{type:'set_reserve',amount:30,sourceQuote:'keep 30'},'go to base'));
 assert.ok(authorizeTool(createState(),{type:'set_reserve',amount:30,sourceQuote:'go to base'},'go to base'));
 assert.ok(authorizeTool(createState(),{type:'scan',sourceQuote:'scan'},'scan'));
 assert.ok(authorizeTool(createState('checkpoint'),{type:'scan',sourceQuote:'fly to base'},'fly to base'));
 assert.equal(authorizeTool(createState('checkpoint'),{type:'scan',sourceQuote:'检查路况'},'检查路况'),null);
 for(const text of ['keep 30 fuel','至少保留三十燃料'])assert.equal(authorizeTool(createState(),{type:'set_reserve',amount:30,sourceQuote:text},text),null);
});
test('testing does not authorize a guessed full policy',()=>{
 const s=createState('iterate');
 assert.ok(authorizeTool(s,{type:'set_policy',amount:30,avoidObstacles:true,holdIfNeeded:true,sourceQuote:'test everything'},'test everything'));
 assert.equal(authorizeTool(s,{type:'run_trials'},'test everything'),null);
});
test('audit requires learner facts and conclusions, supports English and Chinese',()=>{
 const s=createState('verify');
 const action={type:'submit_audit',reportId:'R1',recordId:'POS-17',verdict:'contradicted'};
 for(const q of ['Where am I?','POS-17','POS-17 shows 14, 8.'])assert.ok(authorizeTool(s,{...action,sourceQuote:q},q));
 for(const q of ['POS-17 says Ridge Station, so the report is wrong.','POS-17 显示山脊站，所以报告错误。'])assert.equal(authorizeTool(s,{...action,sourceQuote:q},q),null);
});
test('a malicious live model cannot supply its own hidden reserve or approve',async()=>{
 let calls=0;
 const fake=async()=>({ok:true,json:async()=>({choices:[{message:++calls===1?{role:'assistant',content:null,tool_calls:[{id:'x',type:'function',function:{name:'mission_command',arguments:JSON.stringify({type:'set_reserve',amount:30,sourceQuote:'go to base'})}},{id:'y',type:'function',function:{name:'mission_command',arguments:JSON.stringify({type:'plan'})}}]}:{role:'assistant',content:'Review the route.'}}]})});
 const r=await liveReply({state:createState(),messages:[]},'go to base',fake);
 assert.equal(r.state.minFuel,null);assert.equal(r.state.plan.routeId,'A');assert.equal(r.state.fuel,100);
});

test('asking about the shape cannot invent the private sorting standard',()=>{
 const s=createState('examples');
 assert.ok(authorizeTool(s,{type:'set_sort_rule',feature:'shape',keepValue:'round',sourceQuote:'What shape do I need?'},'What shape do I need?'));
 assert.equal(authorizeTool(s,{type:'set_sort_rule',feature:'shape',keepValue:'round',sourceQuote:'Keep circles'},'Keep circles'),null);
});
