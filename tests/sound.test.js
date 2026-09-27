import test from 'node:test';
import assert from 'node:assert/strict';
import {createSoundEngine,feedbackCue} from '../src/sound.js';

function harness(saved='false'){
 const sources=[],values=new Map([['bolt-muted',saved]]);let contexts=0,hidden=false;
 const param=()=>({value:0,setValueAtTime(v){assert.ok(Number.isFinite(v));},linearRampToValueAtTime(v){assert.ok(Number.isFinite(v));},exponentialRampToValueAtTime(v){assert.ok(v>0&&Number.isFinite(v));}});
 const node=()=>({connect(){},disconnect(){}});
 const source=()=>{const s={...node(),frequency:param(),start(t){assert.ok(t>=0);s.started=true;},stop(){s.stopped=true;}};sources.push(s);return s;};
 const context={state:'running',currentTime:0,sampleRate:8000,destination:{},createGain:()=>({...node(),gain:param()}),createOscillator:source,createBufferSource:source,createBiquadFilter:()=>({...node(),frequency:param()}),createBuffer:(_,length)=>({getChannelData:()=>new Float32Array(length)})};
 const sound=createSoundEngine({createContext:()=>{contexts++;return context;},storage:()=>({getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)}),hidden:()=>hidden});
 return {sound,sources,values,context,contexts:()=>contexts,hide:()=>{hidden=true;}};
}
test('sound requires a gesture, reuses one audio context and respects mute and hidden tabs',()=>{
 const h=harness();h.sound.play('launch');assert.equal(h.contexts(),0);assert.equal(h.sources.length,0);
 h.sound.unlock();h.sound.unlock();h.sound.play('launch');assert.equal(h.contexts(),1);assert.ok(h.sources.length>0);
 h.sound.setMuted(true);assert.ok(h.sources.every(s=>s.stopped));const count=h.sources.length;
 h.sound.play('crash');assert.equal(h.sources.length,count);assert.equal(h.values.get('bolt-muted'),'true');
 h.sound.setMuted(false);h.hide();h.sound.play('success');assert.equal(h.sources.length,count);
});
test('saved mute prevents initialization and unavailable audio never breaks gameplay',()=>{
 const h=harness('true');h.sound.unlock();h.sound.play('reply');assert.equal(h.contexts(),0);
 const sound=createSoundEngine({createContext:()=>{throw Error('unsupported');},storage:()=>{throw Error('blocked');},hidden:()=>false});
 assert.doesNotThrow(()=>{sound.unlock();sound.play('click');sound.setMuted(true);sound.stop();});
});
test('all arcade cues schedule finite, bounded sounds and tests use outcome feedback',()=>{
 for(const cue of ['click','reply','scan','launch','drive','crash','success','warning']){const h=harness();h.sound.unlock();h.sound.play(cue);assert.ok(h.sources.length>0,cue);assert.ok(h.sources.every(s=>s.started&&s.stopped));}
 assert.equal(feedbackCue({scanned:false},{status:'active',scanned:true}),'scan');
 assert.equal(feedbackCue({trialRuns:0},{status:'active',trialRuns:1,plan:{id:'p'},trialResults:[{planId:'p',pass:false}]}),'warning');
 assert.equal(feedbackCue({sortRuns:0},{status:'active',sortRuns:1,sortResults:[{pass:false}]}),'warning');
 assert.equal(feedbackCue({}, {status:'complete'}),null);
});

test('an interrupted audio context resumes on the next user gesture',()=>{
 const h=harness();let resumed=0;h.context.state='interrupted';h.context.resume=async()=>{resumed++;h.context.state='running';};
 h.sound.unlock();h.sound.play('reply');assert.equal(resumed,1);assert.ok(h.sources.length>0);
});
