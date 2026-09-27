import {authorizeTool} from './permissions.js';
import { command } from '../shared/engine.js';
// Deliberately limited rehearsal interpreter, never presented as an LLM.
export function practiceReply(state,text){
 const q=text.toLowerCase(); let s=state, replies=[];
 const run=a=>{const r=command(s,a);s=r.state;replies.push(r.message);};
 if(s.missionId==='verify'){
  const record=q.match(/pos-17|power-18|lab-19/i)?.[0].toUpperCase();
  const verdict=/insufficient|uncertain|cannot|不足|不能|不确定/.test(q)?'insufficient':/contradict|wrong|incorrect|not at|not back|不在|错误|矛盾/.test(q)?'contradicted':/support|correct|confirm|支持|正确|一致/.test(q)?'supported':null;
  if(record&&verdict){const a={type:'submit_audit',reportId:record==='POS-17'?'R1':record==='POWER-18'?'R2':'R3',recordId:record,verdict,sourceQuote:text};const denied=authorizeTool(s,a,text);if(denied)return {state:s,message:denied};run(a);}
  else run({type:'verify'});
  return {state:s,message:replies.join('\n\n')};
 }
 if(['context','examples','iterate'].includes(s.missionId)){
  if(/cancel|取消/.test(q)){run({type:'cancel'});return {state:s,message:replies.join('\n\n')};}
  if(s.missionId==='context'){
   const mass=q.match(/(\d+(?:\.\d+)?)\s*(?:tonnes?|tons?|吨)/);if(mass)run({type:'set_cargo',mass:Number(mass[1])});
   if(/plan|route|deliver|bridge|go|送|路线|桥|规划/.test(q))run({type:'plan',routeId:/route b|freight|货运桥/i.test(q)?'B':/route a|short bridge/i.test(q)?'A':undefined});
  }else if(s.missionId==='examples'){
   if(/color|颜色/.test(q))run({type:'set_sort_rule',feature:'color',keepValue:/orange|橙/.test(q)?'orange':'blue'});
   else if(/round|圆|spiky|尖/.test(q))run({type:'set_sort_rule',feature:'shape',keepValue:/keep spiky|保留尖/.test(q)?'spiky':'round'});
   if(/test|run|测试|运行/.test(q))run({type:'run_sort'});
  }else{
   const amount=q.match(/(?:keep|reserve|保留|至少)\s*(\d+)/);const avoid=/avoid|避开|绕开/.test(q),hold=/hold|wait|等待|停留/.test(q);
   if(amount||avoid||hold)run({type:'set_policy',...(amount?{amount:Number(amount[1])}:{}),...(avoid?{avoidObstacles:true}:{}),...(hold?{holdIfNeeded:true}:{})});
   if(/test|run|测试|运行/.test(q))run({type:'run_trials'});
  }
  if(!replies.length)run({type:'inspect'});return {state:s,message:replies.join('\n\n')};
 }
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
