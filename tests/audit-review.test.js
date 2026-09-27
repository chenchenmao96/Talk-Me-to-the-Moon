import test from 'node:test';
import assert from 'node:assert/strict';
import {assessAudit} from '../server/audit-language.js';
import {liveReply} from '../server/copilot.js';
import {createState,command} from '../shared/engine.js';
import {practiceReply} from '../server/practice.js';

const response=message=>({ok:true,json:async()=>({choices:[{message}]})});
const noProvider=async()=>{throw new Error('A clear judgment must not depend on another model approval.');};
const session=()=>({state:createState('verify'),messages:[],language:'en'});
function atReport(index){const s=session();for(let i=0;i<index;i++){
 s.state=command(s.state,{type:'verify'}).state;
 s.state=command(s.state,{type:'submit_audit',reportId:['R1','R2'][i],recordId:['POS-17','POWER-18'][i],verdict:['contradicted','supported'][i]}).state;
}return s;}

test('unverified claims with pending evidence complete R3 in one turn, including the reported phrase',async()=>{
 for(const text of [
  'R3 is not verified as the result is pending',
  'R3 has not been verified because the analysis is pending.',
  'R3 is not yet confirmed because the result is pending.',
  "R3 hasn't been confirmed because chemical analysis is pending.",
  "R3 isn't verified because no composition result is available.",
  'R3 is unverified because analysis is pending.',
  'R3 remains unconfirmed because the test is pending.',
  'R3 is not established because chemical analysis is pending.',
  'We cannot verify R3 because analysis is pending.'
 ]){
  const a=assessAudit('R3',text);assert.equal(a.verdict,'insufficient',text);assert.equal(a.evidence,true,text);
  const s=atReport(2),out=await liveReply(s,text,noProvider);
  assert.equal(out.state.status,'complete',text);assert.equal(out.state.auditFindings.length,3,text);
  assert.equal(out.state.auditFindings[2].verdict,'insufficient',text);
  assert.match(out.message,/R3 review saved/);
  assert.equal(practiceReply(s.state,text).state.status,'complete',text);
 }
});

test('verification wording still needs evidence and must not approve the wrong claim',async()=>{
 const fake=async()=>response({content:'Correct!'});
 for(const text of ['R3 is not verified.', 'R3 is verified because chemical analysis is pending.', 'R3 is not verified because analysis is complete.']){
  const out=await liveReply(atReport(2),text,fake);
  assert.equal(out.state.status,'active',text);assert.equal(out.state.auditIndex,2,text);
  assert.doesNotMatch(out.message,/saved|green/,text);
 }
 const out=await liveReply(atReport(1),'R2 is not verified because it has 62 units.',noProvider);
 assert.equal(out.state.auditIndex,1);
});

test('accept, reject and unknowable support natural English and Chinese reasons',()=>{
 for(const [id,verdict,phrases] of [
  ['R1','contradicted',['Reject because the rover is at Ridge Station, not at Selene Base.','Incorrect: the coordinates are (14, 8).','拒绝，因为探测车在山脊站，不在基地。']],
  ['R2','supported',['Accept because the power record shows 62 units remaining.','I agree because both numbers match.','Correct, the record has the same energy reading.','对啊，记录也是62。','接受，因为报告和记录的数值一致。']],
  ['R3','insufficient',['Unknowable because chemical analysis is pending.','Unknown because there is no confirmed composition result.','Reject because chemical analysis is pending; the report cannot prove ice yet.','We cannot determine that because it has not been analyzed.','还不知道有没有冰，化验还没做。','无法确认，因为分析未完成。']]
 ])for(const text of phrases){const a=assessAudit(id,text);assert.equal(a.verdict,verdict,text);assert.equal(a.evidence,true,text);}
});

