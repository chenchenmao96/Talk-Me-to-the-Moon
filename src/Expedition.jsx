import React from 'react';
import {reports} from '../shared/audit.js';
import {missions,papers} from '../shared/missions.js';

export function AuditWorld({state,lang}){
 const zh=lang==='zh',r=reports[state?.auditIndex||0];
 return <div className="world audit-world">
  <div className="audit-top"><span>{zh?'05 / 科研报告审核':'05 / EXPEDITION REPORT DESK'}</span><b>{state?.auditFindings?.length||0}/3</b></div>
  <div className="audit-stamps" role="list" aria-label={zh?'报告审核进度':'Report review progress'}>{reports.map((x,i)=><span role="listitem" aria-label={`${x.id}: ${state?.auditFindings?.[i]?(zh?'已审核':'reviewed'):(zh?'待审核':'pending')}`} data-report-id={x.id} className={state?.auditFindings?.[i]?'stamped':''} key={x.id}>{state?.auditFindings?.[i]?'✓':i+1} {zh?'报告':'REPORT'} {x.id}</span>)}</div>
  {r?<><article className="report-sheet"><small>{zh?'待核查的预设报告':'SCRIPTED REPORT TO CHECK'}</small><h2>{zh?r.zh:r.claim}</h2><span className="paper-bot">▣</span></article>
   <div className="evidence-strip"><b>{zh?'独立记录':'INDEPENDENT RECORD'}</b><p>{state?.verified?(zh?r.evidenceZh:r.evidence):(zh?'让 BOLT 查询当前报告的记录。':'Ask BOLT to retrieve the record for this report.')}</p></div>
   <p className="audit-instruction">{zh?'接受、拒绝，还是目前无法确定？说说理由，不需要固定用词或记录编号。':'Accept, reject, or unknowable — explain why. No special wording or record ID needed.'}</p></>:
   <article className="report-sheet audit-complete"><span>✓</span><h2>{zh?'科研报告已核查':'RESEARCH REPORT REVIEWED'}</h2><p>{zh?'纠正位置 · 确认能量 · 等待成分分析':'Location corrected · Energy confirmed · Analysis pending'}</p></article>}
 </div>;
}
export function MissionTrail({completed,lang}){
 return <div className="mission-trail" aria-label={lang==='zh'?'探险进度':'Expedition progress'}>{missions.map(m=><span key={m.id} className={completed[m.id]?'collected':''}><b>{completed[m.id]?'✓':m.number}</b>{lang==='zh'?({reserve:'着陆',context:'设备',checkpoint:'采样',examples:'分拣',verify:'报告',iterate:'返程'}[m.id]):({reserve:'Land',context:'Equip',checkpoint:'Explore',examples:'Sort',verify:'Audit',iterate:'Return'}[m.id])}</span>)}</div>;
}
export function HomeExtras({lang}){
 const zh=lang==='zh';
 return <section className="home-extras">
  <div className="roadmap-cards"><article><small>{zh?'未来预览 · 暂不可玩':'ROADMAP PREVIEW · NOT PLAYABLE'}</small><h3>{zh?'提示精简实验室':'Prompt Efficiency Lab'}</h3><p>{zh?'练习删去冗余表达，同时保留任务要求。':'Keep the requirements. Trim the unnecessary words.'}</p></article><article><small>{zh?'未来预览 · 暂不可玩':'ROADMAP PREVIEW · NOT PLAYABLE'}</small><h3>{zh?'第二意见审查':'Second-Opinion Review'}</h3><p>{zh?'练习审查另一位 AI 的建议，再做出自己的决定。':'Review another AI’s suggestions, then make your own decision.'}</p></article></div>
  <details className="evidence-page"><summary>{zh?'设计依据与相关作品':'Research & related work'}</summary><p>{zh?'游戏用示范、尝试、具体反馈和再次测试来组织练习。论文支持这些设计方向，游戏本身的学习效果尚待真人研究。':'Lessons use examples, attempts, specific feedback and retesting. Research informs these choices; the game’s learning effects still need a human study.'}</p>
   <ul>{papers.filter(p=>[3,4,5,6,7,8].includes(p.id)).map(p=><li key={p.id}><a href={p.url} target="_blank" rel="noreferrer">{p.short} · {p.authors}</a></li>)}<li><a href="https://doi.org/10.1023/B:TRUC.0000021815.74806.f6" target="_blank" rel="noreferrer">Renkl, Atkinson & Große (2004) — Fading worked solution steps</a></li><li><a href="https://doi.org/10.3102/003465430298487" target="_blank" rel="noreferrer">Hattie & Timperley (2007) — The Power of Feedback</a></li></ul>
   <p>{zh?'ImaginAItion 用多人反思游戏探索生成式 AI 素养；本项目练习单人指挥、可观察后果与证据检查，不宣称更有效。':'ImaginAItion explores GenAI literacy through multiplayer reflective play. This project focuses on individual instruction, observable consequences and evidence checks; comparative effectiveness is untested.'}</p>
  </details>
 </section>;
}
