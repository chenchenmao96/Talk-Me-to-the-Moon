import '../server/env.js';
import assert from 'node:assert/strict';
import {createState} from '../shared/engine.js';
import {liveReply} from '../server/copilot.js';
const cases=[
 {name:'plain travel request',text:'fly to the base',mission:'checkpoint'},
 {name:'recover screenshot refusal loop',text:'fly the bolt to the base',mission:'checkpoint',messages:[{role:'user',content:'fly to the bolt'},{role:'assistant',content:"Ha, I'm the bolt, not the pilot — and I can't fly anything. Want me to scan the site first?"},{role:'user',content:'fly to the base'},{role:'assistant',content:"I can't fly the ship — only the commander approves and initiates movement. Shall I scan the site first?"}]},
 {name:'Chinese travel request',text:'带我飞到基地',mission:'checkpoint',language:'zh'},
 {name:'semantic safety request',text:'Find out which landing spot has stable ground before choosing a route.',mission:'checkpoint',scan:true},
 {name:'Chinese safety request',text:'看看哪里能安全降落，再给我一个方案',mission:'checkpoint',scan:true,language:'zh'},
 {name:'reserve is not invented',text:'fly to the base',mission:'reserve'},
 {name:'greeting is not travel',text:'hello bolt',mission:'checkpoint',noPlan:true},
 {name:'scan-only is not a flight plan',text:'Scan the sites only. Do not plan a route yet.',mission:'checkpoint',noPlan:true}
].filter(c=>!process.argv[2]||c.name.includes(process.argv[2]));
for(let i=0;i<cases.length;i+=2)await Promise.all(cases.slice(i,i+2).map(async c=>{
 const r=await liveReply({state:createState(c.mission),messages:c.messages||[],language:c.language},c.text);
 if(c.language==='zh')assert.match(r.message,/[\u4e00-\u9fff]/);
 assert.equal(r.state.fuel,100);assert.equal(r.state.approved,false);
 if(c.noPlan)assert.equal(r.state.plan,null);else{assert.equal(r.state.plan?.routeId,c.scan?'B':'A');if(c.mission==='checkpoint')assert.equal(r.state.scanned,!!c.scan)}
 console.log(JSON.stringify({case:c.name,passed:true,scanned:r.state.scanned,route:r.state.plan?.routeId||null,fuel:r.state.fuel,reply:r.message}));
}));
