// Small original arcade cues, synthesized locally; no downloads or autoplay.
export function createSoundEngine({createContext=()=>new (window.AudioContext||window.webkitAudioContext)(),storage=()=>localStorage,hidden=()=>document.hidden}={}){
 let context,master,muted=false,unlocked=false;
 const voices=new Set();
 try{muted=storage().getItem('bolt-muted')==='true';}catch{}
 function stop(){for(const voice of voices){try{voice.stop();}catch{} }voices.clear();}
 function unlock(){
  if(muted)return;
  try{
   if(!context){context=createContext();master=context.createGain();master.gain.value=.18;master.connect(context.destination);}
   unlocked=true;
   if(context.state==='suspended'||context.state==='interrupted')context.resume().catch(()=>{});
  }catch{unlocked=false;}
 }
 function tone(at,duration,frequency,end=frequency,type='triangle',level=.35){
  const source=context.createOscillator(),gain=context.createGain();
  source.type=type;source.frequency.setValueAtTime(frequency,at);source.frequency.exponentialRampToValueAtTime(end,at+duration);
  gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(level,at+.008);gain.gain.exponentialRampToValueAtTime(.001,at+duration);
  source.connect(gain);gain.connect(master);voices.add(source);
  source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();};source.start(at);source.stop(at+duration+.02);
 }
 function noise(at,duration,frequency,level){
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
  const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  source.buffer=buffer;filter.type='lowpass';filter.frequency.setValueAtTime(frequency,at);filter.frequency.exponentialRampToValueAtTime(80,at+duration);
  gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(level,at+.025);gain.gain.exponentialRampToValueAtTime(.001,at+duration);
  source.connect(filter);filter.connect(gain);gain.connect(master);voices.add(source);
  source.onended=()=>{voices.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};source.start(at);source.stop(at+duration+.02);
 }
 function play(cue){
  if(muted||!unlocked||!context||context.state==='closed'||hidden())return;
  try{
   const t=context.currentTime+.01;
   if(voices.size>24)stop();
   if(cue==='click')tone(t,.055,600,430,'triangle',.15);
   if(cue==='reply'){tone(t,.08,660,660);tone(t+.09,.12,880,880);}
   if(cue==='scan'){tone(t,.28,260,1100,'sine');tone(t+.29,.1,1100,1100);}
   if(cue==='launch'){noise(t,1.35,1500,.55);tone(t,.9,65,180,'sawtooth',.12);}
   if(cue==='drive'){noise(t,.8,430,.3);tone(t,.7,90,150,'triangle',.16);}
   if(cue==='crash'){stop();noise(t,.7,2200,.7);tone(t,.55,150,35,'sawtooth',.25);}
   if(cue==='success')[523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(t+i*.12,i===3?.38:.18,f,f,'triangle',.35));
   if(cue==='warning'){tone(t,.18,280,210,'triangle');tone(t+.2,.22,210,140,'triangle');}
  }catch{/* Audio support never blocks a mission. */}
 }
 return {unlock,play,stop,isMuted:()=>muted,setMuted(value){muted=Boolean(value);if(muted)stop();if(master)master.gain.value=muted?0:.18;try{storage().setItem('bolt-muted',String(muted));}catch{} }};
}
export function feedbackCue(before,after){
 if(after.status!=='active')return null;
 if(!before?.scanned&&after.scanned)return 'scan';
 if(after.trialRuns>(before?.trialRuns||0))return after.trialResults.some(r=>r.planId===after.plan?.id&&!r.pass)?'warning':'reply';
 if(after.sortRuns>(before?.sortRuns||0))return after.sortResults.some(r=>!r.pass)?'warning':'reply';
 return 'reply';
}
export const sound=createSoundEngine();
