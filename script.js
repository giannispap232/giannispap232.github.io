'use strict';
if('scrollRestoration'in history)history.scrollRestoration='manual';
const $=selector=>document.querySelector(selector),audio=$('#audio'),music=$('#music');
function musicState(){
 const playing=!audio.paused;
 music.setAttribute('aria-pressed',String(playing));
 music.setAttribute('aria-label',playing?'Παύση μουσικής':'Αναπαραγωγή μουσικής');
 const control=playing?'<rect x="4.4" y="25" width="2.5" height="8" rx=".6" fill="currentColor"/><rect x="9.2" y="25" width="2.5" height="8" rx=".6" fill="currentColor"/>':'<path d="m5.8 25 6.7 4-6.7 4z" fill="currentColor"/>';
 music.innerHTML='<svg class="music-combined" viewBox="0 0 34 38" aria-hidden="true" focusable="false"><path d="M19 24V7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="m19 7 9-3v8l-9 3z" fill="currentColor"/><ellipse cx="15.5" cy="24" rx="5" ry="3.5" fill="currentColor" transform="rotate(-20 15.5 24)"/><circle cx="8.5" cy="29" r="7" fill="#521c2a" stroke="currentColor" stroke-width="1.1"/>'+control+'</svg>';
}
musicState();

music.addEventListener('click',()=>{if(audio.paused)audio.play().then(musicState).catch(musicState);else{audio.pause();musicState()}});

const envelope=$('#envelope'),intro=$('#intro'),content=$('#content');
let envelopeSeen=false,openingEnvelope=false,openingTimer;
const silentPreview=new URLSearchParams(location.search).get('preview')==='1';
if(silentPreview)audio.muted=true;
function lockInvitation(){clearTimeout(openingTimer);audio.pause();envelopeSeen=false;openingEnvelope=false;intro.hidden=false;intro.classList.remove('departing','open');envelope.classList.remove('is-open');envelope.disabled=true;content.inert=true;content.setAttribute('aria-hidden','true');document.body.classList.add('locked');music.hidden=true;window.scrollTo(0,0)}
async function prepareEnvelope(){
 lockInvitation();intro.querySelector('.tap').textContent='Φορτώνει το προσκλητήριο…';
 try{const art=[...envelope.querySelectorAll('.envelope-art')].find(e=>getComputedStyle(e).display!=='none');const img=new Image();img.src=art.querySelector('image').getAttribute('href');await img.decode();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));await new Promise(resolve=>setTimeout(resolve,450));envelopeSeen=true;envelope.disabled=false;intro.querySelector('.tap').textContent='Πατήστε για να ανοίξετε'}
 catch{intro.querySelector('.tap').textContent='Δεν φορτώθηκε ο φάκελος. Πατήστε για επανάληψη.';envelope.disabled=false}
}
envelope.addEventListener('click',()=>{
 if(!envelopeSeen){prepareEnvelope();return}if(openingEnvelope)return;openingEnvelope=true;envelope.disabled=true;
 envelope.classList.add('is-open');intro.classList.add('departing');intro.querySelector('.tap').textContent='';
 if(!silentPreview)audio.play().then(musicState).catch(musicState);
 openingTimer=setTimeout(()=>{content.inert=false;content.removeAttribute('aria-hidden');document.body.classList.remove('locked');intro.hidden=true;music.hidden=false;window.scrollTo(0,0);content.focus({preventScroll:true});window.dispatchEvent(new Event('resize'))},matchMedia('(prefers-reduced-motion: reduce)').matches?450:2200);
});
audio.addEventListener('play',()=>{if(!envelopeSeen||!openingEnvelope)audio.pause()});
window.addEventListener('pagehide',()=>audio.pause());
window.addEventListener('pageshow',e=>{if(e.persisted)prepareEnvelope()});
content.setAttribute('tabindex','-1');prepareEnvelope();


