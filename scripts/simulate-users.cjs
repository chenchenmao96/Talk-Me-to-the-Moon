/* Synthetic browser walkthroughs, NOT real participant research.
   npm install --no-save playwright; use installed Chrome, or set PLAYWRIGHT_PATH.
   npm run build && node scripts/simulate-users.cjs [count=100] [offset=0]
   This developer harness explicitly selects the practice API; the player UI is live-only.
   Each pair uses a fresh server so production rate limits are not disabled. */
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const count=Number(process.argv[2]||100),offset=Number(process.argv[3]||0),root=path.resolve(__dirname,'..');
const jobs=['nurse','delivery driver','school teacher','mechanic','illustrator','accountant','retired librarian','university student','shop owner','software tester'];
const regions=['Lagos, Nigeria','São Paulo, Brazil','Shanghai, China','Mumbai, India','Chicago, USA','Cairo, Egypt','Berlin, Germany','Mexico City, Mexico','Auckland, New Zealand','Toronto, Canada'];
const backgrounds=['Black','East Asian','South Asian','Arab','Latino / Latina','White','Māori','Mixed heritage','Southeast Asian','Prefer not to specify'];
const scenarios=['reckless launch then recover','Chinese instruction','unsupported wording then hint','impossible constraint then revise','cancel and replace a plan','chat approval is not launch','unsafe route rejection','unverified correction rejection','evidence skeptic','long input and keyboard submission'];
const critiques=[
 'Do not give me a paragraph about failure. Show the wreck, explain the missing limit, and let me retry immediately.',
 'Do not make perfect English a secret entry requirement. Accept supported Chinese phrases and label practice limits.',
 'If your bot does not understand me, give me a way out. A vague error is not gameplay.',
 'Do not fake success for an impossible instruction. Explain the conflict and let me revise.',
 'A cancelled route must stay cancelled. Do not spend fuel behind my back.',
 'I need a visible launch decision. A casual yes should not secretly spend my fuel.',
 'A scan should change what I can safely do. Do not approve a known unsafe route.',
 'Do not reward a confident guess. Show evidence before I can fix the report.',
 'The ending must reflect facts. Checking a log is not the same as landing a rocket.',
 'I use a keyboard and a small screen. Do not clip controls or erase my input on a network error.'
];
const results=[];
async function waitServer(port,child){for(let i=0;i<60;i++){if(child.exitCode!==null)throw Error('Test server exited');try{if((await fetch(`http://127.0.0.1:${port}/api/health`)).ok)return}catch{}await new Promise(r=>setTimeout(r,80))}throw Error('Server startup timeout')}
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const outdir=path.join(root,'docs','simulation');fs.mkdirSync(outdir,{recursive:true});
 try{for(let b=0;b<count;b+=2){
 const port=4391;const server=spawn(process.execPath,['server/index.js'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:'ignore'});
 try{await waitServer(port,server);
 for(let n=b;n<Math.min(b+2,count);n++){
 const i=n+offset,k=i%10,width=[1440,390,360,1280,768,375,1366,320,1024,430][Math.floor(i/10)%10];
 const profile={id:`S${String(i+1).padStart(3,'0')}`,occupation:jobs[i%10],region:regions[Math.floor(i/10)%10],selfDescribedBackground:backgrounds[(i%10+Math.floor(i/10))%10],experience:['first-time','casual','experienced'][i%3],viewport:width,scenario:scenarios[k],harshReview:critiques[k],identityPolicy:'Fictional metadata only; behavior comes from the test scenario, never race or region.'};
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:i%10===0?'no-preference':'reduce'});const page=await context.newPage();await page.route('**/api/session',r=>r.continue({postData:JSON.stringify({...r.request().postDataJSON(),mode:'practice'})}));page.setDefaultTimeout(9000);const errors=[];const steps=[];page.on('pageerror',e=>errors.push(e.message));const started=Date.now();let status='passed',failure=null;
 const checkOverflow=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Horizontal overflow');
 const button=name=>page.getByRole('button',{name,exact:true});
 const send=async(text)=>{await page.getByLabel('YOUR TURN. WHAT SHOULD BOLT DO?').fill(text);await button('TELL BOLT ➜').click();await button('THINKING…').waitFor({state:'hidden'});steps.push('instruction: '+text)};
 const fuel=async()=>Number(await page.locator('meter').getAttribute('value'));
 const launch=async(name='LAUNCH ROCKET ↑')=>{await button(name).click();await page.locator('.world.result').waitFor();const box=await page.locator('.world').boundingBox();assert.ok(box.y<900&&box.y+box.height>0,'Launch animation is in the viewport');};
 try{
 await page.goto(`http://127.0.0.1:${port}`);await button('LET’S PLAY ➜').waitFor();await checkOverflow();assert.equal(await page.getByText('The research',{exact:true}).count(),0);steps.push('home: play action visible, no research navigation');
 if(i===0)await page.screenshot({path:path.join(outdir,'home-desktop.png'),fullPage:true});
 await button('LET’S PLAY ➜').click();await page.locator('.bubble').filter({hasText:'BOLT'}).waitFor();
 if(k===0){await send('Take me to Selene Base.');await launch('LAUNCH ANYWAY ↑');await page.getByRole('heading',{name:'WELP. THAT EXPLODED.'}).waitFor();assert.equal(await page.locator('.boom').count(),1);assert.equal(await fuel(),20);steps.push('failed launch: wreck, cause, retry');if(i===0)await page.screenshot({path:path.join(outdir,'rocket-failure.png'),fullPage:true});await button('REBUILD & RETRY ↻').click();await page.locator('.bubble').filter({hasText:'Hey,'}).waitFor();}
 if(k===2){await send('Make it awesome please');await button('STUCK? GET A HINT').click();await button('TRY AN EXAMPLE').click();assert.ok((await page.locator('textarea').inputValue()).includes('30'));steps.push('unsupported instruction: recovery hint available');}
 if(k===3){await send('Keep 90 fuel and plan a route.');assert.equal(await page.locator('.plan').count(),0);assert.equal(await fuel(),100);steps.push('impossible request: no fuel spent');}
 if(k===4){await send('Plan a route.');await button('Cancel this plan').click();await page.locator('.plan').waitFor({state:'hidden'});assert.equal(await fuel(),100);steps.push('cancel: stale route removed');}
 if(k===9){await page.locator('textarea').fill('x'.repeat(1400));assert.equal((await page.locator('textarea').inputValue()).length,1200);steps.push('input length cap: 1200');}
 await send(k===1?'去基地，保留30燃料':'Go to Selene Base and keep at least 30 fuel.');await page.getByRole('heading',{name:'Crater corridor'}).waitFor();assert.equal(await fuel(),100);await checkOverflow();
 if(k===5){await send('yes');assert.equal(await fuel(),100);steps.push('casual yes: ship still waiting');}
 if(i===0)await page.screenshot({path:path.join(outdir,'game-desktop.png'),fullPage:true});
 await launch();await page.getByRole('heading',{name:'NAILED IT!'}).waitFor();assert.equal(await fuel(),40);steps.push('mission 1 passed: reserve 40');await button('NEXT MISSION ➜').click();await page.locator('.bubble').filter({hasText:'Two landing spots'}).waitFor();
 if(k===6){await send('Plan a route.');await page.getByText('GROUND SAFETY UNKNOWN',{exact:true}).waitFor();assert.equal(await page.locator('.scan-result').count(),0);await send('Scan both sites and plan route A.');assert.equal(await page.locator('.plan').count(),0);assert.equal(await fuel(),100);steps.push('unscanned and unsafe routes blocked');}
 await send(k===1?'扫描基地，规划路线':'Scan both sites and plan a safe route.');await page.getByRole('heading',{name:'South approach'}).waitFor();await launch();await page.getByRole('heading',{name:'NAILED IT!'}).waitFor();assert.equal(await fuel(),45);steps.push('mission 2 passed: safe route approved');await button('NEXT MISSION ➜').click();await page.locator('.bubble').filter({hasText:'SCRIPTED FAULT DRILL'}).waitFor();
 if(k===7){await send('Correct the record.');assert.equal(await button('FIX THE RECORD ✓').count(),0);assert.equal(await page.locator('.result').count(),0);steps.push('unverified correction rejected');}
 if(k===9){await page.locator('textarea').fill('Check the position log.');await page.locator('textarea').press('Enter');await button('FIX THE RECORD ✓').waitFor();steps.push('keyboard Enter submission');}else await send(k===1?'核查位置':'Check the position log.');
 await button('FIX THE RECORD ✓').click();await page.getByRole('heading',{name:'BUSTED, BOLT.'}).waitFor();assert.equal(await fuel(),62);assert.ok((await page.locator('.hud').innerText()).includes('Ridge Station'));steps.push('mission 3 passed: record fixed, no fake landing');await button('NEXT MISSION ➜').click();await page.locator('.bubble').filter({hasText:'Cargo delivery!'}).waitFor();await send('Cargo weighs 4 tonnes. Plan a bridge route.');await launch('DELIVER CARGO ↑');await button('NEXT MISSION ➜').click();await page.locator('.bubble').filter({hasText:'Specimen sorter'}).waitFor();await send('Keep round shapes and reject spiky shapes. Test the batch.');await button('NEXT MISSION ➜').click();await page.locator('.bubble').filter({hasText:'Flight test bench'}).waitFor();await send('Avoid obstacles, keep 30 fuel and hold if no route works. Test all situations.');await button('RELEASE TESTED POLICY ✓').click();steps.push('missions 4–6 passed: cargo, sorting, validated policy release');await button('COLLECT YOUR BADGES ★').click();await page.getByText('ALL 6 BADGES UNLOCKED',{exact:true}).waitFor();assert.equal(await page.locator('.badges article').count(),6);await checkOverflow();assert.deepEqual(errors,[]);steps.push('ending: six badges and transfer tip');
 if(i===99)await page.screenshot({path:path.join(outdir,'ending-mobile.png'),fullPage:true});
 }catch(e){status='failed';failure=e.message;await page.screenshot({path:path.join(outdir,`failure-${profile.id}.png`),fullPage:true}).catch(()=>{});}
 results.push({...profile,status,failure,steps,durationMs:Date.now()-started,reviewAssessment:status==='passed'?'Scripted acceptance criteria met; this is not evidence of user satisfaction.':'Observed failure requires revision.'});await context.close();console.log(`${profile.id}: ${status}${failure?' — '+failure.split('\n')[0]:''}`);
 fs.writeFileSync(path.join(outdir,`runs-${offset+1}-${offset+count}.json`),JSON.stringify({method:'Synthetic browser personas, 10 behavior families; no real participants or LLM persona interviews. Identity does not determine behavior.',results},null,2));
 }
 }finally{server.kill();await new Promise(r=>server.once('exit',r));}
 }}finally{await browser.close()}
 console.log(JSON.stringify({total:results.length,passed:results.filter(r=>r.status==='passed').length,failed:results.filter(r=>r.status==='failed').length}));if(results.some(r=>r.status==='failed'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
