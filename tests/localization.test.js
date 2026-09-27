import test from 'node:test';
import assert from 'node:assert/strict';
import {localizedMessages,displayedMessages,translateTexts} from '../server/localization.js';
import {liveReply} from '../server/copilot.js';
import {createState} from '../shared/engine.js';
const response=content=>({ok:true,json:async()=>({choices:[{message:{role:'assistant',content}}]})});

test('language switch translates dialogue, preserves player words, and caches the round trip',async()=>{
 const messages=[
  {role:'assistant',content:'你好',translations:{zh:'你好',en:'Hello'}},
  {role:'user',content:'保留30燃料'},
  {role:'assistant',content:'B路线剩余40燃料。'},
  {role:'user',synthetic:true,localizable:false,content:'Approve the displayed flight plan.'}
 ];
 const before=structuredClone(messages);let calls=0;
 const fake=async(_,options)=>{
  calls++;const body=JSON.parse(options.body);assert.equal(body.tools,undefined);
  assert.deepEqual(JSON.parse(body.messages[1].content).texts,['B路线剩余40燃料。']);
  return response(JSON.stringify({translations:['Route B leaves 40 fuel.']}));
 };
 const translated=await localizedMessages(messages,'en',fake);
 const shown=displayedMessages({messages:translated,language:'en'});
 assert.equal(shown[0].content,'Hello');assert.equal(shown[1].content,'保留30燃料');
 assert.equal(shown[2].content,'Route B leaves 40 fuel.');assert.deepEqual(messages,before);
 const back=await localizedMessages(translated,'zh',fake);
 assert.equal(displayedMessages({messages:back,language:'zh'})[2].content,'B路线剩余40燃料。');
 await localizedMessages(back,'en',fake);assert.equal(calls,1);
});

test('failed or mixed-language translation never replaces the original history',async()=>{
 const messages=[{role:'assistant',content:'还剩40燃料。'}],before=structuredClone(messages);
 for(const result of [{translations:[]},{translations:['Remaining 燃料 40']},{translations:['<tool_call>']}]){
  await assert.rejects(localizedMessages(messages,'en',async()=>response(JSON.stringify(result))));
  assert.deepEqual(messages,before);
 }
 await assert.rejects(translateTexts(['你好'],'en',async()=>({ok:false})));
});

test('English UI overrides Chinese player input and repairs a Chinese model reply without changing the mission',async()=>{
 const state=createState('reserve');let calls=0;
 const fake=async(_,options)=>{
  const body=JSON.parse(options.body);calls++;
  if(calls===1){assert.match(body.messages[0].content,/Reply in English even if the player input/);return response('请查看方案。');}
  assert.equal(body.tools,undefined);
  return response(JSON.stringify({translations:['Please review the plan.']}));
 };
 const out=await liveReply({state,messages:[{role:'assistant',content:'你好'}],language:'en'},'去基地',fake);
 assert.equal(out.message,'Please review the plan.');assert.deepEqual(out.state,state);assert.equal(calls,2);
});
