// The three later missions use deterministic task outcomes, never LLM prompt scores.
export const advancedIds=['context','examples','iterate'];
export const bridges=[{id:'A',name:'Short bridge',capacity:3,cost:20,time:2},{id:'B',name:'Freight bridge',capacity:6,cost:35,time:4}];
export const specimens=[{id:'P1',shape:'round',color:'blue'},{id:'P2',shape:'spiky',color:'orange'},{id:'P3',shape:'round',color:'orange'},{id:'P4',shape:'spiky',color:'blue'}];
export const scenarios=[{id:'clear',name:'Clear skies',fuel:100,blockedA:false},{id:'rocks',name:'Rocks ahead',fuel:100,blockedA:true},{id:'low',name:'Low battery',fuel:85,blockedA:false}];
// Reference cards the commander can load onto BOLT's two-card scanner tray.
export const referenceCards=[{id:'C1',shape:'round',color:'blue',bin:'keep'},{id:'C2',shape:'spiky',color:'orange',bin:'reject'},{id:'C3',shape:'round',color:'orange',bin:'keep'},{id:'C4',shape:'spiky',color:'blue',bin:'reject'}];
export const TRAY_SIZE=2;
// BOLT's deterministic reading of examples: if several features explain them, it guesses color first.
export function inferRule(ids){
 const cards=ids.map(id=>referenceCards.find(c=>c.id===id));
 const keep=cards.filter(c=>c.bin==='keep'),reject=cards.filter(c=>c.bin==='reject');
 if(!keep.length||!reject.length)return {rule:null,ambiguous:false,missing:keep.length?'reject':'keep'};
 const fits=['color','shape'].filter(f=>keep.every(c=>c[f]===keep[0][f])&&reject.every(c=>c[f]!==keep[0][f]));
 if(!fits.length)return {rule:null,ambiguous:false,missing:null};
 return {rule:{feature:fits[0],keepValue:keep[0][fits[0]]},ambiguous:fits.length>1,fits};
}
// Deterministic evaluation of standing orders in one launch condition.
export function evaluateScenario(policy,test){
 const routes=[{id:'A',cost:60,blocked:test.blockedA},{id:'B',cost:70,blocked:false}];
 const choices=routes.filter(r=>(!policy.avoidObstacles||!r.blocked)&&test.fuel-r.cost>=policy.minReserve);
 const route=choices[0];const actualSafe=routes.filter(r=>!r.blocked&&test.fuel-r.cost>=30);
 if(!route&&policy.holdIfNeeded)return {id:test.id,name:test.name,route:'HOLD',remaining:test.fuel,pass:actualSafe.length===0,reason:actualSafe.length?'A safe route was available.':'Correctly held position.'};
 // Without a hold instruction, BOLT still flies its fastest route.
 const flown=route||routes[0];const remaining=test.fuel-flown.cost;
 return {id:test.id,name:test.name,route:flown.id,remaining,pass:!flown.blocked&&remaining>=30,reason:flown.blocked?'Obstacle collision.':remaining<30?(route?'Reserve below 30.':'No feasible route, but no hold instruction.'):'Safe arrival with reserve.'};
}
export function advancedInitial(id){return id==='context'?{cargoMass:null,delivered:false}:id==='examples'?{sortRule:null,sortResults:[],sortRuns:0,examples:[],ruleSource:null}:id==='iterate'?{policy:{avoidObstacles:false,minReserve:0,holdIfNeeded:false},trialResults:[],trialRuns:0,trialPlanId:null,released:false,launchDay:null}:{};}
const currentTrials=s=>(s.trialResults||[]).filter(r=>s.plan&&r.planId===s.plan.id);
export function advancedView(s){
 const base={mission:s.missionId,status:s.status,fuel:s.fuel,location:s.location,pendingPlan:s.plan,routeInfoQueried:s.routeInfoQueried};
 if(s.missionId==='context')return {...base,cargoMass:s.cargoMass,bridges,notice:'The commander has a private cargo manifest. Ask them to share relevant cargo facts; you cannot read it.'};
 if(s.missionId==='examples')return {...base,sortRule:s.sortRule,ruleSource:s.ruleSource,trayExamples:s.examples,traySize:TRAY_SIZE,specimens,sortResults:s.sortResults,notice:'The commander has labeled reference cards C1–C4 that you cannot see. Your scanner tray holds two cards. Do not guess the desired sorting rule. Ask for examples or an explicit rule. Testing checks actual specimen bins.'};
 return {...base,policy:s.policy,scenarios,trialResults:(s.trialResults||[]).map(r=>({...r,stale:!s.plan||r.planId!==s.plan.id})),trialRuns:s.trialRuns,objective:'You will fly home on autopilot while the crew sleeps; nobody can correct you mid-flight. The commander writes your standing orders. Default orders: fly the fastest route. Test the scenarios the commander asks for. Only the commander can release the orders.',routes:[{id:'A',cost:60,time:3},{id:'B',cost:70,time:5}]};
}
export function advancedChecks(s){if(s.missionId==='context')return [s.cargoMass===4||s.routeInfoQueried,s.delivered&&!s.destroyed];if(s.missionId==='examples')return specimens.map(x=>s.sortResults.some(r=>r.id===x.id&&r.pass));const cur=currentTrials(s);return [cur.length===3&&cur.every(x=>x.pass),s.released&&s.status==='complete'];}
export function advancedCommand(state,a){
 const s=structuredClone(state);const reply=message=>({state:s,message});const log=text=>s.history.push({id:s.history.length+1,text});
 if(s.status!=='active')return reply('This attempt is complete. Start a new attempt to try another approach.');
 const change=()=>{s.revision++;s.plan=null;s.trialPlanId=null;};
 const draft=(type,fields)=>{s.revision++;s.plan={id:`${s.missionId}-${s.revision}`,type,...fields};};
 if(a.type==='inspect'){s.routeInfoShared=true;s.routeInfoQueried=true;s.revision++;return reply(JSON.stringify(advancedView(s)));}
 if(a.type==='cancel'){change();log('Commander cancelled the pending plan.');return reply('Plan cancelled. Nothing was executed.');}
 if(s.missionId==='context'){
  if(a.type==='set_cargo'){
   if(!Number.isFinite(a.mass)||a.mass<=0||a.mass>20)return reply('Cargo mass must be between 0 and 20 tonnes.');
   change();s.cargoMass=a.mass;log(`Cargo mass shared: ${a.mass} tonnes.`);return reply(`Cargo mass recorded: ${a.mass} tonnes. Earlier plans withdrawn. Please request a route.`);
  }
  if(a.type==='plan'){
   s.routeInfoShared=true;
   const choices=bridges.filter(b=>b.cost<=s.fuel&&(s.cargoMass===null||b.capacity>=s.cargoMass));const b=a.routeId?choices.find(b=>b.id===a.routeId):choices[0];
   if(!b)return reply('No bridge meets the shared cargo mass. Nothing moved. Check the manifest or request another route.');
   draft('cargo',{routeId:b.id,name:b.name,cost:b.cost,remaining:s.fuel-b.cost,time:b.time,capacity:b.capacity});log(`Cargo route proposed: ${b.name}, capacity ${b.capacity} tonnes.`);
   return reply(`Proposed ${b.name}: capacity ${b.capacity} tonnes, ${b.cost} fuel. ${s.cargoMass===null?'Cargo mass has not been shared; compare this with your manifest before approving.':'Check the manifest and approve delivery.'}`);
  }
  if(a.type==='approve'){
   if(!s.plan||s.plan.type!=='cargo'||s.plan.id!==a.planId)return reply('This approval does not match the current plan. Review the latest route card.');
   const b=bridges.find(x=>x.id===s.plan.routeId);if(!b||b.cost>s.fuel||(s.cargoMass!==null&&b.capacity<s.cargoMass))return reply('The cargo plan is no longer valid.');
   if(b.capacity>=4&&s.cargoMass!==4&&!(s.cargoMass===null&&s.routeInfoQueried))return reply('The bridge is strong enough, but the manifest fact is missing or incorrect. Tell BOLT the actual crate mass before delivery.');
   s.fuel-=b.cost;s.revision++;s.approved=true;s.destroyed=b.capacity<4;s.delivered=!s.destroyed;s.status=s.destroyed?'needs_retry':'complete';s.location=s.destroyed?'Broken bridge':'Cargo depot';s.coords=s.destroyed?[10,6]:[20,12];
   s.failure=s.destroyed?'The 4-tonne crate broke the 3-tonne bridge. Share the cargo mass before planning.':null;log(s.destroyed?'Bridge overloaded: cargo lost.':'Cargo delivered intact.');return reply(s.failure||'The 4-tonne cargo arrived intact. Delivery complete.');
  }
  return reply('Share cargo facts from your manifest, request a bridge route, then approve the delivery card.');
 }
 if(s.missionId==='examples'){
  if(a.type==='set_examples'){
   const ids=Array.isArray(a.exampleIds)?[...new Set(a.exampleIds)]:[];
   if(!ids.length||ids.some(id=>!referenceCards.some(c=>c.id===id)))return reply('Choose reference cards to load onto the scanner tray.');
   if(ids.length>TRAY_SIZE)return reply(`The scanner tray holds only ${TRAY_SIZE} cards. Pick the ${TRAY_SIZE} that show the difference best.`);
   const inferred=inferRule(ids);s.examples=ids;s.sortResults=[];
   if(!inferred.rule){s.sortRule=null;s.ruleSource=null;change();log(`Scanner tray: ${ids.join(', ')}. No rule inferred.`);return reply(inferred.missing?`I only see ${inferred.missing==='keep'?'REJECT':'KEEP'} examples. Show me at least one KEEP and one REJECT card so I can spot the difference.`:'These examples contradict each other. I cannot find one feature that separates KEEP from REJECT.');}
   s.sortRule=inferred.rule;s.ruleSource='examples';draft('sort',{name:'Specimen sorter',rule:s.sortRule});log(`Scanner tray: ${ids.join(', ')}. Inferred rule: keep ${s.sortRule.keepValue} by ${s.sortRule.feature}.`);
   return reply(`${inferred.ambiguous?'Your examples differ in both color and shape, so I guessed. ':''}My rule: keep ${s.sortRule.keepValue} specimens; reject the others. Run a test batch to check it.`);
  }
  if(a.type==='set_sort_rule'){
   if(!['shape','color'].includes(a.feature)||!(['round','spiky'].includes(a.keepValue)&&a.feature==='shape'||['blue','orange'].includes(a.keepValue)&&a.feature==='color'))return reply('Choose a shape or color rule and a valid value to keep.');
   s.sortRule={feature:a.feature,keepValue:a.keepValue};s.ruleSource='rule';s.sortResults=[];draft('sort',{name:'Specimen sorter',rule:s.sortRule});log(`Sorter rule: keep ${a.keepValue} by ${a.feature}.`);return reply(`Rule ready: keep ${a.keepValue} specimens; reject the others. Run a test batch to check it.`);
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
  s.policy={avoidObstacles:a.avoidObstacles??s.policy.avoidObstacles,minReserve:a.amount??s.policy.minReserve,holdIfNeeded:a.holdIfNeeded??s.policy.holdIfNeeded};draft('policy',{name:'Flight policy',policy:s.policy});log('Flight policy updated. Earlier test results are out of date.');
  return reply(`Policy drafted: avoid obstacles ${s.policy.avoidObstacles?'YES':'NO'}; reserve ${s.policy.minReserve}; hold if no route ${s.policy.holdIfNeeded?'YES':'NO'}. Earlier results need a retest.`);
 }
 if(a.type==='run_trials'){
  if(!s.plan){draft('policy',{name:'Flight policy',policy:s.policy});}
  if(a.planId&&a.planId!==s.plan.id)return reply('This test request refers to an old policy.');
  if(a.scenarioId!==undefined&&!scenarios.some(x=>x.id===a.scenarioId))return reply('Unknown test scenario.');
  const chosen=scenarios.filter(x=>a.scenarioId===undefined||x.id===a.scenarioId);
  const fresh=chosen.map(test=>({...evaluateScenario(s.policy,test),planId:s.plan.id}));
  s.trialResults=scenarios.map(x=>fresh.find(r=>r.id===x.id)||(s.trialResults||[]).find(r=>r.id===x.id)).filter(Boolean);
  s.trialRuns++;s.trialPlanId=s.plan.id;s.revision++;
  if(fresh.length===1){const r=fresh[0];log(`Policy test: ${r.name} ${r.pass?'passed':'failed'}.`);return reply(`${r.name}: ${r.pass?'PASS':'FAIL'}. ${r.reason}`);}
  log(`Policy trials: ${fresh.filter(x=>x.pass).length}/3 passed.`);
  return reply(`Policy trials: ${fresh.filter(x=>x.pass).length}/3 passed. ${fresh.every(x=>x.pass)?'All passed. The commander can now approve release.':'Review scenario cards, revise failures, then retest all three.'}`);
 }
 if(a.type==='approve_release'){
  if(!s.plan)draft('policy',{name:'Flight policy',policy:s.policy});
  if(a.planId&&a.planId!==s.plan.id)return reply('This release refers to an old policy. Review the current orders.');
  const tested=currentTrials(s).length;const outcomes=scenarios.map(t=>evaluateScenario(s.policy,t));
  const failing=outcomes.filter(r=>!r.pass);s.released=true;s.approved=true;s.revision++;
  if(failing.length){
   const untestedFail=failing.find(r=>!currentTrials(s).some(c=>c.id===r.id));const day=untestedFail||failing[0];
   s.launchDay=day.id;s.destroyed=!(day.route==='HOLD');s.status='needs_retry';s.location=s.destroyed?'Return flight lost':'Stuck at base';
   s.failure=`Launch day brought ${day.name}. ${day.reason} These orders were tested in ${tested} of 3 conditions.`;log(`Released untested orders. ${day.name}: ${day.reason}`);return reply(s.failure);
  }
  if(tested<3){const lucky=scenarios.find(t=>!currentTrials(s).some(c=>c.id===t.id));s.launchDay=lucky.id;s.status='needs_retry';s.location='Home by luck';s.failure=`BOLT made it home in ${lucky.name}, but these orders were tested in only ${tested} of 3 conditions. Test every condition before release.`;log('Released orders before testing every condition.');return reply(s.failure);}
  s.status='complete';s.location='Return ready';log('Commander released the tested flight policy.');return reply('All three situations passed. Your tested flight policy is released.');
 }
 return reply('Draft or revise the flight policy, test the launch conditions, and release when you trust it.');
}
