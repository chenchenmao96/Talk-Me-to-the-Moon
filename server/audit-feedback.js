import {reports,auditCommand} from '../shared/audit.js';

export function auditFeedback(state,oldIndex,assessment,language){
 const zh=language==='zh',r=reports[state.auditIndex||0];
 if(state.status==='complete'&&state.auditIndex===oldIndex)return zh?'三份报告均已保存，可以进入第六关。':'All three reviews are saved. You can continue to mission 6.';
 if(state.auditIndex>oldIndex){
  const saved=reports[oldIndex].id;
  return state.status==='complete'
   ?(zh?'R3 审核已保存。三份报告均已标绿，可以点击“下一关”进入第六关。':'R3 review saved. All three reports are green. Select NEXT MISSION to continue to mission 6.')
   :(zh?`${saved} 审核已保存并标绿。接下来是 ${r.id}：先查询它的记录，再告诉我判断和理由。`:`${saved} review saved and marked green. Next is ${r.id}: ask for its record, then give your judgment and reason.`);
 }
 if(!state.verified)return zh?'先查询当前报告的记录，再给出判断和理由。':'Ask for the current report’s record, then give your judgment and reason.';
 if(!assessment.verdict)return zh?'记录已显示。请说明接受、拒绝，或目前无法确定，并给出依据。':'The record is displayed. Accept, reject, or mark the claim unknowable, and explain why.';
 if(assessment.evidence!==true)return assessment.evidence===false
  ?(zh?'你的理由与当前记录不一致。请核对记录中的事实，再提交判断。':'Your reason conflicts with the current record. Check its facts and submit your judgment again.')
  :(zh?'已收到你的判断。还需要理由：指出记录中的事实如何支持、反驳这句话，或为什么仍无法确定。':'I have your judgment. Add why: which fact supports or contradicts the claim, or leaves it unknowable?');
 return zh?'这个判断与记录不一致：事实相反应当拒绝；尚未完成检验表示目前无法确定。请调整判断。':'That judgment does not match the record. Conflicting facts call for rejection; a pending analysis leaves the claim unknowable. Revise your judgment.';
}
export function applyAuditJudgment(state,assessment){
 const r=reports[state.auditIndex||0];
 if(!r||!state.verified||!assessment.verdict||assessment.evidence!==true)return state;
 return auditCommand(state,{type:'submit_audit',reportId:r.id,recordId:r.record,verdict:assessment.verdict}).state;
}
