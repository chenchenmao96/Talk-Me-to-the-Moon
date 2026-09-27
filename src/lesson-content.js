// Debriefs explain the game's observable outcome, not a measured learning gain.
const lessons={
 reserve:{
  en:{title:'Tell AI what success requires',idea:'A goal says what you want. A constraint says what must stay true.',why:'Reaching the base was only half the job: the shield also needed 30 fuel left. Your approved route met both requirements.',example:'Plan dinner for four people, under $40 total, with no peanuts.',takeaway:'Give the goal + the limits. Check that the plan meets both.'},
  zh:{title:'告诉 AI：怎样才算完成',idea:'目标是“要做什么”，限制是“必须满足什么”。两者都要说清楚。',why:'到达基地还不够，护盾还需要至少 30 燃料。你批准的路线同时满足了这两个要求。',example:'帮我安排四人晚餐，总价不超过 300 元，不能含花生。',takeaway:'说清目标和限制，再核对方案是否都满足。'}
 },
 context:{
  en:{title:'Share the facts AI is missing',idea:'AI cannot use a detail it has not been given. Share the facts that change the answer, and ask for facts you need.',why:'The crate weighed 4 tonnes. Matching that fact with the bridge capacity made delivery safe.',example:'Explain this topic to a ten-year-old who knows fractions but has not learned algebra.',takeaway:'Ask: what do I know that AI needs to know?'},
  zh:{title:'补上 AI 不知道的背景',idea:'AI 没看到的信息，不能指望它自动知道。告诉它会影响答案的事实，也向它询问你缺少的信息。',why:'货箱重 4 吨。把货箱重量和桥的承重放在一起判断，才能安全送达。',example:'给一个十岁的孩子解释这个知识点。他学过分数，但还没学过代数。',takeaway:'先问自己：我知道什么，是 AI 还不知道的？'}
 },
 checkpoint:{
  en:{title:'Inspect first. Approve second.',idea:'Ask AI to gather the missing facts and show a plan before it acts.',why:'The survey revealed rocks on route A. You reviewed a checked route before sending the rover.',example:'Before editing these files, inspect them and show your proposed changes. Wait for my approval.',takeaway:'Check the evidence → review the plan → approve the action.'},
  zh:{title:'先查清楚，再批准行动',idea:'让 AI 先收集缺少的信息、展示方案，再开始执行。',why:'检查发现 A 路线有障碍。你先核对了路线，再批准探测车出发。',example:'修改这些文件前，先检查内容并列出你准备改什么，等我确认后再修改。',takeaway:'查事实 → 看方案 → 批准执行。'}
 },
 examples:{
  en:{title:'Make your standard clear',idea:'Examples can show AI what you mean. Choose examples that distinguish the important feature, then test new cases.',why:'The sorter kept round containers and rejected spiky ones across both colors. The four-container test checked the rule beyond a single example.',example:'Label “Please send the invoice” as ACTION and “The invoice arrived” as UPDATE. Now label these new messages.',takeaway:'Show a useful contrast—or state a clear rule—then test it.'},
  zh:{title:'用例子讲清楚你的标准',idea:'例子能让 AI 明白你想要什么。要选能区分关键特征的例子，再用新情况测试。',why:'分拣器在两种颜色下都能保留圆形、剔除尖形。四个样本的测试检查了规则，而不只是一个例子。',example:'“请把发票发给我”标为“待办”；“发票已收到”标为“通知”。请按这个标准分类下面的新消息。',takeaway:'给有用的对比例子，或直接说规则，然后测试。'}
 },
 verify:{
  en:{title:'Check evidence, not confidence',idea:'A confident AI answer still needs evidence. Decide whether the facts support it, contradict it, or leave it unknown.',why:'R1: the location contradicted the claim. R2: the 62-unit reading supported it. R3: pending analysis could not establish whether there was ice.',example:'Check each claim against the attached receipts. Mark it supported, contradicted, or unknown, and cite the relevant receipt or missing evidence.',takeaway:'Ask for the source. Compare the facts. Explain your judgment.'},
  zh:{title:'看证据，不看 AI 的语气',idea:'AI 说得肯定，不等于答案可靠。证据可能支持它、反驳它，也可能还不足以判断。',why:'R1：位置记录反驳了报告。R2：62 单位的读数支持报告。R3：分析还没完成，不能判断有没有冰。',example:'根据附件中的收据核查每条报销说明，标出“有依据”“与证据矛盾”或“无法确定”，并说明对应收据或缺少的证据。',takeaway:'要来源、对事实，再说判断和理由。'}
 },
 iterate:{
  en:{title:'Test more than the easy case',idea:'A prompt that works once may fail in another situation. Keep the working requirements, fix problems, and retest.',why:'The final orders passed clear skies, blocked routes, and low fuel before release. They covered when to fly and when to wait.',example:'Test this scheduling prompt with a normal day, a double booking, and no free slots. Fix failures without losing the original limits, then rerun all three.',takeaway:'Write → test different cases → revise if needed → retest → approve.'},
  zh:{title:'别只测试最容易的情况',idea:'一条提示词成功一次，不代表换个情况也行。保留有效要求，修正问题后再测试。',why:'最终指令在晴天、障碍、低燃料三种情况下都通过测试后才发布。它既说明何时出发，也说明何时等待。',example:'用正常日程、时间冲突、没有空档三种情况测试这条排期提示词。保留原有要求，修正失败，再把三种情况全部重测。',takeaway:'写指令 → 测不同情况 → 按需修改 → 重测 → 批准。'}
 }
};
export function lessonContent(id,lang,state){
 const lesson={...lessons[id][lang==='zh'?'zh':'en']};
 if(id==='examples'&&state?.ruleSource==='rule')lesson.why=lang==='zh'
  ?'你直接说明了“按形状分拣”的规则，并用四个样本验证。这也是有效的方法：标准能直接说清楚时，不必硬凑示例。'
  :'You stated the shape rule directly and checked it on all four containers. That works too: when you can explain a standard clearly, examples are optional.';
 return lesson;
}