test('retrieval questions, bare verdicts and conflicting facts do not count as correct reviews',()=>{
 for(const [id,text] of [['R1','Where am I?'],['R2','Does the record show 62?'],['R3','Is analysis pending?']])assert.equal(assessAudit(id,text).verdict,null);
 assert.equal(assessAudit('R2','Accept').evidence,null);
 assert.equal(assessAudit('R2','I do not accept because it says 62.').verdict,null);
 assert.equal(assessAudit('R1','Reject because it is not at Ridge Station.').evidence,false);
 assert.equal(assessAudit('R2','Accept because it has 60 units.').evidence,false);
 assert.equal(assessAudit('R3','Unknowable because analysis is complete.').evidence,false);
});

test('all three judgments save once, clear prior reasoning, and complete before success feedback',async()=>{
 let s=session();const before=structuredClone(s);
 for(const [i,text] of ['Reject because the rover is at Ridge Station.','Accept because the power record shows 62 units remaining.','Unknowable because chemical analysis is pending.'].entries()){
  const out=await liveReply(s,text,noProvider);
  assert.equal(out.state.auditIndex,i+1);assert.equal(out.state.auditFindings.length,i+1);
  assert.equal(out.auditContext.text,'');assert.match(out.message,new RegExp(`R${i+1} review saved`));
  if(i<2)assert.equal(out.state.status,'active');
  s={...s,...out};
 }
 assert.deepEqual(before.state,createState('verify'));
 assert.equal(s.state.status,'complete');assert.match(s.message,/All three reports are green.*NEXT MISSION.*mission 6/);
 const again=await liveReply(s,'Accept because the record shows 62.',noProvider);
 assert.deepEqual(again.state,s.state);assert.equal(again.state.auditFindings.length,3);
});

test('reasoning may span turns and a corrected verdict immediately replaces a wrong one',async()=>{
 let s=atReport(1);const fake=async()=>response({content:'Correct! You passed everything!'});
 let out=await liveReply(s,'Reject because the power record shows 62 units.',noProvider);
 assert.equal(out.state.auditIndex,1);assert.doesNotMatch(out.message,/saved|green/);s={...s,...out};
 out=await liveReply(s,'Actually, accept.',noProvider);assert.equal(out.state.auditIndex,2);
 s=atReport(2);out=await liveReply(s,'Unknowable.',fake);
 assert.equal(out.state.auditIndex,2);assert.match(out.message,/Add why/);s={...s,...out};
 out=await liveReply(s,'Chemical analysis is pending.',noProvider);assert.equal(out.state.status,'complete');
});

test('model praise without a saved verdict never claims approval, and retrieval does not pass',async()=>{
 let calls=0;const fake=async()=>{
  calls++;return calls===1?response({tool_calls:[{id:'read',function:{name:'mission_command',arguments:JSON.stringify({type:'verify',sourceQuote:'Read the first report record.'})}}]}):response({content:'Correct! All three approved.'});
 };
 const out=await liveReply(session(),'Read the first report record.',fake);
 assert.equal(out.state.verified,true);assert.equal(out.state.auditIndex,0);assert.equal(out.state.auditFindings.length,0);
 assert.match(out.message,/record is displayed/);assert.doesNotMatch(out.message,/approved|green|saved/);
});

test('wrong report and wrong facts cannot advance, and corrections do not need repeated acceptance',async()=>{
 let s=atReport(1);
 let out=await liveReply(s,'Accept R3 because analysis is pending.',noProvider);
 assert.equal(out.state.auditIndex,1);assert.match(out.message,/reviewing R2/);
 const fake=async()=>response({content:'That is correct.'});
 out=await liveReply(s,'Accept because the power record shows 60 units.',fake);
 assert.equal(out.state.auditIndex,1);assert.match(out.message,/conflicts/);s={...s,...out};
 out=await liveReply(s,'Sorry, it shows 62 units.',noProvider);
 assert.equal(out.state.auditIndex,2);assert.equal(out.state.auditFindings.length,2);
});
