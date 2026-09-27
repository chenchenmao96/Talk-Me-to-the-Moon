// Debriefs explain the game's observable outcome, not a measured learning gain.
const lessons={
 reserve:{
  en:{title:'Tell AI what success requires',idea:'A goal says what you want. A constraint says what must stay true.',why:'Reaching the base was only half the job: the shield also needed 30 fuel left. Your approved route met both requirements.',example:"Plan a 30-minute study session. Include at least 10 minutes of reading and a 5-minute break. Show the duration of each activity; the total must not exceed 30 minutes.",check:"Add the durations yourself: at most 30 minutes total, at least 10 for reading, and 5 for the break.",takeaway:'Give the goal + the limits. Check that the plan meets both.'},
  zh:{title:'告诉 AI：怎样才算完成',idea:'目标是“要做什么”，限制是“必须满足什么”。两者都要说清楚。',why:'到达基地还不够，护盾还需要至少 30 燃料。你批准的路线同时满足了这两个要求。',example:"安排一次 30 分钟的学习：至少阅读 10 分钟，休息 5 分钟。列出每项活动的时长，总时长不能超过 30 分钟。",check:"自己加一下时间：总计不超过 30 分钟，阅读至少 10 分钟，休息 5 分钟。",takeaway:'说清目标和限制，再核对方案是否都满足。'}
 },
 context:{
  en:{title:'Share the facts AI is missing',idea:'AI cannot use a detail it has not been given. Share the facts that change the answer, and ask for facts you need.',why:'The crate weighed 4 tonnes. Matching that fact with the bridge capacity made delivery safe.',example:"Explain what one-half means to an eight-year-old who can count but has not learned fractions. Use an example of sharing one pizza equally between two people.",check:"Does it explain two equal parts in familiar words, rather than assume the child already understands fractions?",takeaway:'Ask: what do I know that AI needs to know?'},
  zh:{title:'补上 AI 不知道的背景',idea:'AI 没看到的信息，不能指望它自动知道。告诉它会影响答案的事实，也向它询问你缺少的信息。',why:'货箱重 4 吨。把货箱重量和桥的承重放在一起判断，才能安全送达。',example:"给一个八岁的孩子解释“二分之一”。他会数数，但没学过分数。用两个人平分一个披萨的例子说明。",check:"有没有用“两份一样大”来解释，而不是假设孩子已经懂分数？",takeaway:'先问自己：我知道什么，是 AI 还不知道的？'}
 },
 checkpoint:{
  en:{title:'Inspect first. Approve second.',idea:'Ask AI to gather the missing facts and show a plan before it acts.',why:'The survey revealed rocks on route A. You reviewed a checked route before sending the rover.',example:"My draft says: “We recieved your order. It ships tomorow.” Return only a list of misspelled words and their proposed corrections. Do not include a rewritten message; wait for my approval before rewriting it.",check:"Check for “recieved → received” and “tomorow → tomorrow”. If AI rewrites the message before approval, ask it to return to the correction list.",takeaway:'Check the evidence → review the plan → approve the action.'},
  zh:{title:'先查清楚，再批准行动',idea:'让 AI 先收集缺少的信息、展示方案，再开始执行。',why:'检查发现 A 路线有障碍。你先核对了路线，再批准探测车出发。',example:"我的草稿是：“我们己收到订单，明天会发贷。”只列出错别字和建议改成的字，不要附上重写后的消息。等我确认后再重写。",check:"核对“己→已、贷→货”。如果 AI 没等批准就重写，请它先退回修改清单。",takeaway:'查事实 → 看方案 → 批准执行。'}
 },
 examples:{
  en:{title:'Make your standard clear',idea:'Examples can show AI what you mean. Choose examples that distinguish the important feature, then test new cases.',why:'The sorter kept round containers and rejected spiky ones across both colors. The four-container test checked the rule beyond a single example.',example:"Examples: “Please send the invoice” → ACTION; “The invoice arrived” → UPDATE. Using this pattern, label two new messages: “Please send the meeting notes” and “The meeting notes arrived”.",check:"The new messages should be ACTION, then UPDATE. Check the pattern on the new topic, not just the examples.",takeaway:'Show a useful contrast—or state a clear rule—then test it.'},
  zh:{title:'用例子讲清楚你的标准',idea:'例子能让 AI 明白你想要什么。要选能区分关键特征的例子，再用新情况测试。',why:'分拣器在两种颜色下都能保留圆形、剔除尖形。四个样本的测试检查了规则，而不只是一个例子。',example:"示例：“请把发票发给我”→待办；“发票已收到”→通知。请按同样标准分类两条新消息：“请把会议纪要发给我”“会议纪要已收到”。",check:"两条新消息应分别是“待办”和“通知”。看它换个内容后能否仍用对标准。",takeaway:'给有用的对比例子，或直接说规则，然后测试。'}
 },
 verify:{
  en:{title:'Check evidence, not confidence',idea:'A confident AI answer still needs evidence. Decide whether the facts support it, contradict it, or leave it unknown.',why:'R1: the location contradicted the claim. R2: the 62-unit reading supported it. R3: pending analysis could not establish whether there was ice.',example:"Practice record: the meeting is Tuesday at 2 p.m.; the room is not assigned. Check these claims: (1) Wednesday at 2 p.m.; (2) Tuesday at 2 p.m.; (3) room 204. Mark each supported, contradicted, or unknown, and explain using only the record.",check:"Compare with the record yourself: (1) contradicted; (2) supported; (3) unknown. An unassigned room does not prove that room 204 is wrong.",takeaway:'Ask for the source. Compare the facts. Explain your judgment.'},
  zh:{title:'看证据，不看 AI 的语气',idea:'AI 说得肯定，不等于答案可靠。证据可能支持它、反驳它，也可能还不足以判断。',why:'R1：位置记录反驳了报告。R2：62 单位的读数支持报告。R3：分析还没完成，不能判断有没有冰。',example:"练习记录：会议在周二下午两点，房间尚未分配。核查三条说法：①周三下午两点；②周二下午两点；③在 204 室。分别标为“有依据”“与记录矛盾”或“无法确定”，只用记录说明理由。",check:"自己对照记录：①矛盾；②有依据；③无法确定。没分配房间，不等于已经证明“204 室”是错的。",takeaway:'要来源、对事实，再说判断和理由。'}
 },
 iterate:{
  en:{title:'Test more than the easy case',idea:'A prompt that works once may fail in another situation. Keep the working requirements, fix problems, and retest.',why:'The final orders passed clear skies, blocked routes, and low fuel before release. They covered when to fly and when to wait.',example:"Test this rule: “Pick A’s earliest 30-minute slot.” The meeting must fit BOTH people. Same-day availability:\n1. A 9–10; B 9–10.\n2. A 9–10; B 9:30–10:30.\n3. A 9–9:30; B 10–10:30.\nRevise the rule to choose the earliest shared slot, or report no shared slot. Rerun all three cases. Do not book anything.",check:"Check the revised results: 1 → 9–9:30; 2 → 9:30–10; 3 → no shared slot. Every meeting must fit both people’s availability.",takeaway:'Write → test different cases → revise if needed → retest → approve.'},
  zh:{title:'别只测试最容易的情况',idea:'一条提示词成功一次，不代表换个情况也行。保留有效要求，修正问题后再测试。',why:'最终指令在晴天、障碍、低燃料三种情况下都通过测试后才发布。它既说明何时出发，也说明何时等待。',example:"测试这条规则：“选 A 最早的半小时空档。”会议必须同时符合两个人的空闲时间。同一天的空档：\n① A 9–10 点；B 9–10 点。\n② A 9–10 点；B 9:30–10:30。\n③ A 9–9:30；B 10–10:30。\n修改规则，选双方最早的半小时共同空档，没有就说明没有。重测全部三种情况，先不要预约。",check:"核对修改后的结果：① 9–9:30；② 9:30–10；③ 没有共同空档。每次都必须满足双方的时间。",takeaway:'写指令 → 测不同情况 → 按需修改 → 重测 → 批准。'}
 }
};
export function lessonContent(id,lang,state){
 const lesson={...lessons[id][lang==='zh'?'zh':'en']};
 if(id==='examples'&&state?.ruleSource==='rule')lesson.why=lang==='zh'
  ?'你直接说明了“按形状分拣”的规则，并用四个样本验证。这也是有效的方法：标准能直接说清楚时，不必硬凑示例。'
  :'You stated the shape rule directly and checked it on all four containers. That works too: when you can explain a standard clearly, examples are optional.';
 return lesson;
}
