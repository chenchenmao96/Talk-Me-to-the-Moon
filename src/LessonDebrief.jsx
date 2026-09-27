import React,{useEffect,useRef,useState} from 'react';
import {lessonContent} from './lesson-content.js';
import './lesson.css';

export function LessonDebrief({mission,state,lang,last,demo,onContinue,disabled}){
 const [open,setOpen]=useState(true),dialog=useRef(null),heading=useRef(null),review=useRef(null);
 const zh=lang==='zh',lesson=lessonContent(mission.id,lang,state);
 useEffect(()=>{
  if(open){dialog.current?.showModal();heading.current?.focus();}
  else dialog.current?.close();
 },[open]);
 function close(){dialog.current?.close();setOpen(false);review.current?.focus();}
 return <>
  <button ref={review} type="button" className="secondary lesson-reopen" onClick={()=>setOpen(true)}>{zh?'回看：这一关学到了什么？':'REVIEW: WHAT DID I LEARN?'}</button>
  <dialog ref={dialog} className="lesson-dialog" aria-labelledby="lesson-heading" onCancel={e=>{e.preventDefault();close();}}>
   <button type="button" className="close" aria-label={zh?'关闭学习小结':'Close lesson recap'} onClick={close}>×</button>
   <span className="lesson-earned">★ {zh?`第 ${Number(mission.number)} 关通过！`:`MISSION ${Number(mission.number)} CLEARED!`}</span>
   <h2 id="lesson-heading" ref={heading} tabIndex={-1}>{lesson.title}</h2>
   <section className="lesson-block"><h3>{zh?'这一关在教什么？':'WHAT WAS THIS TEACHING?'}</h3><p>{lesson.idea}</p></section>
   <section className="lesson-block"><h3>{zh?'刚才为什么能过关？':'WHY DID THAT WORK?'}</h3><p>{lesson.why}</p></section>
   <section className="lesson-example"><h3>{zh?'试试这条完整提示词':'TRY THIS COMPLETE PROMPT'}</h3><p className="lesson-prompt">{lesson.example}</p><p className="example-check"><b>{zh?'你来核对：':'YOUR CHECK: '}</b>{lesson.check}</p></section>
   <p className="lesson-takeaway"><b>{zh?'带走这一招：':'TAKE THIS WITH YOU: '}</b>{lesson.takeaway}</p>
   <button type="button" className="primary lesson-continue" disabled={disabled} onClick={()=>{close();onContinue();}}>{last?(zh?(demo?'明白了，完成演示 ★':'明白了，领取徽章 ★'):(demo?'GOT IT · FINISH DEMO ★':'GOT IT · COLLECT BADGES ★')):(zh?'明白了，下一关 ➜':'GOT IT · NEXT MISSION ➜')}</button>
  </dialog>
 </>;
}
