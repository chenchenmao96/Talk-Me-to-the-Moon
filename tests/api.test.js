import test from 'node:test';
import assert from 'node:assert/strict';
import { server } from '../server/index.js';
test('HTTP session isolation, revision checks, valid mission flow and invalid requests',async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 const post=async(path,data)=>{const r=await fetch(base+'/api/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:r.status,body:await r.json()};};
 try{
  const key=process.env.DEEPSEEK_API_KEY;
  try{process.env.DEEPSEEK_API_KEY='test-placeholder';const live=await post('session',{missionId:'checkpoint'});assert.equal(live.body.mode,'live');delete process.env.DEEPSEEK_API_KEY;assert.equal((await post('session',{missionId:'checkpoint'})).status,503);}finally{if(key===undefined)delete process.env.DEEPSEEK_API_KEY;else process.env.DEEPSEEK_API_KEY=key;}
  const a=await post('session',{missionId:'reserve',mode:'practice'}),b=await post('session',{missionId:'verify',mode:'practice'});
  assert.equal(a.status,201);assert.notEqual(a.body.sessionId,b.body.sessionId);
  for(const missionId of ['reserve','context','checkpoint','examples','verify','iterate']){
   const intro=await post('session',{missionId,mode:'practice',language:'en'});
   assert.doesNotMatch(intro.body.messages[0].content,/\p{Script=Han}/u);
  }
  const chinese=await post('session',{missionId:'iterate',mode:'practice',language:'zh'});
  assert.match(chinese.body.messages[0].content,/样本/);
  const english=await post('language',{sessionId:chinese.body.sessionId,revision:0,language:'en'});
  assert.equal(english.status,200);assert.equal(english.body.language,'en');
  assert.doesNotMatch(english.body.messages[0].content,/\p{Script=Han}/u);
  assert.deepEqual(english.body.state,chinese.body.state);
  const back=await post('language',{sessionId:chinese.body.sessionId,revision:0,language:'zh'});
  assert.equal(back.body.messages[0].content,chinese.body.messages[0].content);
  assert.deepEqual(back.body.state,chinese.body.state);
  assert.equal((await post('language',{sessionId:chinese.body.sessionId,revision:0,language:'fr'})).status,400);
  const r=await post('chat',{sessionId:a.body.sessionId,revision:0,message:'Go to the base with at least 30 fuel remaining.'});assert.equal(r.status,200);assert.equal(r.body.state.plan.remaining,40);
  const stale=await post('action',{sessionId:a.body.sessionId,revision:0,action:'approve',planId:r.body.state.plan.id});assert.equal(stale.status,409);
  const finish=await post('action',{sessionId:a.body.sessionId,revision:r.body.state.revision,action:'approve',planId:r.body.state.plan.id});assert.equal(finish.body.state.status,'complete');assert.equal(finish.body.state.fuel,40);
  const verify=await post('chat',{sessionId:b.body.sessionId,revision:0,message:'Check the position log.'});assert.equal(verify.body.state.fuel,62);assert.equal(verify.body.state.location,'Ridge Station');
  // The actual chat API must commit each review before returning its confirmation.
  for(const mode of ['practice','live']){
   const key=process.env.DEEPSEEK_API_KEY;process.env.DEEPSEEK_API_KEY='test-placeholder';
   try{
    let review=await post('session',{missionId:'verify',mode,language:'en'});
    for(const [i,message] of ['Reject because the rover is at Ridge Station.','Accept because the power record shows 62 units remaining.','R3 is not verified as the result is pending'].entries()){
     review=await post('chat',{sessionId:review.body.sessionId,revision:review.body.state.revision,message});
     assert.equal(review.status,200);assert.equal(review.body.state.auditIndex,i+1);
     assert.equal(review.body.state.auditFindings.length,i+1);
     assert.match(review.body.messages.at(-1).content,/review saved/);
    }
    assert.equal(review.body.state.status,'complete');
    assert.match(review.body.messages.at(-1).content,/NEXT MISSION.*mission 6/);
   }finally{if(key===undefined)delete process.env.DEEPSEEK_API_KEY;else process.env.DEEPSEEK_API_KEY=key;}
  }
  assert.equal((await post('session',{missionId:'unknown',mode:'practice'})).status,400);
  assert.equal((await post('chat',{sessionId:b.body.sessionId,revision:verify.body.state.revision,message:'x'.repeat(1201)})).status,400);
  assert.equal((await post('action',{sessionId:b.body.sessionId,revision:verify.body.state.revision,action:'set_fuel'})).status,400);
  const denied=await fetch(base+'/api/session',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://unrelated.example'},body:'{}'});assert.equal(denied.status,403);
  const secret=await fetch(base+'/.env');assert.equal(secret.status,404);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