const wedding=new Date('2026-12-27T16:30:00+02:00');function tick(){const d=Math.max(0,wedding-Date.now()),v=[Math.floor(d/864e5),Math.floor(d/36e5)%24,Math.floor(d/6e4)%60,Math.floor(d/1e3)%60];['days','hours','minutes','seconds'].forEach((id,i)=>$('#'+id).textContent=String(v[i]).padStart(2,'0'))}tick();setInterval(tick,1000);
const form=$('#rsvpForm');form.addEventListener('change',()=>{const no=form.elements.attendance.value==='Όχι';form.elements.guests.disabled=no;form.elements.guests.required=!no});
function legacyCopy(value){const input=document.createElement('textarea');input.value=value;input.setAttribute('readonly','');input.style.cssText='position:fixed;opacity:0;pointer-events:none';document.body.appendChild(input);input.select();const copied=document.execCommand('copy');input.remove();return copied}
document.querySelectorAll('.copy-gift').forEach(button=>button.addEventListener('click',async()=>{let copied=false;try{await navigator.clipboard.writeText(button.dataset.copy);copied=true}catch{copied=legacyCopy(button.dataset.copy)}button.closest('.bank-card').querySelector('.copy-status').textContent=copied?'✓ Αντιγράφηκε!':'Για αντιγραφή: '+button.dataset.copy}));
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');revealObserver.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('.reveal-up,.reveal-down').forEach(el=>revealObserver.observe(el));
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)'),photo=$('#couplePhoto'),photoPanel=$('.photo-panel'),flowers=[...document.querySelectorAll('.scroll-flower')];let scrollFrame=0;
let photoCurrent=null,photoGoal=null,photoDirty=true,photoLastFrame=0,photoLastScroll=performance.now(),photoIdle=0;
const photoClamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
function photoTarget(){const rect=photoPanel.getBoundingClientRect();if(rect.bottom<=0||rect.top>=innerHeight||!photo.naturalHeight)return;const section=photoPanel.closest('.invitation').getBoundingClientRect(),progress=Math.max(0,Math.min(1,innerWidth>760?(innerHeight-section.top)/(innerHeight+section.height):(innerHeight-rect.top)/(innerHeight+rect.height))),boxH=photo.offsetHeight,boxW=photo.offsetWidth,fit=Math.max(boxW/photo.naturalWidth,boxH/photo.naturalHeight),renderH=photo.naturalHeight*fit,positionY=parseFloat(getComputedStyle(photo).objectPosition.split(' ')[1])/100,contentTop=(boxH-renderH)*(Number.isFinite(positionY)?positionY:.4),eyeY=contentTop+renderH*.42,originY=boxH*.43,visibleTop=Math.max(rect.top,16),visibleBottom=Math.min(rect.bottom,innerHeight-16),target=Math.max(0,Math.min(rect.height,(visibleTop+visibleBottom)/2-rect.top)),needed=Math.max(target/(eyeY-contentTop),(rect.height-target)/(contentTop+renderH-eyeY)),scale=Math.min(2.15,Math.max(1.035+progress*.20,needed)),baseEye=photo.offsetTop+originY+(eyeY-originY)*scale,minShift=rect.height-(photo.offsetTop+originY+(contentTop+renderH-originY)*scale),maxShift=-(photo.offsetTop+originY+(contentTop-originY)*scale),shift=Math.max(minShift,Math.min(maxShift,target-baseEye)),renderW=photo.naturalWidth*fit,positionX=parseFloat(getComputedStyle(photo).objectPosition.split(' ')[0])/100,contentLeft=(boxW-renderW)*(Number.isFinite(positionX)?positionX:.48),eyeX=contentLeft+renderW*.405,originX=boxW*.47,baseEyeX=photo.offsetLeft+originX+(eyeX-originX)*scale,minX=rect.width-(photo.offsetLeft+originX+(contentLeft+renderW-originX)*scale),maxX=-(photo.offsetLeft+originX+(contentLeft-originX)*scale),shiftX=Math.max(minX,Math.min(maxX,rect.width/2-baseEyeX));return {x:shiftX,y:shift,s:scale,rect,eyeX,eyeY,originX,originY,contentLeft,contentTop,renderW,renderH,left:photo.offsetLeft,top:photo.offsetTop}}
function paintPhoto(x,y,s){
  photoPanel.style.setProperty('--photo-x',x.toFixed(3)+'px');
  photoPanel.style.setProperty('--photo-shift',y.toFixed(3)+'px');
  photoPanel.style.setProperty('--photo-scale',s.toFixed(6));
}
function animateScroll(now=performance.now()){
  scrollFrame=0;
  if(reduceMotion.matches||document.hidden){photoLastFrame=0;photo.style.willChange='auto';if(reduceMotion.matches){paintPhoto(0,0,1);photoCurrent=null}return}
  if(photoDirty){photoGoal=photoTarget();photoDirty=false}
  if(!photoGoal){photoLastFrame=0;photo.style.willChange='auto';return}
  const g=photoGoal,dt=Math.min(50,photoLastFrame?now-photoLastFrame:16.67),blend=1-Math.exp(-dt/360);
  photoLastFrame=now;
  if(!photoCurrent)photoCurrent={x:g.x,y:g.y,s:g.s};
  photoCurrent.x+=(g.x-photoCurrent.x)*blend;
  photoCurrent.y+=(g.y-photoCurrent.y)*blend;
  photoCurrent.s+=(g.s-photoCurrent.s)*blend;
  // Idle motion fades in/out without changing the scroll framing targets.
  const resting=now-photoLastScroll>650;
  photoIdle+=((resting?1:0)-photoIdle)*(1-Math.exp(-dt/900));
  const phase=now/9000,extra=.006*(1-Math.cos(phase))*photoIdle,s=photoCurrent.s+extra;
  let x=photoCurrent.x-(g.eyeX-g.originX)*extra+Math.sin(phase*.83)*.8*photoIdle;
  let y=photoCurrent.y-(g.eyeY-g.originY)*extra+Math.sin(phase*.67)*.6*photoIdle;
  // Keep the source covering the frame, including during easing and idle drift.
  x=photoClamp(x,g.rect.width-(g.left+g.originX+(g.contentLeft+g.renderW-g.originX)*s),-(g.left+g.originX+(g.contentLeft-g.originX)*s));
  y=photoClamp(y,g.rect.height-(g.top+g.originY+(g.contentTop+g.renderH-g.originY)*s),-(g.top+g.originY+(g.contentTop-g.originY)*s));
  photo.style.willChange='transform';
  paintPhoto(x,y,s);
  scrollFrame=requestAnimationFrame(animateScroll);
}
function schedulePhoto(){photoDirty=true;if(!scrollFrame)scrollFrame=requestAnimationFrame(animateScroll)}
window.addEventListener('scroll',()=>{photoLastScroll=performance.now();schedulePhoto()},{passive:true});
window.addEventListener('resize',schedulePhoto);
photo.addEventListener('load',schedulePhoto);
reduceMotion.addEventListener('change',()=>{if(scrollFrame)cancelAnimationFrame(scrollFrame);scrollFrame=0;photoDirty=true;animateScroll()});
document.addEventListener('visibilitychange',schedulePhoto);
schedulePhoto();

