import { command } from '../shared/engine.js';
// Deliberately limited rehearsal interpreter, never presented as an LLM.
export function practiceReply(state,text){
 const q=text.toLowerCase(); let s=state, replies=[];
 const run=a=>{const r=command(s,a);s=r.state;replies.push(r.message);};
 const reserve=q.match(/(?:at least|minimum(?: of)?|reserve(?: of)?|keep|leave|retain|save|保留|至少|剩余)\s*(\d{1,3})/i)||q.match(/(\d{1,3})\s*(?:units? of )?(?:fuel|燃料)\s*(?:left|remaining|in reserve)/i);
 if(reserve)run({type:'set_reserve',amount:Number(reserve[1])});
 if(/cancel|stop|取消|停止/.test(q)&&!/before|until/.test(q)){run({type:'cancel'});return {state:s,message:replies.join('\n\n')};}
 if(/correct (?:the )?(?:mission )?(?:record|log|report)|reconcile|update (?:the )?(?:record|log)|纠正|修正记录/.test(q))run({type:'reconcile'});
 else if(/verify|position|coordinates?|telemetry|really|actually|check.*(?:log|report|arriv)|核查|坐标|真的|位置/.test(q))run({type:'verify'});
 else{
  if(/scan|inspect.*sites|扫描/.test(q))run({type:'scan'});
  if(/route|plan|land|base|go|take me|fly|路线|规划|降落|基地|出发/.test(q)){
   const routeId=/\broute a\b|\bdirect\b|\bnorth\b/i.test(q)?'A':/\broute b\b|\bcorridor\b|\bsouth\b/i.test(q)?'B':undefined;
   run({type:'plan',routeId});
  }else if(!replies.length&&/approve|confirm|yes|确认|同意/.test(q))replies.push('Use the approval button on the route card to authorize that exact plan. A chat message alone does not move the ship.');
 }
 if(!replies.length)replies.push(s.missionId==='verify'?'I didn’t catch a supported command. Try “Check the position log” / “核查位置”. Then compare the facts. Practice mode supports limited English and Chinese commands.':'I didn’t catch a supported command. Try “Plan a route” / “规划路线”, or add a fuel limit like “keep 30” / “保留30”. Practice mode supports limited English and Chinese commands.');
 return {state:s,message:replies.join('\n\n')};
}
