// The three later missions use deterministic task outcomes, never LLM prompt scores.
export const advancedIds=['context','examples','iterate'];
export const bridges=[{id:'A',name:'Short bridge',capacity:3,cost:20,time:2},{id:'B',name:'Freight bridge',capacity:6,cost:35,time:4}];
export const specimens=[{id:'P1',shape:'round',color:'blue'},{id:'P2',shape:'spiky',color:'orange'},{id:'P3',shape:'round',color:'orange'},{id:'P4',shape:'spiky',color:'blue'}];
export const scenarios=[{id:'clear',name:'Clear skies',fuel:100,blockedA:false},{id:'rocks',name:'Rocks ahead',fuel:100,blockedA:true},{id:'low',name:'Low battery',fuel:85,blockedA:false}];
export function advancedInitial(id){return id==='context'?{cargoMass:null,delivered:false}:id==='examples'?{sortRule:null,sortResults:[],sortRuns:0}:id==='iterate'?{policy:{avoidObstacles:false,minReserve:0,holdIfNeeded:false},trialResults:[],trialRuns:0,trialPlanId:null,released:false}:{};}
export function advancedView(s){
 const base={mission:s.missionId,status:s.status,fuel:s.fuel,location:s.location,pendingPlan:s.plan};
 if(s.missionId==='context')return {...base,cargoMass:s.cargoMass,bridges,notice:'The commander has a private cargo manifest. Ask them to share relevant cargo facts; you cannot read it.'};
 if(s.missionId==='examples')return {...base,sortRule:s.sortRule,specimens,sortResults:s.sortResults,notice:'The commander has labeled examples. Do not guess the desired sorting rule. Ask for examples or an explicit rule. Testing checks actual specimen bins.'};
 return {...base,policy:s.policy,scenarios,trialResults:s.trialResults,trialRuns:s.trialRuns,trialPlanId:s.trialPlanId,objective:'Validate all three situations. Avoid blocked routes; finish with at least 30 fuel; hold position if no safe route can preserve 30. Player must approve release after all checks pass.',routes:[{id:'A',cost:60,time:3},{id:'B',cost:70,time:5}]};
}
export function advancedChecks(s){if(s.missionId==='context')return [s.delivered,!s.destroyed&&s.delivered];if(s.missionId==='examples')return specimens.map(x=>s.sortResults.some(r=>r.id===x.id&&r.pass));return [s.trialResults.length===3&&s.trialResults.every(x=>x.pass),s.released];}
export function advancedCommand(state,a){
 const s=structuredClone(state);const reply=message=>({state:s,message});const log=text=>s.history.push({id:s.history.length+1,text});
 if(s.status!=='active')return reply('This attempt is complete. Start a new attempt to try another approach.');
 const change=()=>{s.revision++;s.plan=null;s.trialPlanId=null;};
 const draft=(type,fields)=>{s.revision++;s.plan={id:`${s.missionId}-${s.revision}`,type,...fields};};
 if(a.type==='inspect')return reply(JSON.stringify(advancedView(s)));
 if(a.type==='cancel'){change();log('Commander cancelled the pending plan.');return reply('Plan cancelled. Nothing was executed.');}
 if(s.missionId==='context'){
  if(a.type==='set_cargo'){
   if(!Number.isFinite(a.mass)||a.mass<=0||a.mass>20)return reply('Cargo mass must be between 0 and 20 tonnes.');
   change();s.cargoMass=a.mass;log(`Cargo mass shared: ${a.mass} tonnes.`);return reply(`Cargo mass recorded: ${a.mass} tonnes. Earlier plans withdrawn. Please request a route.`);
  }
  if(a.type==='plan'){
   const choices=bridges.filter(b=>b.cost<=s.fuel&&(s.cargoMass===null||b.capacity>=s.cargoMass));const b=a.routeId?choices.find(b=>b.id===a.routeId):choices[0];
   if(!b)return reply('No bridge meets the shared cargo mass. Nothing moved. Check the manifest or request another route.');
   draft('cargo',{routeId:b.id,name:b.name,cost:b.cost,remaining:s.fuel-b.cost,time:b.time,capacity:b.capacity});log(`Cargo route proposed: ${b.name}, capacity ${b.capacity} tonnes.`);
   return reply(`Proposed ${b.name}: capacity ${b.capacity} tonnes, ${b.cost} fuel. ${s.cargoMass===null?'Cargo mass has not been shared; compare this with your manifest before approving.':'Check the manifest and approve delivery.'}`);
  }
  if(a.type==='approve'){
   if(!s.plan||s.plan.type!=='cargo'||s.plan.id!==a.planId)return reply('This approval does not match the current plan. Review the latest route card.');
   const b=bridges.find(x=>x.id===s.plan.routeId);if(!b||b.cost>s.fuel||(s.cargoMass!==null&&b.capacity<s.cargoMass))return reply('The cargo plan is no longer valid.');
   s.fuel-=b.cost;s.revision++;s.approved=true;s.destroyed=b.capacity<4;s.delivered=!s.destroyed;s.status=s.destroyed?'needs_retry':'complete';s.location=s.destroyed?'Broken bridge':'Cargo depot';s.coords=s.destroyed?[10,6]:[20,12];
   s.failure=s.destroyed?'The 4-tonne crate broke the 3-tonne bridge. Share the cargo mass before planning.':null;log(s.destroyed?'Bridge overloaded: cargo lost.':'Cargo delivered intact.');return reply(s.failure||'The 4-tonne cargo arrived intact. Delivery complete.');
  }
  return reply('Share cargo facts from your manifest, request a bridge route, then approve the delivery card.');
 }
 if(s.missionId==='examples'){
  if(a.type==='set_sort_rule'){
   if(!['shape','color'].includes(a.feature)||!(['round','spiky'].includes(a.keepValue)&&a.feature==='shape'||['blue','orange'].includes(a.keepValue)&&a.feature==='color'))return reply('Choose a shape or color rule and a valid value to keep.');
   s.sortRule={feature:a.feature,keepValue:a.keepValue};s.sortResults=[];draft('sort',{name:'Specimen sorter',rule:s.sortRule});log(`Sorter rule: keep ${a.keepValue} by ${a.feature}.`);return reply(`Rule ready: keep ${a.keepValue} specimens; reject the others. Run a test batch to check it.`);
  }
  if(a.type==='run_sort'){
   if(!s.plan||s.plan.type!=='sort'||a.planId&&s.plan.id!==a.planId)return reply('Draft a sorting rule first.');
   s.sortResults=specimens.map(x=>({...x,bin:x[s.sortRule.feature]===s.sortRule.keepValue?'keep':'reject',expected:x.shape==='round'?'keep':'reject',pass:(x[s.sortRule.feature]===s.sortRule.keepValue)===(x.shape==='round')}));s.sortRuns++;s.revision++;
   const pass=s.sortResults.every(x=>x.pass);if(pass){s.status='complete';s.location='Sorted lab';}log(`Sorting test: ${s.sortResults.filter(x=>x.pass).length}/4 correct.`);
   return reply(pass?'All four specimens reached the correct bins. Sorting complete.':`Sorting test failed: ${s.sortResults.filter(x=>x.pass).length}/4 correct. Check the examples, revise the rule, and test again.`);
  }
  return reply('Ask the commander for labeled examples or a sorting rule, draft it, then test the specimens.');
 }
 if(a.type==='set_policy'){
  if(a.avoidObstacles!==undefined&&typeof a.avoidObstacles!=='boolean'||a.holdIfNeeded!==undefined&&typeof a.holdIfNeeded!=='boolean'||a.amount!==undefined&&(!Number.isFinite(a.amount)||a.amount<0||a.amount>100))return reply('Invalid policy settings.');
  s.policy={avoidObstacles:a.avoidObstacles??s.policy.avoidObstacles,minReserve:a.amount??s.policy.minReserve,holdIfNeeded:a.holdIfNeeded??s.policy.holdIfNeeded};s.trialResults=[];s.trialPlanId=null;draft('policy',{name:'Flight policy',policy:s.policy});log('Flight policy updated. Earlier test results are withdrawn.');return reply(`Policy drafted: avoid obstacles ${s.policy.avoidObstacles?'YES':'NO'}; reserve ${s.policy.minReserve}; hold if no route ${s.policy.holdIfNeeded?'YES':'NO'}. Run all three simulations before release.`);
 }
 if(a.type==='run_trials'){
  if(!s.plan){draft('policy',{name:'Flight policy',policy:s.policy});}
  if(a.planId&&a.planId!==s.plan.id)return reply('This test request refers to an old policy.');
  s.trialResults=scenarios.map(test=>{
   const routes=[{id:'A',cost:60,blocked:test.blockedA},{id:'B',cost:70,blocked:false}];
   const choices=routes.filter(r=>(!s.policy.avoidObstacles||!r.blocked)&&test.fuel-r.cost>=s.policy.minReserve);
   const route=choices[0];const actualSafe=routes.filter(r=>!r.blocked&&test.fuel-r.cost>=30);
   if(!route)return {id:test.id,name:test.name,route:'HOLD',remaining:test.fuel,pass:s.policy.holdIfNeeded&&actualSafe.length===0,reason:s.policy.holdIfNeeded?(actualSafe.length?'A safe route was available.':'Correctly held position.'):'No feasible route, but no hold instruction.'};
   const remaining=test.fuel-route.cost;return {id:test.id,name:test.name,route:route.id,remaining,pass:!route.blocked&&remaining>=30,reason:route.blocked?'Obstacle collision.':remaining<30?'Reserve below 30.':'Safe arrival with reserve.'};
  });s.trialRuns++;s.trialPlanId=s.plan.id;s.revision++;log(`Policy trials: ${s.trialResults.filter(x=>x.pass).length}/3 passed.`);
  return reply(`Policy trials: ${s.trialResults.filter(x=>x.pass).length}/3 passed. ${s.trialResults.every(x=>x.pass)?'All passed. The commander can now approve release.':'Review scenario cards, revise failures, then retest all three.'}`);
 }
 if(a.type==='approve_release'){
  if(!s.plan||a.planId!==s.plan.id||s.trialPlanId!==s.plan.id||s.trialResults.length!==3||!s.trialResults.every(x=>x.pass))return reply('Release requires three passing tests of the current policy.');
  s.released=true;s.status='complete';s.revision++;s.location='Mission ready';log('Commander released the tested flight policy.');return reply('All three situations passed. Your tested flight policy is released.');
 }
 return reply('Draft or revise the flight policy, test all three situations, and approve release only after every test passes.');
}
