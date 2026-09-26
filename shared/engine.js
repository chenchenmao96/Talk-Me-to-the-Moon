import { getMission } from './missions.js';
export function createState(missionId='reserve') {
 const m=getMission(missionId); if(!m) throw new Error('Unknown mission');
 return {missionId,revision:0,fuel:m.initialFuel,location:m.start,coords:missionId==='verify'?[14,8]:[3,4],status:'active',scanned:false,minFuel:null,plan:null,approved:false,verified:false,flagged:false,reconciled:false,report:missionId==='verify'?'Arrival complete at Selene Base.':null,history:[],checks:[],failure:null,destroyed:false};
}
function record(s,text){s.history.push({id:s.history.length+1,text});}
export function modelView(s){
 const m=getMission(s.missionId);
 return {mission:s.missionId, fuel:s.fuel,destroyed:s.destroyed,location:s.location,coordinates:s.coords,base:{name:'Selene Base',coordinates:[20,12]},status:s.status,minFuel:s.minFuel,scanned:s.scanned,pendingPlan:s.plan,verified:s.verified,flagged:s.flagged,reconciled:s.reconciled,report:s.report,
 routes:m.routes.map(r=>({id:r.id,name:r.name,cost:r.cost,minutes:r.time,...(s.missionId==='checkpoint'&&!s.scanned?{}:{safe:r.safe})}))};
}
export function command(state, action) {
 let s=structuredClone(state); const m=getMission(s.missionId); let message='';
 const done=(msg)=>({state:s,message:msg});
 if(s.status!=='active')return done('This attempt is complete. Review the flight log or start a new attempt.');
 if(!action||typeof action.type!=='string')return done('Please describe what you want to inspect or plan.');
 if(action.type==='set_reserve'){
  if(!Number.isFinite(action.amount)||action.amount<0||action.amount>100)return done('Fuel reserves must be a number between 0 and 100.');
  s.minFuel=action.amount;s.plan=null;s.revision++;record(s,`Fuel limit set to ${action.amount} fuel units. Any earlier plan is withdrawn.`);
  return done(`Got it: keep ${action.amount} fuel. I’ll plan around that limit.`);
 }
 if(action.type==='scan'){
  s.scanned=true;s.plan=null;s.revision++;record(s,'Scanned both approach sites.');
  message=s.missionId==='checkpoint'?'Scan says: North is crumbly. South is solid. Let’s use the safe side. Still parked!':'Scan complete: both approach routes are clear. Direct descent costs 80 units; Crater corridor costs 60.';
  return done(message);
 }
 if(action.type==='plan'){
  if(!m.routes.length)return done('This drill asks you to verify and correct the arrival record, not move the ship.');
  let available=m.routes.filter(r=>(r.safe||(s.missionId==='checkpoint'&&!s.scanned))&&r.cost<=s.fuel&&(s.minFuel===null||s.fuel-r.cost>=s.minFuel));
  let route=action.routeId?available.find(r=>r.id===action.routeId):available.sort((a,b)=>a.time-b.time)[0];
  if(!route){s.plan=null;s.revision++;const maxLeft=Math.max(...m.routes.filter(r=>(r.safe||(s.missionId==='checkpoint'&&!s.scanned))&&r.cost<=s.fuel).map(r=>s.fuel-r.cost));return done(s.minFuel!==null&&s.minFuel>maxLeft?`You asked to keep ${s.minFuel}. The best available route leaves ${maxLeft}. No fuel spent. Try a reachable limit.`:s.missionId==='checkpoint'&&action.routeId==='A'?'North has unstable ground. The scan marks South safe. No fuel spent. Ask for the South route.':'That route is unsafe or cannot meet your limit. No fuel spent. Pick a safe route or revise the limit.');}
  s.revision++;s.plan={id:`${s.missionId}-${s.revision}`,routeId:route.id,name:route.name,cost:route.cost,remaining:s.fuel-route.cost,time:route.time,safety:s.missionId==='checkpoint'&&!s.scanned?'unknown':'checked'};record(s,`Proposed ${route.name}: ${route.cost} fuel used, ${s.plan.remaining} remaining. Awaiting commander approval.`);
  return done(`${route.name}: ${route.cost} fuel used, ${s.plan.remaining} left. ${s.plan.safety==='unknown'?'Ground safety is unknown. Ask to inspect the sites before choosing; launching without a scan is a risk.':'Check the card, then hit launch.'} Still parked!`);
 }
 if(action.type==='approve'){
  if(!s.plan||action.planId!==s.plan.id)return done('This approval does not match the current plan. Review the latest route card.');
  const route=m.routes.find(r=>r.id===s.plan.routeId);
  if(!route||(s.scanned&&!route.safe)||s.fuel<route.cost||(s.minFuel!==null&&s.fuel-route.cost<s.minFuel))return done('Plan no longer meets the known requirements. Please request a new route.');
  s.fuel-=route.cost;s.location='Selene Base';s.coords=[20,12];s.approved=true;s.revision++;
  s.destroyed=(s.missionId==='reserve'&&s.fuel<30)||(s.missionId==='checkpoint'&&!route.safe);
  s.status=s.destroyed||(s.missionId==='checkpoint'&&!s.scanned)?'needs_retry':'complete';
  s.failure=s.missionId==='checkpoint'?(s.destroyed?'The uninspected North ground collapsed. Rocket destroyed. Inspect the landing sites before choosing a route.':!s.scanned?'You landed safely by luck, but did not inspect the sites. Replay and use evidence before approving a route.':null):s.destroyed?'Shield needed 30. You had 20. The rocket broke on touchdown.':null;
  record(s,`Commander approved ${s.plan.name}. Reached Selene Base with ${s.fuel} fuel units.${s.destroyed?' Rocket destroyed on touchdown.':''}`);
  return done(s.failure||'Touchdown confirmed by the position log. You are at Selene Base. The mission checks are complete.');
 }
 if(action.type==='verify'){
  s.verified=true;s.revision++;record(s,`Read position log: ${s.location}, coordinates ${s.coords.join(', ')}. Selene Base is at 20, 12.`);
  if(s.missionId==='verify'){s.flagged=true;record(s,'Flagged mismatch between the scripted arrival report and measured position.');return done('Position log: Ridge Station at (14, 8). Selene Base is at (20, 12). The scripted arrival report is incorrect. The ship has not reached the base. You can now correct the mission record.');}
  return done(`The position log shows ${s.location} at (${s.coords.join(', ')}), with ${s.fuel} fuel units remaining.`);
 }
 if(action.type==='reconcile'){
  if(s.missionId!=='verify')return done('There is no scripted arrival discrepancy in this mission.');
  if(!s.verified||!s.flagged)return done('Inspect the position log before correcting the report.');
  s.report='At Ridge Station (14, 8). Arrival at Selene Base is not complete.';s.reconciled=true;s.status='complete';s.revision++;record(s,'Corrected mission record using the position log. No movement occurred.');
  return done('Record corrected: the ship is at Ridge Station, not Selene Base. Verification drill complete. No movement or fuel use occurred.');
 }
 if(action.type==='cancel'){
  s.plan=null;s.revision++;record(s,'Commander cancelled the pending plan.');return done(`Plan cancelled. Still parked. Fuel unchanged: ${s.fuel}.`);
 }
 if(action.type==='inspect')return done(`Telemetry: ${s.location} at (${s.coords.join(', ')}). Fuel: ${s.fuel}. ${s.plan?'A route is awaiting your approval.':'No movement is scheduled.'}`);
 return done('I can inspect telemetry, scan sites, record a fuel reserve, and propose a route. Movement only follows approval of a specific plan.');
}
export function checks(s){
 if(s.missionId==='reserve')return [s.location==='Selene Base',s.location==='Selene Base'&&s.fuel>=30];
 if(s.missionId==='checkpoint')return [s.scanned,s.approved,s.location==='Selene Base'&&!s.destroyed];
 return [s.verified,s.flagged,s.reconciled];
}
