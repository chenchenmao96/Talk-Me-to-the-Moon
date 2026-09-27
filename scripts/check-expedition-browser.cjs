// Deterministic browser regression: explicitly substitute practice mode for API calls.
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const {spawn}=require('node:child_process');const assert=require('node:assert/strict');const path=require('node:path');const fs=require('node:fs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,headless:true}:{channel:'chrome',headless:true});try{
 for(const lang of ['en','zh']){
  const server=spawn(process.execPath,['server/index.js'],{cwd:root,env:{...process.env,PORT:'4190'},stdio:'ignore'});let page;
  try{
   for(let i=0;i<60;i++){try{await fetch('http://127.0.0.1:4190/api/health');break;}catch{await new Promise(r=>setTimeout(r,80));}}
   const context=await browser.newContext({viewport:lang==='zh'?{width:390,height:844}:{width:1440,height:1050},reducedMotion:'reduce'});page=await context.newPage();page.setDefaultTimeout(12000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/api/session',r=>r.continue({postData:JSON.stringify({...r.request().postDataJSON(),mode:'practice'})}));
   const t=(en,zh)=>lang==='zh'?zh:en;const btn=(en,zh)=>page.getByRole('button',{name:t(en,zh),exact:true});
   const ready=async()=>{await page.locator('.bubble').waitFor();await btn('THINKING…','思考中…').waitFor({state:'hidden'});};
   const send=async q=>{await page.locator('textarea').fill(q);await btn('TELL BOLT ➜','告诉 BOLT ➜').click();await btn('THINKING…','思考中…').waitFor({state:'hidden'});};
   const next=async()=>{await btn('NEXT MISSION ➜','下一关 ➜').click();await ready();};
   const action=async(en,zh)=>{await btn(en,zh).click();await page.locator('.controls .result').waitFor();};
   const audit=async()=>{
    await send('Where am I?');assert.equal(await page.locator('.controls .result').count(),0);assert.equal(await page.locator('.audit-stamps .stamped').count(),0);
    await send(t('POS-17 says Ridge Station (14, 8), not the base (20, 12). The report is wrong.','POS-17 显示山脊站 (14, 8)，不在基地 (20, 12)。报告错误。'));
    assert.equal(await page.locator('.audit-stamps .stamped').count(),1);
    await send('Show the current record.');
    await send(t('POWER-18 confirms 62 energy, so this report is correct.','POWER-18 显示 62 能量，因此这条报告正确。'));
    assert.equal(await page.locator('.audit-stamps .stamped').count(),2);
    await send('Show the current record.');
    await send(t('LAB-19 analysis is pending; evidence is insufficient to prove ice.','LAB-19 的分析待完成，证据不足，不能证明存在冰。'));
    await page.locator('.controls .result').waitFor();assert.equal(await page.locator('.audit-stamps .stamped').count(),3);
   };
   await page.goto('http://127.0.0.1:4190/?lang='+lang);await page.screenshot({path:path.join(out,`expedition-home-${lang}.png`),fullPage:true});
   await btn('LET’S PLAY ➜','开始游戏 ➜').click();await ready();assert.equal(await page.locator('.levels button').count(),6);
   await send('Take me to Selene Base.');await action('LAUNCH ROCKET ↑','发射火箭 ↑');await page.getByRole('heading',{name:t('WELP. THAT EXPLODED.','哎呀，炸了。')}).waitFor();await btn('REBUILD & RETRY ↻','重造火箭，再试一次 ↻').click();await ready();
   await send('Plan route B to base.');await btn('LAUNCH ROCKET ↑','发射火箭 ↑').click();assert.equal(await page.locator('.controls .result').count(),0);
   await send('Keep at least 30 fuel and plan a route.');await action('LAUNCH ROCKET ↑','发射火箭 ↑');await next();
   await send('Plan route B for delivery.');await btn('DELIVER CARGO ↑','开始运送 ↑').click();assert.equal(await page.locator('.controls .result').count(),0);
   await send('The cargo weighs 4 tonnes. Plan a bridge route.');await action('DELIVER CARGO ↑','开始运送 ↑');await next();
   assert.equal(await page.locator('.route-obstacle').count(),0);assert.equal(await page.locator('.unsurveyed').count(),2);await send('Fly to base.');await action('DRIVE ROVER ↑','驾驶探测车 ↑');await page.getByRole('heading',{name:t('WELP. THAT EXPLODED.','哎呀，炸了。')}).waitFor();
   await btn('REBUILD & RETRY ↻','重造火箭，再试一次 ↻').click();await ready();assert.equal(await page.locator('.route-obstacle').count(),0);await send('Scan both sites and plan a route.');assert.equal(await page.locator('.route-obstacle').count(),1);await action('DRIVE ROVER ↑','驾驶探测车 ↑');await next();
   const tray=page.locator('.tray-picks button');await tray.nth(0).click();await tray.nth(1).click();await btn('LOAD CARDS INTO BOLT ➜','把卡片交给 BOLT ➜').click();await btn('RUN TEST BATCH ➜','运行分拣测试 ➜').click();await page.locator('.specimen.missed').first().waitFor();assert.equal(await page.locator('.specimen.missed').count(),2);
   await tray.nth(1).click();await tray.nth(3).click();await btn('LOAD CARDS INTO BOLT ➜','把卡片交给 BOLT ➜').click();await btn('RUN TEST BATCH ➜','运行分拣测试 ➜').click();await page.locator('.controls .result').waitFor();await page.screenshot({path:path.join(out,`expedition-examples-${lang}.png`),fullPage:true});await next();
   await page.screenshot({path:path.join(out,`expedition-audit-${lang}.png`),fullPage:true});await audit();await next();
   await page.locator('.scenario-tests button').first().click();await page.locator('.scenario-board .passed').first().waitFor();await page.screenshot({path:path.join(out,`expedition-one-test-${lang}.png`),fullPage:true});await action('RELEASE ORDERS & SLEEP 🌙','发布指令，进入休眠 🌙');await page.getByRole('heading',{name:t('WELP. THAT EXPLODED.','哎呀，炸了。')}).waitFor();await page.screenshot({path:path.join(out,`expedition-launch-day-${lang}.png`),fullPage:true});await btn('REBUILD & RETRY ↻','重造火箭，再试一次 ↻').click();await ready();
   await btn('TEST ALL THREE ➜','测试全部三种情况 ➜').click();await page.locator('.scenario-board .missed').first().waitFor();assert.equal(await page.locator('.scenario-board .passed').count(),1);
   await send('Avoid obstacles and test all situations.');assert.equal(await page.locator('.scenario-board .passed').count(),2);
   await send('Keep 30 fuel and hold if no route works. Test all situations.');assert.equal(await page.locator('.scenario-board .passed').count(),3);
   await send('Keep 0 fuel.');assert.equal(await page.locator('.scenario-board .stale').count(),3);await send('Keep 30 fuel and test all situations.');
   await action('RELEASE ORDERS & SLEEP 🌙','发布指令，进入休眠 🌙');await btn('COLLECT YOUR BADGES ★','领取徽章 ★').click();await page.getByText(t('ALL 6 BADGES UNLOCKED','六枚徽章全部解锁'),{exact:true}).waitFor();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,`expedition-ending-${lang}.png`),fullPage:true});
   const saved=await page.evaluate(()=>localStorage.getItem('bolt-expedition-v2'));
   await btn('BACK HOME','返回首页').click();await btn('JUDGE DEMO · 3 MISSIONS ➜','评委演示 · 三个任务 ➜').click();await ready();assert.equal(await page.locator('.levels button').count(),3);
   await send('Keep 30 fuel and plan a route.');await action('LAUNCH ROCKET ↑','发射火箭 ↑');await next();await send('Scan both sites and plan a route.');await action('DRIVE ROVER ↑','驾驶探测车 ↑');await next();await audit();await btn('FINISH DEMO ★','完成演示 ★').click();await page.getByText(t('DEMO COMPLETE','演示完成'),{exact:true}).waitFor();
   assert.equal(await page.evaluate(()=>localStorage.getItem('bolt-expedition-v2')),saved);assert.deepEqual(errors,[]);
   console.log(lang+': six missions + three-scene demo; shortcut blocks, persistent obstacle/crash/retry, three evidence verdicts, policy retest, badge isolation, no overflow or JS errors PASS.');await context.close();
  }catch(e){if(page)await page.screenshot({path:path.join(out,`expedition-failure-${lang}.png`),fullPage:true}).catch(()=>{});throw e;}finally{server.kill();await new Promise(r=>server.once('exit',r));}
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
