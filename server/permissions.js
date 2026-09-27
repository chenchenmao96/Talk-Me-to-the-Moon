// The model interprets meaning; code enforces scope and checks cited player text.
// This is provenance validation, not a general-purpose natural-language proof system.
const actions={reserve:['inspect','cancel','plan','set_reserve'],context:['inspect','cancel','plan','set_cargo'],checkpoint:['inspect','cancel','plan','scan'],examples:['inspect','cancel','set_sort_rule','run_sort'],verify:['inspect','verify','submit_audit'],iterate:['inspect','cancel','set_policy','run_trials']};
const numeric=(quote,n)=>new RegExp(`(?:^|[^\\d.])${String(n).replace('.','\\.')}(?:$|[^\\d.])`).test(quote)||({30:'三十',4:'四',62:'六十二'}[n]&&quote.includes({30:'三十',4:'四',62:'六十二'}[n]));
export function authorizeTool(state,a,text){
 if(!actions[state.missionId]?.includes(a.type))return 'This tool is unavailable in the current mission.';
 if(['inspect','cancel','plan','run_sort','run_trials','verify'].includes(a.type))return null;
 const quote=typeof a.sourceQuote==='string'?a.sourceQuote.trim():'';
 if(!quote||!text.includes(quote))return 'Quote the exact current player instruction for this change. Do not infer a requirement from the mission, history, or a tool result.';
 if(a.type==='set_reserve'&&(!numeric(quote,a.amount)||!/(keep|reserve|remain|left|retain|leave|save|minimum|least|below|fuel|保留|剩|至少|最低|燃料|不少于)/i.test(quote)))return 'The player has not supplied this fuel requirement.';
 if(a.type==='set_cargo'&&(!numeric(quote,a.mass)||!/(ton|mass|weigh|cargo|crate|吨|重|货)/i.test(quote)))return 'The player has not supplied this cargo mass.';
 if(a.type==='scan'&&!/(inspect|scan|check|safe|hazard|obstacle|risk|ground|terrain|blocked|look|查|扫|安全|障碍|风险|地面|路况)/i.test(quote))return 'A travel request is not a request to inspect route evidence.';
 if(a.type==='set_sort_rule'){
  const mentions={round:/(round|circle|circular|圆)/i,spiky:/(spik|尖)/i,blue:/(blue|蓝)/i,orange:/(orange|橙)/i};
  if(!mentions[a.keepValue]?.test(quote))return 'Ask the player for examples or a rule; do not choose the hidden standard yourself.';
 }
 if(a.type==='set_policy'){
  if(a.amount!==undefined&&!numeric(quote,a.amount))return 'The reserve value must appear in the player instruction.';
  if(a.avoidObstacles!==undefined&&!/(obstacle|rock|block|collision|hazard|clear|障碍|岩石|碰撞|畅通|避障)/i.test(quote))return 'The obstacle requirement must come from the player.';
  if(a.holdIfNeeded!==undefined&&!/(hold|wait|stop|stay|pause|等待|停|不动)/i.test(quote))return 'The hold instruction must come from the player.';
 }
 if(a.type==='submit_audit'){
  if(!quote.toUpperCase().includes(a.recordId))return 'The learner must cite the relevant record ID.';
  const evidence=a.reportId==='R1'?/(14\s*[,，]\s*8|ridge|山脊)/i.test(quote):a.reportId==='R2'?numeric(quote,62):/(pending|missing|no (?:result|analysis|composition)|not (?:yet )?(?:tested|analyzed)|unknown|待|没有|缺|未知|未.*(?:分析|检验|检测))/i.test(quote);
  const judgment=a.verdict==='contradicted'?/(wrong|incorrect|false|contradict|not (?:at|the|back|arrived)|isn.t|hasn.t|错|矛盾|不在|没.*到|未.*到)/i.test(quote):a.verdict==='supported'?/(correct|support|confirm|true|match|accurate|正确|支持|证实|一致|属实)/i.test(quote):/(insufficient|uncertain|cannot|can.t|not prove|unproven|not enough|unknown|不足|不确定|不能|无法|未知|未证)/i.test(quote);
  if(!evidence||!judgment)return 'Reading a record is not a judgment. Include the relevant fact and your conclusion; questions alone do not finish the audit.';
 }
 return null;
}
