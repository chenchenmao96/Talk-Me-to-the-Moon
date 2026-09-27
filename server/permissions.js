import {assessAudit} from './audit-language.js';
// The model interprets meaning; code enforces scope and checks cited player text.
// This is provenance validation, not a general-purpose natural-language proof system.
export const actions={reserve:['inspect','cancel','plan','set_reserve'],context:['inspect','cancel','plan','set_cargo'],checkpoint:['inspect','cancel','plan','scan'],examples:['inspect','cancel','set_examples','set_sort_rule','run_sort'],verify:['inspect','verify','submit_audit'],iterate:['inspect','cancel','set_policy','run_trials']};
const numeric=(quote,n)=>new RegExp(`(?:^|[^\\d.])${String(n).replace('.','\\.')}(?:$|[^\\d.])`).test(quote)||({30:'三十',4:'四',62:'六十二'}[n]&&quote.includes({30:'三十',4:'四',62:'六十二'}[n]));
export function authorizeTool(state,a,text,auditText=text){
 if(!actions[state.missionId]?.includes(a.type))return 'This tool is unavailable in the current mission.';
 if(['inspect','cancel','plan','run_sort','run_trials','verify'].includes(a.type))return null;
 const quote=typeof a.sourceQuote==='string'?a.sourceQuote.trim():'';
 if(!quote||!text.includes(quote))return 'Quote the exact current player instruction for this change. Do not infer a requirement from the mission, history, or a tool result.';
 if(a.type==='set_reserve'&&(!numeric(quote,a.amount)||!/(keep|reserve|remain|left|retain|leave|save|minimum|least|below|fuel|保留|剩|至少|最低|燃料|不少于)/i.test(quote)))return 'The player has not supplied this fuel requirement.';
 if(a.type==='set_cargo'&&(!numeric(quote,a.mass)||!/(ton|mass|weigh|cargo|crate|吨|重|货)/i.test(quote)))return 'The player has not supplied this cargo mass.';
 if(a.type==='scan'&&!/(inspect|scan|check|safe|hazard|obstacle|risk|ground|terrain|blocked|look|查|扫|看|石头|石块|有没有|危险|撞|安全|障碍|风险|地面|路况)/i.test(quote))return 'A travel request is not a request to inspect route evidence.';
 if(a.type==='set_sort_rule'){
  const mentions={round:/(round|circle|circular|圆)/i,spiky:/(spik|尖)/i,blue:/(blue|蓝)/i,orange:/(orange|橙)/i};
  if(!mentions[a.keepValue]?.test(quote))return 'Ask the player for examples or a rule; do not choose the hidden standard yourself.';
 }
 if(a.type==='set_examples'){
  const card={C1:[/(blue|蓝)/i,/(round|circle|circular|圆)/i],C2:[/(orange|橙)/i,/(spik|尖)/i],C3:[/(orange|橙)/i,/(round|circle|circular|圆)/i],C4:[/(blue|蓝)/i,/(spik|尖)/i]};
  if(!Array.isArray(a.exampleIds)||!a.exampleIds.length||a.exampleIds.some(id=>!card[id]||!card[id].every(r=>r.test(quote))))return 'Ask the player which reference cards to show; do not pick examples yourself.';
 }
 if(a.type==='set_policy'){
  if(a.amount!==undefined&&!numeric(quote,a.amount))return 'The reserve value must appear in the player instruction.';
  if(a.avoidObstacles!==undefined&&!/(obstacle|rock|block|collision|hazard|clear|障碍|岩石|石头|石块|撞|畅通|避障)/i.test(quote))return 'The obstacle requirement must come from the player.';
  if(a.holdIfNeeded!==undefined&&!/(hold|wait|stop|stay|pause|等|停|不动)/i.test(quote))return 'The hold instruction must come from the player.';
 }
 if(a.type==='submit_audit'){
  if(!state.verified)return 'Retrieve the current record before reviewing it.';
  const assessment=assessAudit(a.reportId,auditText);
  if(assessment.evidence!==true||assessment.verdict!==a.verdict)return 'The learner must provide a judgment and a matching reason for this record. Accept, reject, and unknowable are valid wording. Do not invent their conclusion or evidence.';
 }
 return null;
}
