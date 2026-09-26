import './env.js';
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { createState, command, checks } from '../shared/engine.js';
import { practiceReply } from './practice.js';
import { liveReply } from './copilot.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const sessions=new Map(), limits=new Map();
const liveAvailable=()=>Boolean(process.env.DEEPSEEK_API_KEY);
function safeEqual(a,b){const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length===y.length&&timingSafeEqual(x,y);}
function snapshot(s){return {sessionId:s.id,state:{...s.state,checks:checks(s.state)},messages:s.messages,mode:s.mode};}
function send(res,code,data){res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
async function body(req){let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>8192)throw new Error('Request too large');}return JSON.parse(text||'{}');}
function allowed(key,max=35){const now=Date.now(),v=limits.get(key)||{start:now,n:0};if(now-v.start>60000){v.start=now;v.n=0;}v.n++;limits.set(key,v);return v.n<=max;}
setInterval(()=>{const now=Date.now();for(const [k,s] of sessions)if(now-s.touched>3600000)sessions.delete(k);for(const[k,v]of limits)if(now-v.start>60000)limits.delete(k);},60000).unref();
export const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');
 res.setHeader('X-Frame-Options','DENY');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'");
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/')){
   if(req.method==='GET'&&url.pathname==='/api/health')return send(res,200,{ok:true,liveAvailable:liveAvailable(),requiresAccessCode:Boolean(process.env.LIVE_ACCESS_CODE)});
   if(req.method!=='POST')return send(res,405,{error:'Use POST for mission requests.'});
   if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host&&!['localhost:5173','127.0.0.1:5173'].includes(new URL(req.headers.origin).host))return send(res,403,{error:'Origin not allowed.'});
   if(!allowed(req.socket.remoteAddress,60))return send(res,429,{error:'Please wait a moment before sending more commands.'});
   const input=await body(req);
   if(url.pathname==='/api/session'){
    if(sessions.size>=1000)return send(res,503,{error:'Mission control is full. Please try again later.'});
    const mode=input.mode==='practice'?'practice':'live';
    if(mode==='live'&&!liveAvailable())return send(res,503,{error:'BOLT is not connected. Configure the server’s DeepSeek key and retry.'});
    if(mode==='live'&&process.env.LIVE_ACCESS_CODE&&!safeEqual(input.accessCode,process.env.LIVE_ACCESS_CODE))return send(res,403,{error:'The live access code is not correct.'});
    const id=randomUUID(),state=createState(input.missionId||'reserve');
    const intro=state.missionId==='verify'?'SCRIPTED FAULT DRILL: “Arrival complete at Selene Base.” This training report may be wrong. Check the instruments.':state.missionId==='checkpoint'?'BOLT here! Two landing spots. One looks suspicious. Ask me to scan before we pick a route.':'Hey, I’m BOLT. Where are we going? Any limits? I pick the fastest route unless you tell me otherwise. You get the launch button.';
    const s={id,state,mode,language:input.language==='zh'?'zh':'en',messages:[{role:'assistant',content:intro}],busy:false,turns:0,touched:Date.now()};sessions.set(id,s);return send(res,201,snapshot(s));
   }
   const s=sessions.get(input.sessionId);if(!s)return send(res,404,{error:'This session has expired. Start a new attempt.',expired:true});
   if(input.language==='zh'||input.language==='en')s.language=input.language;
   s.touched=Date.now();if(s.busy)return send(res,409,{error:'The copilot is still handling the last instruction.'});
   if(input.revision!==s.state.revision)return send(res,409,{error:'The plan has changed. Please use the latest mission state.'});
   if(!allowed(s.id,20))return send(res,429,{error:'Take a breath. Try another command in a minute.'});
   if(url.pathname==='/api/action'){
    if(!['approve','reconcile','cancel'].includes(input.action))return send(res,400,{error:'Unsupported commander action.'});
    const r=command(s.state,{type:input.action,planId:input.planId});s.state=r.state;
    s.messages.push({role:'user',content:input.action==='approve'?'Approve the displayed flight plan.':input.action==='reconcile'?'Correct the mission record using the position log.':'Cancel the pending plan.'},{role:'assistant',content:r.message});
    return send(res,200,snapshot(s));
   }
   if(url.pathname==='/api/chat'){
    if(typeof input.message!=='string'||!input.message.trim()||input.message.length>1200)return send(res,400,{error:'Enter an instruction between 1 and 1,200 characters.'});
    if(s.turns>=40)return send(res,429,{error:'This attempt has reached its conversation limit. Start a new attempt.'});
    s.busy=true;
    try{
     const r=s.mode==='live'?await liveReply(s,input.message.trim()):practiceReply(s.state,input.message.trim());s.state=r.state;s.turns++;
     s.messages.push({role:'user',content:input.message.trim()},{role:'assistant',content:r.message});return send(res,200,snapshot(s));
    }catch{return send(res,502,{error:'The live copilot could not respond. No actions from this turn were saved. Your draft is kept. Please retry.'});}
    finally{s.busy=false;}
   }
   return send(res,404,{error:'Unknown endpoint.'});
  }
  if(req.method!=='GET'&&req.method!=='HEAD')return send(res,405,{error:'Method not allowed.'});
  let decoded;try{decoded=decodeURIComponent(url.pathname);}catch{return send(res,400,{error:'Invalid path.'});}
  let file=path.resolve(root,'.'+decoded);if(file!==root&&!file.startsWith(root+path.sep))return send(res,403,{error:'Invalid path.'});
  if(path.basename(file).startsWith('.'))return send(res,404,{error:'Not found.'});
  try{if(!(await stat(file)).isFile())file=path.join(root,'index.html');}catch{file=path.join(root,'index.html');}
  const content=await readFile(file);const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':file.includes('/assets/')?'public, max-age=31536000, immutable':'no-cache'});res.end(req.method==='HEAD'?undefined:content);
 }catch(e){send(res,e.message==='Unknown mission'?400:400,{error:'Could not process this request. Check the mission and try again.'});}
});
if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(Number(process.env.PORT||4173),process.env.HOST||'127.0.0.1',()=>console.log(`Mission control ready at http://127.0.0.1:${process.env.PORT||4173} (${liveAvailable()?'live copilot available':'practice mode'})`));
