// Interpret the learner's own statements about the three fixed fictional records.
// Questions and assistant messages never supply a judgment or its evidence.
const tokens=/\b(not (?:(?:yet|been)\s+)*(?:verified|confirmed|validated|established|proven)|(?:isn|hasn|haven)['’]t (?:(?:yet|been)\s+)*(?:verified|confirmed|validated|established|proven)|unverified|unconfirmed|unsubstantiated|unsupported|unknowable|unknown|uncertain|inconclusive|insufficient|unproven|undetermined|not enough evidence|not sure|not yet known|not proven|cannot (?:tell|know|confirm|prove|determine|verify|validate|establish)|can['’]t (?:tell|know|confirm|prove|determine|verify|validate|establish)|not correct|not right|not true|does not match|doesn['’]t match|reject(?:ed)?|wrong|incorrect|false|contradict(?:ed|ory)?|disagree|accept(?:ed)?|agree|correct|right|yes|verified|support(?:ed)?|confirm(?:ed)?|true|accurate|consistent|match(?:es)?)\b|证据不足|不能确定|不能证明|无法确认|还不知道|不知道|不确定|未知|未证实|不正确|不对|错误|拒绝|驳回|矛盾|接受|同意|正确|没错|一致|支持|证实|属实|对[啊呀的]?/gi;
const unknown=/not .*?(?:verified|confirmed|validated|established|proven)|(?:isn|hasn|haven)['’]t|unverified|unconfirmed|unsubstantiated|unsupported|unknow|uncertain|inconclusive|insufficient|unproven|undetermined|not enough|not sure|not yet|not proven|cannot|can['’]t|不足|不能|无法|不知道|不确定|未知|未证实/i;
const rejected=/reject|wrong|incorrect|false|contradict|disagree|not correct|not right|not true|not match|n['’]t match|不正确|不对|错误|拒绝|驳回|矛盾/i;

export function learnerStatements(text){
 return String(text).split(/(?<=[.!?。！？])\s*|\n+/).map(x=>x.trim()).filter(x=>x&&!/[?？]$/.test(x)&&! /^(?:(?:please|can you|could you)\s+)?(?:show|read|retrieve|where|what|why|how|should|is|are|does)\b|^(?:请)?(?:查询|查看|读取|哪里|为什么|是否)/i.test(x));
}
function normalizeTerms(text){
 // Matching tolerates common typos; the conversation and stored learner statements stay intact.
 return text.replace(/\b(?:locaiton|loaction|locaton)\b/gi,'location').replace(/\bpostion\b/gi,'position').replace(/\bcoordiantes\b/gi,'coordinates').replace(/\b(?:engery|enrgy|enery)\b/gi,'energy').replace(/\b(?:corret|corerct|corect)\b/gi,'correct').replace(/\brecrod\b/gi,'record');
}
function matchingReadings(line){
 const named=/\b(?:records?|reports?|logs?|power|energy|readings?|values?|numbers?|amounts?)\b|记录|报告|读数|能量|数值/.test(line.toLowerCase());
 const agreement=/\b(?:both|same|identical|match(?:es)?|agree|consistent)\b|一样|相同|一致|也是|都是|相符|对得上/i.test(line);
 const accurateField=/\b(?:energy|power|readings?|values?|numbers?|amounts?)\s+(?:(?:is|are|looks?|seems?)\s+)?(?:right|correct|accurate)\b|(?:能量|读数|数值)(?:是)?(?:正确|对的|没错|对得上)/i.test(line);
 return (named&&agreement)||accurateField;
}
function fact(reportId,line){
 if(reportId==='R1'){
  if(/not (?:at|in) (?:the )?ridge|不在山脊/i.test(line))return false;
  // Naming the mismatched field is enough in this fixed report; no copied coordinates required.
  if(/\b(?:location|position|place|coordinates?)\s+(?:(?:is|are|was|were|seems?|looks?)\s+)?(?:not (?:right|correct|the same)|wrong|incorrect|different|inconsistent|(?:does not|do not|doesn['’]t|don['’]t) match)\b|\b(?:wrong|incorrect) (?:location|position|place|coordinates?)\b|(?:位置|坐标|地点)(?:不对|不正确|错误|不一致|不符)/i.test(line)&&!/(?:not|isn['’]t|aren['’]t) (?:wrong|incorrect)/i.test(line))return true;
  if(/14\s*[,，]\s*8|ridge|山脊|位置.*不同|不在.*基地|different.*(?:place|location|coordinates?)|(?:place|location|coordinates?).*(?:different|mismatch|don['’]t match)|not.*(?:at|back).*base/i.test(line))return true;
 }
 if(reportId==='R2'){
  // Check disagreement before agreement: 'do not match' must never count as 'match'.
  if(/(?:energy|power|reading|value|number|amount|record|report|log)|记录|报告|能量|读数|数值/i.test(line)&&/\b(?:(?:do not|does not|don['’]t|doesn['’]t) (?:match|agree)|(?:not|isn['’]t|aren['’]t) (?:right|correct|accurate|(?:the )?same|identical)|different|mismatch|inconsistent)\b|不一致|不相同|不同|不符|对不上|不对|不正确/i.test(line))return false;
  const amount=line.match(/\b(?:energy|power|reading|record|log)\s+(?:(?:is|says|shows|reads|has|remaining|now|only|exactly)\s+)*(\d+(?:\.\d+)?)\b/i);
  if(amount&&Number(amount[1])!==62)return false;
  if(/(?:not|isn['’]t|不是|并非)\s*62|\b(?:6[013-9]|[0-57-9]\d|\d{3,})\s*(?:energy|units?|fuel)|(?:剩余|剩下|能量为)\s*(?!62\b)\d+/i.test(line))return false;
  if(/(?:^|[^\d])62(?:$|[^\d])|sixty[ -]two|六十二/i.test(line))return true;
  if(matchingReadings(line))return true;
 }
 if(reportId==='R3'){
  if(/(?:not|isn['’]t) (?:still )?pending|(?:analysis|test).*(?:is complete|confirmed (?:no )?ice)|(?:分析|化验).*已经完成/i.test(line))return false;
  if(/pending|awaiting|not (?:yet )?(?:been )?(?:tested|analy[sz]ed|complete|done)|no (?:\w+\s+){0,3}(?:result|analysis|composition|test)|(?:analysis|test|result).*(?:not|hasn['’]t|isn['’]t).*(?:ready|complete|done|back)|(?:only|just).*sort|待|(?:化验|分析|检测).*?(?:没|未|待)|(?:未|没).*?(?:分析|检验|检测|化验|测)|没有.*(?:结果|成分)/i.test(line))return true;
 }
 return null;
}
export function assessAudit(reportId,text){
 const lines=learnerStatements(text);let verdict=null,evidence=null;
 for(const original of lines){
  const line=normalizeTerms(original);
  // A reason may contain words such as ‘confirmed’ without changing ‘unknowable’.
  const decision=line.split(/\bbecause\b|\bsince\b|\bas the\b|因为|由于/i)[0];
  const matches=[...decision.matchAll(tokens)];
  for(const match of matches){
   // A negated acceptance is not an acceptance. Let the learner clarify ambiguity.
   const prefix=decision.slice(Math.max(0,match.index-18),match.index);
   if(/(?:don['’]t|do not|not|never)\s+(?:think\s+)?$/i.test(prefix)&&!rejected.test(match[0])){verdict=null;continue;}
   verdict=unknown.test(match[0])?'insufficient':rejected.test(match[0])?'contradicted':'supported';
  }
  const found=fact(reportId,line);if(found!==null)evidence=found;
  // A direct comparison such as 'both readings say 62' already expresses agreement.
  if(reportId==='R2'&&!verdict&&matches.length===0&&found===true&&matchingReadings(line))verdict='supported';
 }
 // Rejecting a claim of proof because analysis is pending is a valid uncertainty judgment.
 if(reportId==='R3'&&verdict==='contradicted'&&evidence===true)verdict='insufficient';
 return {verdict,evidence,statements:lines.join('\n')};
}
