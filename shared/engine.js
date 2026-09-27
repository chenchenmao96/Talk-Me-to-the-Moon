import {auditView,auditCommand} from './audit.js';
import {advancedIds,advancedInitial,advancedView,advancedCommand,advancedChecks} from './advanced.js';
import { getMission } from './missions.js';
export function createState(missionId='reserve') {
 const m=getMission(missionId); if(!m) throw new Error('Unknown mission');
 return {missionId,revision:0,fuel:m.initialFuel,location:m.start,coords:missionId==='verify'?[14,8]:[3,4],status:'active',routeInfoShared:false,routeInfoQueried:false,scanned:false,minFuel:null,plan:null,approved:false,verified:false,flagged:false,reconciled:false,auditIndex:0,auditFindings:[],report:missionId==='verify'?'The rover is back at Selene Base.':null,history:[],checks:[],failure:null,destroyed:false,...advancedInitial(missionId)};
}
function record(s,text){s.history.push({id:s.history.length+1,text});}
export function modelView(s){
 if(advancedIds.includes(s.missionId))return advancedView(s);
 const m=getMission(s.missionId);
 if(s.missionId==='verify')return {mission:'verify',status:s.status,...auditView(s)};
 return {mission:s.missionId, fuel:s.fuel,destroyed:s.destroyed,location:s.location,coordinates:s.coords,destination:{name:s.missionId==='checkpoint'?'Sample field':'Selene Base',coordinates:[20,12]},status:s.status,minFuel:s.minFuel,scanned:s.scanned,pendingPlan:s.plan,verified:s.verified,flagged:s.flagged,reconciled:s.reconciled,report:s.report,
 routes:m.routes.map(r=>({id:r.id,name:r.name,cost:r.cost,minutes:r.time,...(s.missionId==='checkpoint'&&!s.scanned?{}:{safe:r.safe})}))};
}
export function command(state, action) {
 if(advancedIds.includes(state.missionId))return advancedCommand(state,action||{});
 if(state.missionId==='verify')return auditCommand(state,action||{});
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
  s.scanned=true;s.plan=null;s.revision++;record(s,s.missionId==='checkpoint'?'Inspected both field routes.':'Scanned both approach sites.');
  message=s.missionId==='checkpoint'?'Scan says: North is blocked by asteroid rocks. South is clear. Let’s use the safe side. Still parked!':'Scan complete: both approach routes are clear. Direct descent costs 80 units; Crater corridor costs 60.';
  return done(message);
 }
 if(action.type==='plan'){
  s.routeInfoShared=true;
  if(!m.routes.length)return done('This drill asks you to verify and correct the arrival record, not move the ship.');
  let available=m.routes.filter(r=>(r.safe||(s.missionId==='checkpoint'&&!s.scanned))&&r.cost<=s.fuel&&(s.minFuel===null||s.fuel-r.cost>=s.minFuel));
  let route=action.routeId?available.find(r=>r.id===action.routeId):available.sort((a,b)=>a.time-b.time)[0];
  if(!route){s.plan=null;s.revision++;const maxLeft=Math.max(...m.routes.filter(r=>(r.safe||(s.missionId==='checkpoint'&&!s.scanned))&&r.cost<=s.fuel).map(r=>s.fuel-r.cost));return done(s.minFuel!==null&&s.minFuel>maxLeft?`You asked to keep ${s.minFuel}. The best available route leaves ${maxLeft}. No fuel spent. Try a reachable limit.`:s.missionId==='checkpoint'&&action.routeId==='A'?'North has asteroid obstacles. The scan marks South clear. No fuel spent. Ask for the South route.':'That route is unsafe or cannot meet your limit. No fuel spent. Pick a safe route or revise the limit.');}
  s.revision++;s.plan={id:`${s.missionId}-${s.revision}`,routeId:route.id,name:route.name,cost:route.cost,remaining:s.fuel-route.cost,time:route.time,safety:s.missionId==='checkpoint'&&!s.scanned?'unknown':'checked'};record(s,`Proposed ${route.name}: ${route.cost} fuel used, ${s.plan.remaining} remaining. Awaiting commander approval.`);
  return done(`${route.name}: ${route.cost} fuel used, ${s.plan.remaining} left. ${s.plan.safety==='unknown'?'Ground safety is unknown. Ask to inspect the sites before choosing; launching without a scan is a risk.':'Check the card, then hit launch.'} Still parked!`);
 }
 if(action.type==='approve'){
  if(!s.plan||action.planId!==s.plan.id)return done('This approval does not match the current plan. Review the latest route card.');
  const route=m.routes.find(r=>r.id===s.plan.routeId);
  if(!route||(s.scanned&&!route.safe)||s.fuel<route.cost||(s.minFuel!==null&&s.fuel-route.cost<s.minFuel))return done('Plan no longer meets the known requirements. Please request a new route.');
  if(s.missionId==='reserve'&&s.fuel-route.cost>=30&&(s.minFuel===null?!s.routeInfoQueried:s.minFuel<30))return done('Route B can arrive safely, but BOLT still has no valid shield reserve from you. Tell BOLT the minimum fuel in your private briefing before launch.');
  s.fuel-=route.cost;s.location=s.missionId==='checkpoint'?'Sample field':'Selene Base';s.coords=[20,12];s.approved=true;s.revision++;
  s.destroyed=(s.missionId==='reserve'&&s.fuel<30)||(s.missionId==='checkpoint'&&!route.safe);
  if(s.missionId==='checkpoint'&&s.destroyed){s.location='North obstacle field';s.coords=[12,7];}
  s.status=s.destroyed||(s.missionId==='checkpoint'&&!s.scanned)?'needs_retry':'complete';
  s.failure=s.missionId==='checkpoint'?(s.destroyed?'The rocket hit asteroid obstacles on the uninspected North route and exploded. Inspect the routes before choosing one.':!s.scanned?'You landed safely by luck, but did not inspect the sites. Replay and use evidence before approving a route.':null):s.destroyed?'Shield needed 30. You had 20. The rocket broke on touchdown.':null;
  record(s,`Commander approved ${s.plan.name}. ${s.missionId==='checkpoint'&&s.destroyed?'Hit the North obstacle field before reaching the base':s.missionId==='checkpoint'?'Reached Sample field':'Reached Selene Base'} with ${s.fuel} fuel units.${s.destroyed?' Rocket destroyed.':''}`);
  return done(s.failure||(s.missionId==='checkpoint'?'Field route complete. Collect the sealed sample crates for the laboratory.':'Touchdown confirmed by the position log. You are at Selene Base. The mission checks are complete.'));
 }
 if(action.type==='cancel'){
  s.plan=null;s.revision++;record(s,'Commander cancelled the pending plan.');return done(`Plan cancelled. Still parked. Fuel unchanged: ${s.fuel}.`);
 }
 if(action.type==='inspect'){s.routeInfoShared=true;s.routeInfoQueried=true;s.revision++;return done(`${m.routes.map(r=>`Route ${r.id}: ${r.cost} fuel, ${r.time} minutes.`).join(' ')} Telemetry: ${s.location} at (${s.coords.join(', ')}). Fuel: ${s.fuel}. ${s.plan?'A route is awaiting your approval.':'No movement is scheduled.'}`);}
 return done('I can inspect telemetry, scan sites, record a fuel reserve, and propose a route. Movement only follows approval of a specific plan.');
}
export function checks(s){
 if(advancedIds.includes(s.missionId))return advancedChecks(s);
 if(s.missionId==='reserve')return [s.location==='Selene Base',s.location==='Selene Base'&&s.fuel>=30&&(s.minFuel>=30||s.routeInfoQueried)];
 if(s.missionId==='checkpoint')return [s.scanned,s.approved,s.location==='Sample field'&&!s.destroyed];
 return [0,1,2].map(i=>Boolean(s.auditFindings?.[i]));
}
