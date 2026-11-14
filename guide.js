/* A first-visit tour, also available from the footer on every page. */
(() => {
 const key='mystudyroom-guide-v1';
 const steps=[
  {target:'.open-book',title:'先翻一翻，再开始读',copy:'轻点右下页角 › 翻到下一页，左下页角 ‹ 往回翻。点纸面上的「开始阅读」或「翻开导读」，进入对应内容。'},
  {target:'.course-shelf',title:'选一本你想了解的书',copy:'这里有基础入门和四门课程。电脑上将鼠标移到书封会显示书名；手机直接轻点书封。课程导读里可以打开官方课程网站。'},
  {target:'.sticky-note',title:'把便利贴放在顺手的地方',copy:'按住便利贴上方拖动，就能自由移动、互相叠放。点「整理便利贴」可以恢复摆放，纸条上的链接也能打开学习路线。'},
  {target:'[data-motion-toggle]',title:'按自己的节奏来',copy:'这里可以暂停持续动效，台灯可以切换暖光。阅读页里能调字号、标记读完。阅读进度和便利贴位置保存在当前浏览器，手机与电脑分别记录。'}
 ];
 const dialog=document.createElement('dialog');dialog.className='study-guide';dialog.setAttribute('aria-labelledby','guide-title');
 dialog.innerHTML='<div class="guide-spotlight" aria-hidden="true"></div><section class="guide-card"><div class="guide-top"><span class="guide-count" role="status"></span><button class="guide-skip" data-guide-close>暂时跳过</button></div><h2 id="guide-title" tabindex="-1"></h2><p class="guide-copy"></p><div class="guide-actions"><button data-guide-prev>上一步</button><button class="guide-next" data-guide-next>下一步 →</button></div></section>';
 document.body.append(dialog);
 let index=0,origin=null,returnFocus=null,dismissed=false;
 function markSeen(){dismissed=true;try{localStorage.setItem(key,'seen');}catch{}}
 function position(){
  if(!dialog.open)return;const target=document.querySelector(steps[index].target);if(!target)return;
  const r=target.getBoundingClientRect(),pad=9,left=Math.max(7,r.left-pad),top=Math.max(7,r.top-pad),right=Math.min(innerWidth-7,r.right+pad),bottom=Math.min(innerHeight-7,r.bottom+pad);
  Object.assign(dialog.querySelector('.guide-spotlight').style,{left:left+'px',top:top+'px',width:Math.max(12,right-left)+'px',height:Math.max(12,bottom-top)+'px'});
  const card=dialog.querySelector('.guide-card');card.classList.toggle('card-at-top',r.top+r.height/2>innerHeight*.52);card.classList.toggle('card-at-left',innerWidth>760&&r.left+r.width/2>innerWidth*.6);
 }
 function showStep(){
  const step=steps[index];dialog.querySelector('.guide-count').textContent=`书房使用指南 · ${index+1} / ${steps.length}`;dialog.querySelector('h2').textContent=step.title;dialog.querySelector('.guide-copy').textContent=step.copy;
  dialog.querySelector('[data-guide-prev]').disabled=index===0;dialog.querySelector('[data-guide-next]').textContent=index===steps.length-1?'开始使用 ✓':'下一步 →';dialog.querySelector('[data-guide-close]').textContent=index===steps.length-1?'关闭':'暂时跳过';
  const target=document.querySelector(step.target);target?.scrollIntoView({behavior:'instant',block:'center'});
  if(innerWidth<=760&&index<3)window.scrollBy(0,innerHeight*.12);
  position();requestAnimationFrame(position);dialog.querySelector('h2').focus({preventScroll:true});
 }
 function openGuide(){
  if(dialog.open)return;origin={hash:location.hash,scroll:scrollY};returnFocus=document.activeElement;index=0;
  const begin=()=>{if(!document.querySelector('.open-book'))return;if(window.gsap){const words=document.querySelectorAll('.open-book .book-caption,.open-book .notebook-left');gsap.killTweensOf(words);gsap.set(words,{clearProps:'opacity,visibility'});}dialog.showModal();showStep();};
  if(location.hash&&location.hash!=='#home'){location.hash='home';requestAnimationFrame(()=>requestAnimationFrame(begin));}else begin();
 }
 function closeGuide(restore=true){
  markSeen();dialog.close();if(restore&&origin){const old=origin;origin=null;if(location.hash!==old.hash)location.hash=old.hash;requestAnimationFrame(()=>requestAnimationFrame(()=>{window.scrollTo(0,old.scroll);if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}));}
 }
 document.addEventListener('click',e=>{if(e.target.closest('[data-guide-open]'))openGuide();});
 dialog.addEventListener('click',e=>{if(e.target.closest('[data-guide-close]'))closeGuide();else if(e.target.closest('[data-guide-prev]')){index=Math.max(0,index-1);showStep();}else if(e.target.closest('[data-guide-next]')){if(index===steps.length-1)closeGuide();else{index++;showStep();}}});
 dialog.addEventListener('cancel',e=>{e.preventDefault();closeGuide();});
 window.addEventListener('resize',position);window.addEventListener('scroll',position,{passive:true});window.addEventListener('hashchange',()=>{if(dialog.open&&location.hash!=='#home'&&location.hash!=='')closeGuide(false);});
 function firstVisit(){let seen=dismissed;try{seen=seen||localStorage.getItem(key)==='seen';}catch{}if(!seen&&(!location.hash||location.hash==='#home'))openGuide();}
 if(document.readyState==='complete')setTimeout(firstVisit,450);else window.addEventListener('load',()=>setTimeout(firstVisit,450),{once:true});
})();
