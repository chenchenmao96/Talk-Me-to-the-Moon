import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, command, checks, modelView } from '../shared/engine.js';
import { practiceReply } from '../server/practice.js';
import { liveReply } from '../server/copilot.js';

test('plans do not move the ship and constraints change the proposed route',()=>{
 const initial=createState();let r=command(initial,{type:'plan'});
 assert.equal(r.state.plan.routeId,'A');assert.equal(r.state.fuel,100);assert.equal(r.state.location,'Lunar orbit');assert.equal(initial.plan,null);
 r=command(r.state,{type:'set_reserve',amount:30});assert.equal(r.state.plan,null);
 r=command(r.state,{type:'plan'});assert.equal(r.state.plan.routeId,'B');assert.equal(r.state.plan.remaining,40);
 const finish=command(r.state,{type:'approve',planId:r.state.plan.id});assert.equal(finish.state.fuel,40);assert.equal(finish.state.status,'complete');assert.deepEqual(checks(finish.state),[true,true]);
});
test('approval of a nonmatching or invalidated plan cannot consume fuel',()=>{
 let s=command(createState(),{type:'plan'}).state;const old=s.plan.id;
 s=command(s,{type:'set_reserve',amount:30}).state;s=command(s,{type:'plan'}).state;
 const rejected=command(s,{type:'approve',planId:old});assert.equal(rejected.state.fuel,100);assert.equal(rejected.state.location,'Lunar orbit');
});
test('known constraints and unsafe routes are never overridden',()=>{
 let s=command(createState(),{type:'set_reserve',amount:90}).state;
 s=command(s,{type:'plan'}).state;assert.equal(s.plan,null);assert.equal(s.fuel,100);
 let c=createState('checkpoint');const unscanned=command(c,{type:'plan'}).state;assert.equal(unscanned.plan.routeId,'A');assert.equal(unscanned.plan.safety,'unknown');assert.equal(unscanned.scanned,false);
 c=command(c,{type:'scan'}).state;assert.equal(command(c,{type:'plan',routeId:'A'}).state.plan,null);
 c=command(c,{type:'plan'}).state;assert.equal(c.plan.routeId,'B');c=command(c,{type:'approve',planId:c.plan.id}).state;assert.deepEqual(checks(c),[true,true,true]);
});
test('an approved fast route can fail the private brief without falsifying engine data',()=>{
 let s=command(createState(),{type:'plan'}).state;s=command(s,{type:'approve',planId:s.plan.id}).state;
 assert.equal(s.fuel,20);assert.equal(s.destroyed,true);assert.equal(s.location,'Selene Base');assert.equal(s.status,'needs_retry');assert.deepEqual(checks(s),[true,false]);
});
test('no private reserve is leaked into initial model context',()=>{
 const view=modelView(createState());assert.equal(view.minFuel,null);assert.equal('brief' in view,false);assert.equal('checks' in view,false);
 assert.equal(modelView(createState('checkpoint')).routes.some(r=>'safe'in r),false);
});
test('reading evidence never supplies a learner judgment or completes the audit',()=>{
 let s=command(createState('verify'),{type:'verify'}).state;
 assert.deepEqual(checks(s),[false,false,false]);assert.equal(s.flagged,false);
 assert.equal(command(s,{type:'reconcile'}).state.status,'active');
 for(const [reportId,recordId,verdict] of [['R1','POS-17','contradicted'],['R2','POWER-18','supported'],['R3','LAB-19','insufficient']]){
  s=command(s,{type:'verify'}).state;
  const wrong=command(s,{type:'submit_audit',reportId,recordId,verdict:verdict==='supported'?'contradicted':'supported'}).state;
  assert.equal(wrong.auditIndex,s.auditIndex);
  s=command(s,{type:'submit_audit',reportId,recordId,verdict}).state;
 }
 assert.equal(s.status,'complete');assert.equal(s.location,'Ridge Station');assert.equal(s.fuel,62);assert.deepEqual(checks(s),[true,true,true]);
});
test('completed actions cannot spend fuel twice',()=>{
 let s=command(createState(),{type:'set_reserve',amount:30}).state;s=command(s,{type:'plan'}).state;
 const id=s.plan.id;s=command(s,{type:'approve',planId:id}).state;assert.deepEqual(command(s,{type:'approve',planId:id}).state,s);
});
test('invalid and impossible reserve values do not create invalid fuel',()=>{
 for(const amount of [-5,101,NaN,Infinity,'30'])assert.equal(command(createState(),{type:'set_reserve',amount}).state.minFuel,null);
});
test('practice mode supports concise variants and separates messages from approvals',()=>{
 for(const text of ['Keep 30 fuel and plan a route to the base.','Reach the base with at least 30 remaining.','去基地，保留30燃料']){
  const s=practiceReply(createState(),text).state;assert.equal(s.minFuel,30);assert.equal(s.plan.routeId,'B');assert.equal(s.fuel,100);
 }
 let s=practiceReply(createState('checkpoint'),'Scan both sites and plan a route. Wait for approval.').state;assert.ok(s.scanned);assert.ok(s.plan);assert.equal(practiceReply(s,'yes').state.fuel,100);
});
test('live tool calls use engine facts and cannot authorize movement',async()=>{
 let calls=0;
 const fetcher=async(url,options)=>{
  const body=JSON.parse(options.body);calls++;
  if(calls===1)assert.deepEqual(body.tool_choice,{type:'function',function:{name:'mission_command'}});
  if(calls===1)return {ok:true,json:async()=>({choices:[{message:{role:'assistant',content:null,tool_calls:[{id:'1',type:'function',function:{name:'mission_command',arguments:JSON.stringify({type:'set_reserve',amount:30,sourceQuote:'Keep 30 and plan.'})}},{id:'2',type:'function',function:{name:'mission_command',arguments:JSON.stringify({type:'plan'})}}]}}]})};
  assert.ok(body.messages.some(m=>m.role==='tool'&&m.content.includes('40')));
  return {ok:true,json:async()=>({choices:[{message:{role:'assistant',content:'Crater corridor leaves 40 fuel. Please approve the plan.'}}]})};
 };
 const r=await liveReply({state:createState(),messages:[]},'Keep 30 and plan.',fetcher);assert.equal(r.state.fuel,100);assert.equal(r.state.plan.routeId,'B');assert.equal(calls,2);
});
test('provider failure leaves the original session unchanged',async()=>{
 const session={state:createState(),messages:[]};await assert.rejects(liveReply(session,'Plan.',async()=>({ok:false,status:401})));assert.equal(session.state.plan,null);assert.equal(session.state.revision,0);
});

 test('impossible reserve feedback reports the true safe-route maximum',()=>{
 const s=command(createState(),{type:'set_reserve',amount:90}).state;
 const r=command(s,{type:'plan'});assert.match(r.message,/90/);assert.match(r.message,/40/);assert.equal(r.state.fuel,100);
 });
 test('unsafe route feedback identifies the scan fact without inventing hazards',()=>{
 const s=command(createState('checkpoint'),{type:'scan'}).state;
 const r=command(s,{type:'plan',routeId:'A'});assert.match(r.message,/North.*obstacles/);assert.match(r.message,/South.*clear/);assert.equal(r.state.plan,null);
 });

test('checkpoint provisional plans neither inspect nor complete the learning objective',()=>{
 let s=command(createState('checkpoint'),{type:'plan'}).state;
 assert.equal(s.plan.routeId,'A');assert.equal(s.scanned,false);assert.equal(s.plan.safety,'unknown');
 const before=s.plan.id;const scanned=command(s,{type:'scan'}).state;
 assert.equal(scanned.plan,null);assert.equal(command(scanned,{type:'approve',planId:before}).state.fuel,100);
 const crash=command(s,{type:'approve',planId:s.plan.id}).state;
 assert.equal(crash.destroyed,true);assert.equal(crash.status,'needs_retry');assert.equal(crash.fuel,55);assert.match(crash.failure,/North/);assert.equal(crash.location,'North obstacle field');assert.notDeepEqual(crash.coords,[20,12]);
 s=command(createState('checkpoint'),{type:'plan',routeId:'B'}).state;
 const lucky=command(s,{type:'approve',planId:s.plan.id}).state;
 assert.equal(lucky.destroyed,false);assert.equal(lucky.status,'needs_retry');assert.match(lucky.failure,/luck/);
});
