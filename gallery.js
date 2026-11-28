/* Photos are published only after the couple's selection is approved. */
function selectedWeddingPhotos(settings){
  if(!settings||settings.enabled!==true||!Array.isArray(settings.photos))return [];
  return settings.photos.filter(photo=>photo&&typeof photo.src==='string'&&/^guest-thumb-(?:0[1-9]|10)\.(?:jpe?g|png|webp)$/.test(photo.src)).slice(0,10);
}
(()=>{
  const root=document.querySelector('#guestCarousel'),data=document.querySelector('#guestCarouselData');
  if(!root||!data)return;
  let photos;try{photos=selectedWeddingPhotos(JSON.parse(data.textContent))}catch{return}
  if(!photos.length)return;
  const track=root.querySelector('.guest-carousel-track'),previous=root.querySelector('[data-gallery-prev]'),next=root.querySelector('[data-gallery-next]'),position=root.querySelector('.guest-carousel-position');
  photos.forEach((photo,index)=>{
    const item=document.createElement('li'),image=document.createElement('img');
    image.src=photo.src;image.alt=photo.alt||'Μια στιγμή από τον γάμο μας — φωτογραφία '+(index+1);
    image.width=320;image.height=240;image.loading='lazy';image.decoding='async';
    item.append(image);track.append(item);
  });
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function update(){
    const max=track.scrollWidth-track.clientWidth;
    previous.disabled=track.scrollLeft<=2;next.disabled=track.scrollLeft>=max-2;
    const card=track.firstElementChild,step=card.getBoundingClientRect().width+12;
    position.textContent=Math.min(photos.length,Math.round(track.scrollLeft/step)+1)+' / '+photos.length;
    previous.hidden=next.hidden=max<=2;
  }
  function move(direction){
    const step=track.firstElementChild.getBoundingClientRect().width+12;
    track.scrollBy({left:direction*step,behavior:reduced.matches?'instant':'smooth'});
  }
  previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
  track.addEventListener('scroll',update,{passive:true});
  track.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1)}});
  window.addEventListener('resize',update,{passive:true});
  root.hidden=false;requestAnimationFrame(update);
})();
