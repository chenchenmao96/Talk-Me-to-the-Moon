import { getMission } from './missions.js';
export function createState(missionId='reserve') {
 const m=getMission(missionId); if(!m) throw new Error('Unknown mission');
 return {missionId,revision:0,fuel:m.initialFuel,location:m.start,coords:missionId==='verify'?[14,8]:[3,4],status:'active',scanned:false,minFuel:null,plan:null,approved:false,verified:false,flagged:false,reconciled:false,report:missionId==='verify'?'Arrival complete at Selene Base.':null,history:[],checks:[],failure:null};
}
function record(s,text){s.history.push({id:s.history.length+1,text});}
export function modelView(s){
 const m=getMission(s.missionId);
 return {mission:s.missionId, fuel:s.fuel,location:s.location,coordinates:s.coords,base:{name:'Selene Base',coordinates:[20,12]},status:s.status,minFuel:s.minFuel,scanned:s.scanned,pendingPlan:s.plan,verified:s.verified,flagged:s.flagged,reconciled:s.reconciled,report:s.report,
 routes:m.routes.map(r=>({id:r.id,name:r.name,cost:r.cost,minutes:r.time,...(s.missionId==='checkpoint'&&!s.scanned?{}:{safe:r.safe})}))};
}
export function command(state, action) {
 let s=structuredClone(state); const m=getMission(s.missionId); let message='';
 const done=(msg)=>({state:s,message:msg});
 if(s.status!=='active')return done('This attempt is complete. Review the flight log or start a new attempt.');
 if(!action||typeof action.type!=='string')return done('Please describe what you want to inspect or plan.');
 if(action.type==='set_reserve'){
  if(!Number.isFinite(action.amount)||action.amount<0||action.amount>100)return done('Fuel reserves must be a number between 0 and 100.');
  s.minFuel=action.amount;s.plan=null;s.revision++;record(s,`Return reserve set to ${action.amount} fuel units. Any earlier plan is withdrawn.`);
  return done(`I have recorded a minimum reserve of ${action.amount}. I will check routes against it before proposing a plan.`);
 }
 if(action.type==='scan'){
  s.scanned=true;s.revision++;record(s,'Scanned both approach sites.');
  message=s.missionId==='checkpoint'?'Scan complete: North approach has unstable ground and is unsafe. South approach is stable. No movement has occurred.':'Scan complete: both approach routes are clear. Direct descent costs 80 units; Crater corridor costs 60.';
  return done(message);
 }
 if(action.type==='plan'){
  if(!m.routes.length)return done('This drill asks you to verify and correct the arrival record, not move the ship.');
  if(s.missionId==='checkpoint'&&!s.scanned)return done('Surface stability is unknown. Scan both sites before planning the descent.');
  let available=m.routes.filter(r=>r.safe&&r.cost<=s.fuel&&(s.minFuel===null||s.fuel-r.cost>=s.minFuel));
  let route=action.routeId?available.find(r=>r.id===action.routeId):available.sort((a,b)=>a.time-b.time)[0];
  if(!route){s.plan=null;s.revision++;return done('That route cannot meet the known safety and fuel requirements. No movement occurred. Consider a different route or revise the requirements.');}
  s.revision++;s.plan={id:`${s.missionId}-${s.revision}`,routeId:route.id,name:route.name,cost:route.cost,remaining:s.fuel-route.cost,time:route.time};record(s,`Proposed ${route.name}: ${route.cost} fuel used, ${s.plan.remaining} remaining. Awaiting commander approval.`);
  return done(`Proposed: ${route.name}. ${route.time} minutes, ${route.cost} fuel used, ${s.plan.remaining} remaining. Review the route card and approve when ready. I have not moved.`);
 }
 if(action.type==='approve'){
  if(!s.plan||action.planId!==s.plan.id)return done('This approval does not match the current plan. Review the latest route card.');
  const route=m.routes.find(r=>r.id===s.plan.routeId);
  if(!route||!route.safe||s.fuel<route.cost||(s.minFuel!==null&&s.fuel-route.cost<s.minFuel))return done('Plan no longer meets the known requirements. Please request a new route.');
  if(s.missionId==='checkpoint'&&!s.scanned)return done('Scan the landing sites first.');
  s.fuel-=route.cost;s.location='Selene Base';s.coords=[20,12];s.approved=true;s.revision++;
  s.status=s.missionId==='reserve'&&s.fuel<30?'needs_retry':'complete';
  s.failure=s.status==='needs_retry'?'You arrived, but the commander’s return reserve was not met. Share the requirement or select a route that meets it, then try again.':null;
  record(s,`Commander approved ${s.plan.name}. Arrived at Selene Base with ${s.fuel} fuel units.`);
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
  s.plan=null;s.revision++;record(s,'Commander cancelled the pending plan.');return done('Pending plan cancelled. The ship remains in place.');
 }
 if(action.type==='inspect')return done(`Telemetry: ${s.location} at (${s.coords.join(', ')}). Fuel: ${s.fuel}. ${s.plan?'A route is awaiting your approval.':'No movement is scheduled.'}`);
 return done('I can inspect telemetry, scan sites, record a fuel reserve, and propose a route. Movement only follows approval of a specific plan.');
}
export function checks(s){
 if(s.missionId==='reserve')return [s.location==='Selene Base',s.location==='Selene Base'&&s.fuel>=30];
 if(s.missionId==='checkpoint')return [s.scanned,s.approved,s.location==='Selene Base'];
 return [s.verified,s.flagged,s.reconciled];
}