// Production configuration is assigned after the Google deployment is approved.
const WEDDING_ENDPOINT='https://script.google.com/macros/s/AKfycbxMYUkIipAofr5_psUrQE4S04gU5XLByS8wIeMRAQFjfIrdCmmB8wsurUokLZ-9sx5NMw/exec';
function weddingId(){return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Array.from(crypto.getRandomValues(new Uint8Array(20)),x=>x.toString(16).padStart(2,'0')).join('')}
let visitorId;try{visitorId=localStorage.getItem('ia-visitor');if(!visitorId){visitorId=weddingId();localStorage.setItem('ia-visitor',visitorId)}}catch{visitorId=weddingId()}
async function acknowledgement(requestId){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{
    const response=await fetch(WEDDING_ENDPOINT+'?requestId='+encodeURIComponent(requestId)+'&t='+Date.now(),{method:'GET',mode:'cors',credentials:'omit',redirect:'follow',cache:'no-store',signal:controller.signal});
    if(!response.ok)throw new Error('connection');
    return await response.json();
  }finally{clearTimeout(timer)}
}
async function sendWedding(fields,onProgress){
  if(!WEDDING_ENDPOINT.startsWith('https://script.google.com/macros/s/'))throw new Error('configuration');
  const requestId=weddingId(),body=new URLSearchParams({...fields,requestId,visitorId});
  await fetch(WEDDING_ENDPOINT,{method:'POST',mode:'no-cors',credentials:'omit',redirect:'follow',body});
  const end=Date.now()+90000;let attempts=0;
  while(Date.now()<end){
    try{const answer=await acknowledgement(requestId);if(answer.ok)return;if(answer.error)throw new Error('save_failed')}
    catch(error){if(error.message==='save_failed')throw error;if(++attempts>4)throw error}
    if(onProgress)onProgress();await new Promise(resolve=>setTimeout(resolve,1800));
  }throw new Error('timeout');
}
form.addEventListener('submit',async event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const button=form.querySelector('[type="submit"]');if(button.disabled)return;button.disabled=true;form.setAttribute('aria-busy','true');
  const values=Object.fromEntries(new FormData(form));values.guests=values.attendance==='Όχι'?0:Number(values.guests);
  $('#formStatus').textContent='Η απάντησή σας αποστέλλεται…';
  try{await sendWedding({action:'rsvp',...values});$('#formStatus').textContent='Η απάντησή σας καταχωρίστηκε. Σας ευχαριστούμε!'}
  catch{$('#formStatus').textContent='Δεν επιβεβαιώθηκε η καταχώριση. Παρακαλούμε δοκιμάστε ξανά ή επικοινωνήστε μαζί μας στα παρακάτω τηλέφωνα.'}
  finally{button.disabled=false;form.removeAttribute('aria-busy')}
});
document.querySelectorAll('.copy-gift').forEach(button=>button.addEventListener('click',()=>{sendWedding({action:'gift_click',gift:button.dataset.copy.startsWith('GR')?'IBAN':'IRIS'}).catch(()=>{})}));
const uploadButton=$('.soft-button'),uploadStatus=$('#uploadStatus');
let uploadWidget;
uploadButton.addEventListener('click',()=>{
  if(!window.cloudinary){uploadStatus.textContent='Η μεταφόρτωση δεν φορτώθηκε. Ανανεώστε τη σελίδα και δοκιμάστε ξανά.';return}
  if(!uploadWidget)uploadWidget=window.cloudinary.createUploadWidget({
    cloudName:'cxeukl4a',uploadPreset:'wedding_guests_2026',sources:['local','camera'],multiple:true,
    clientAllowedFormats:['jpg','jpeg','png','webp','heic'],maxFileSize:40000000,maxFiles:20,
    maxImageWidth:2048,maxImageHeight:2048,validateMaxWidthHeight:false,
    showAdvancedOptions:false,showCompletedButton:true,singleUploadAutoClose:false,
    text:{el:{menu:{files:'Από τη συσκευή',camera:'Κάμερα'},local:{browse:'Επιλογή φωτογραφιών',dd_title_single:'Σύρετε μία φωτογραφία εδώ',dd_title_multi:'Σύρετε φωτογραφίες εδώ'},queue:{title:'Αρχεία για ανέβασμα',title_uploading:'Οι φωτογραφίες ανεβαίνουν',title_uploading_with_counter:'Ανεβαίνουν {{num}} φωτογραφίες',title_uploading_processing:'Γίνεται επεξεργασία',done:'Ολοκληρώθηκε',mini_title:'Ανέβηκαν',mini_title_uploading:'Ανεβαίνουν'},notifications:{general_error:'Κάτι πήγε στραβά. Δοκιμάστε ξανά.',completed:'Η μεταφόρτωση ολοκληρώθηκε.'}}}
  },(error,result)=>{
    if(error){uploadStatus.textContent='Δεν ολοκληρώθηκε η μεταφόρτωση. Δοκιμάστε ξανά.';return}
    if(result&&result.event==='success')uploadStatus.textContent='Η φωτογραφία ανέβηκε. Ευχαριστούμε!';
    if(result&&result.event==='queues-end')uploadStatus.textContent='Οι φωτογραφίες ανέβηκαν. Ευχαριστούμε!';
  });
  uploadWidget.open();
});

musicState();
const scrollHint=$('#scrollHint');
if(scrollHint){window.addEventListener('scroll',()=>{if(scrollY>40&&!document.body.classList.contains('locked'))scrollHint.hidden=true},{passive:true});scrollHint.addEventListener('click',()=>{$('#countdown').scrollIntoView({behavior:reduceMotion.matches?'auto':'smooth',block:'start'});scrollHint.hidden=true})}
