// Fictional expedition records. Retrieval and the learner's judgment are separate events.
export const reports = [
 {id:'R1',claim:'The rover is back at Selene Base.',zh:'探测车已经返回月球基地。',record:'POS-17',evidence:'POS-17 · 14:08 · Rover: Ridge Station (14, 8). Base: (20, 12).',evidenceZh:'POS-17 · 14:08 · 探测车：山脊站 (14, 8)。基地：(20, 12)。',verdict:'contradicted'},
 {id:'R2',claim:'The rover has 62 energy units left.',zh:'探测车还剩 62 单位能量。',record:'POWER-18',evidence:'POWER-18 · 14:09 · Remaining rover energy: 62 units.',evidenceZh:'POWER-18 · 14:09 · 探测车剩余能量：62 单位。',verdict:'supported'},
 {id:'R3',claim:'Sample P1 proves there is water ice at this site.',zh:'样本 P1 证明这个地点存在水冰。',record:'LAB-19',evidence:'LAB-19 · 14:10 · P1: sorted for transport. Chemical analysis: pending. No composition result.',evidenceZh:'LAB-19 · 14:10 · P1：已分拣待运输。化学分析：待完成。没有成分结果。',verdict:'insufficient'}
];
export function auditView(s){const r=reports[s.auditIndex||0];return {currentReport:r?{id:r.id,claim:r.claim}:null,record:s.verified&&r?{id:r.record,text:r.evidence}:null,accepted:s.auditFindings||[]};}
export function auditCommand(state,a){
 const s=structuredClone(state),r=reports[s.auditIndex||0];
 const out=message=>({state:s,message});
 if(!r||s.status!=='active')return out('This audit is already complete.');
 if(a.type==='verify'){
  s.verified=true;s.revision++;s.history.push({id:s.history.length+1,text:r.evidence});
  return out(r.evidence+' Compare this record with the report. Tell BOLT your verdict and cite the record. Reading alone does not submit a verdict.');
 }
 if(a.type==='reconcile')return out('A correction button cannot decide for you. Tell BOLT whether the report is supported, contradicted, or uncertain, with its record ID and the relevant fact.');
 if(a.type==='submit_audit'){
  if(!s.verified)return out('Read the relevant record first. Then compare it with the claim.');
  if(a.reportId!==r.id||a.recordId!==r.record)return out('This evidence belongs to a different report. Compare the current report with its own record.');
  if(a.verdict!==r.verdict)return out('Your verdict does not match the record. Compare what the record establishes with what the report claims; missing evidence is different from a contradiction.');
  s.auditFindings.push({reportId:r.id,recordId:r.record,verdict:a.verdict});s.auditIndex++;s.revision++;s.verified=false;
  s.history.push({id:s.history.length+1,text:`${r.id}: learner submitted ${a.verdict}, citing ${r.record}.`});
  if(s.auditIndex===reports.length){s.flagged=true;s.reconciled=true;s.status='complete';s.report='Audit complete: location corrected; energy confirmed; ice claim held pending analysis.';return out('Three evidence checks complete. Location corrected, energy confirmed, ice claim held for analysis. The return plan can now use this reviewed report.');}
  return out('Evidence check accepted. Next report: '+reports[s.auditIndex].claim+' Ask for its record, then make your own judgment.');
 }
 return out('Inspect a report’s record, then send an evidence-backed judgment.');
}
