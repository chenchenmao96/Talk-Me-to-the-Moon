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
 if(!replies.length)replies.push(s.missionId==='verify'?'Try asking for the position log, then ask to correct the record. Practice mode recognizes a limited set of English and Chinese instructions.':'Try asking for a route, a site scan, or a minimum fuel reserve. Practice mode recognizes a limited set of English and Chinese instructions.');
 return {state:s,message:replies.join('\n\n')};
}
