const main = document.querySelector('main');
const storageKey = 'mystudyroom-v1';
let state = { lamp: false, motionPaused: false, notes: {} };
try { const saved = JSON.parse(localStorage.getItem(storageKey)); if(saved && typeof saved==='object') { state.lamp = saved.lamp === true; state.motionPaused = saved.motionPaused === true; if(saved.notes && typeof saved.notes === 'object') for(const id of ['week','route','winter']) { const n=saved.notes[id]; if(n && [n.x,n.y,n.z].every(Number.isFinite)) state.notes[id]={x:Math.max(0,Math.min(1,n.x)),y:Math.max(0,Math.min(1,n.y)),z:Math.max(5,Math.min(100,n.z))}; } } } catch {}
function save(){ try { localStorage.setItem(storageKey, JSON.stringify(state)); return true; } catch { toast('当前浏览器无法保存，仍可继续阅读。'); return false; } }
let toastTimer;
function toast(message){ const el=document.querySelector('.toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2600); }
const courses = [
 {id:'vision',name:'计算机视觉',en:'Computer vision',code:'CS231n',color:'blue',description:'计算机怎样看懂一张图片？从图像分类、损失函数到卷积神经网络，认识深度学习的基本过程。',goal:'图像分类、损失函数、梯度下降、反向传播与卷积神经网络。',url:'https://cs231n.stanford.edu/',label:'打开 CS231n 课程',crop:[330,260,288,535]},
 {id:'language',name:'大模型',en:'Language models',code:'CS336',color:'rose',description:'从文本如何变成数字开始，逐步理解 Transformer、语言模型训练与评估。',goal:'分词、文本表示、Transformer、语言模型训练与评估。',url:'https://cs336.stanford.edu/',label:'打开 CS336 课程',crop:[623,260,289,535]},
 {id:'robotics',name:'机器人学',en:'Introduction to robotics',code:'Princeton',color:'ochre',description:'机器人怎样找到路、保持平衡、判断自己在哪里？沿着规划、控制与状态估计逐步理解。',goal:'图搜索、采样规划、动力学、控制与状态估计。',url:'https://irom-lab.princeton.edu/intro-to-robotics/',label:'打开机器人学课程',crop:[916,260,296,535]},
 {id:'diffusion',name:'扩散模型',en:'Flow & diffusion',code:'MIT 6.S184',color:'navy',description:'如何从随机噪声中生成有结构的数据？先认识概率路径、flow matching 和逐步去噪。',goal:'概率路径、流匹配、随机微分方程与逐步去噪。',url:'https://diffusion.csail.mit.edu/2026/index.html',label:'打开扩散模型课程',crop:[1218,260,297,535]}
];
function slice(file,sourceW,x,y,w,h,extra='') { return `<span class="art-slice ${extra}" style="--sw:${sourceW};--cx:${x};--cy:${y};--cw:${w};--ch:${h}"><img src="assets/${file}.png?v=2" alt="" draggable="false"></span>`; }
function spine(course){ return slice('course-books',1536,...course.crop); }
const bookMessages = [
 ['让计算机看见','从一张图片，<br>认识一个世界。','图像分类、神经网络与卷积的第一步。'],
 ['读懂语言的线索','从一个词，<br>走进语言模型。','文本如何变成数字，模型如何学习语言。'],
 ['让想法开始行动','感知与行动，<br>在这里相遇。','沿着规划、控制与状态估计慢慢深入。'],
 ['从噪声中发现秩序','从点点噪声，<br>到清晰的图景。','认识逐步去噪，以及图像生成的过程。']
];
let bookPage=0, bookTurning=false, flipTween=null;
function bookSide(index,side){
 const c=courses[index],m=bookMessages[index];
 if(side==='left')return `<span class="notebook-left"><small>${m[0]}</small><span>${m[1]}</span></span>`;
 return `<div class="book-caption"><small>${c.code}</small><strong>${c.name}</strong><p class="book-summary">${m[2]}</p><a href="${'#course/'+c.id}">查看课程 <b aria-hidden="true">↗</b></a></div>`;
}
function learningBook(){return `<section class="open-book" aria-label="可翻页的学习导读书">${slice('reading-notebook',1536,12,100,1515,855)}<div data-book-left>${bookSide(bookPage,'left')}</div><div data-book-right>${bookSide(bookPage,'right')}</div><button class="book-turn book-turn-prev" data-book-turn="-1" aria-label="上一页" ${bookPage===0?'disabled':''}><span aria-hidden="true">‹</span></button><button class="book-turn book-turn-next" data-book-turn="1" aria-label="下一页" ${bookPage===courses.length-1?'disabled':''}><span aria-hidden="true">›</span></button><span class="book-pagination" role="status" aria-live="polite">${bookPage+1} / ${courses.length}</span><span class="book-turn-hint">轻点页角，翻一翻</span></section>`;}
function turnBook(direction,trigger){
 const restoreFocus=document.activeElement===trigger;
 const book=document.querySelector('.open-book'),previous=bookPage,next=previous+direction;
 if(!book||bookTurning||next<0||next>=courses.length)return;
 if(window.gsap){const art=book.querySelectorAll('.art-slice,.book-caption,.notebook-left');gsap.killTweensOf(art);gsap.set(art,{clearProps:'transform,opacity,visibility'});}
 bookTurning=true;bookPage=next;book.classList.add('is-turning');
 book.querySelectorAll('[data-book-turn]').forEach(b=>b.disabled=true);
 const finish=()=>{
  if(!book.isConnected)return;
  book.querySelector('[data-book-left]').innerHTML=bookSide(next,'left');
  book.querySelector('[data-book-right]').innerHTML=bookSide(next,'right');
  book.querySelector('.flip-leaf')?.remove();book.classList.remove('is-turning');
  book.querySelector('[data-book-turn="-1"]').disabled=next===0;
  book.querySelector('[data-book-turn="1"]').disabled=next===courses.length-1;
  book.querySelector('.book-pagination').textContent=`${next+1} / ${courses.length}`;
  bookTurning=false;flipTween=null;
  if(restoreFocus&&(document.activeElement===document.body||document.activeElement===trigger)){const focusTarget=trigger.disabled?book.querySelector(`[data-book-turn="${-direction}"]`):trigger;focusTarget?.focus({preventScroll:true});}
 };
 if(!window.gsap||matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
 const forward=direction>0,curl=window.studyPaperCurl?.create(book,{forward,frontMarkup:bookSide(previous,forward?'right':'left'),backMarkup:bookSide(next,forward?'left':'right')});
 if(!curl){finish();return;}
 book.querySelector(forward?'[data-book-right]':'[data-book-left]').innerHTML=bookSide(next,forward?'right':'left');
 book.append(curl.element);curl.draw(0);
 const progress={value:0};
 flipTween=gsap.to(progress,{value:1,duration:1.45,ease:'sine.inOut',onUpdate:()=>curl.draw(progress.value),onComplete:finish});
}
function home(){
return `<section class="home-scene ${state.motionPaused?'is-still':''}" aria-labelledby="home-title">
 <div class="intro reading-window">
  <div class="window-art" aria-hidden="true"><div class="window-sky"><img class="garden-view" src="assets/garden-view.png" alt="" draggable="false"><svg class="tree-shadow" viewBox="0 0 300 200"><path d="M305 210 Q242 122 223 20 M259 148 Q199 142 168 98 M238 83 Q274 58 285 8"/><g><ellipse cx="222" cy="31" rx="11" ry="24" transform="rotate(-30 222 31)"/><ellipse cx="242" cy="66" rx="12" ry="27" transform="rotate(40 242 66)"/><ellipse cx="269" cy="37" rx="12" ry="24" transform="rotate(35 269 37)"/><ellipse cx="216" cy="119" rx="12" ry="24" transform="rotate(-60 216 119)"/><ellipse cx="184" cy="106" rx="10" ry="21" transform="rotate(-55 184 106)"/><ellipse cx="272" cy="165" rx="13" ry="25" transform="rotate(35 272 165)"/></g></svg></div><img class="window-frame" src="assets/reading-window-flat.png" alt="" draggable="false"><span class="curtain curtain-left"><img src="assets/sage-curtain.png" alt="" draggable="false"></span><span class="curtain curtain-right"><img src="assets/sage-curtain.png" alt="" draggable="false"></span></div>
  <button class="window-bird" data-motion-toggle aria-label="暂停页面动效" aria-pressed="${state.motionPaused}" data-tip="${state.motionPaused?'恢复动效':'暂停动效'}"><span class="bird-shape"><img src="assets/window-bird.png" alt="" draggable="false"><i></i></span></button><div class="window-copy"><p class="eyebrow">A little room for learning</p><h1 id="home-title">我的学习书房</h1><p class="intro-copy">书翻到哪一页，就从哪一页开始。</p></div>
  <a class="phase-note" href="#library"><span class="tiny-dot"></span>四门课程 · 随时开始 <span aria-hidden="true">↗</span></a>
 </div>
 <div class="scene-object mug" aria-hidden="true">${slice('study-objects',1254,110,15,465,570)}<svg class="steam-trails" viewBox="0 0 100 100"><path d="M35 92 C19 71 54 57 35 34 S40 9 42 3"/><path d="M55 95 C77 73 40 57 57 33 S58 10 55 2"/><path d="M73 97 C55 79 86 65 72 44 S78 18 79 6"/></svg><span class="music-note note-one">♪</span><span class="music-note note-two">♫</span><span class="music-note note-three">♩</span></div>
 <div class="scene-object glasses" aria-hidden="true">${slice('study-objects',1254,640,115,600,405)}</div>
 <button class="scene-object lamp" data-lamp aria-label="切换书房暖光" aria-pressed="${state.lamp}"><span class="lamp-facing">${slice('study-objects',1254,90,640,475,595)}</span><span class="lamp-caption">${state.lamp?'关掉暖光':'点亮书房'} <span aria-hidden="true">✧</span></span></button>
 ${learningBook()}
 <div class="course-shelf"><p class="shelf-title">选一本，慢慢读 <span aria-hidden="true">↘</span></p><div class="shelf-books">${courses.map(c=>`<a href="#course/${c.id}" class="spine ${c.color}" data-course="${c.id}" aria-label="打开${c.name}导读">${spine(c)}</a>`).join('')}</div><div class="wood-shelf"></div><a class="shelf-link" href="#library">查看全部课程 <span aria-hidden="true">→</span></a></div>
 <div class="notes-caption">随手记下，慢慢完成 <button data-reset-notes>整理便利贴 ↺</button></div>
 ${[{id:'week',label:'课程入口',title:'计算机视觉',text:'CS231n · 从图像走进深度学习。',href:'#course/vision',link:'查看课程'}, {id:'route',label:'随时打开',title:'大模型与扩散',text:'语言模型与图像生成，按兴趣探索。',href:'#library',link:'浏览课程'}, {id:'winter',label:'动手探索',title:'机器人学',text:'感知、规划与控制的基础知识。',href:'#course/robotics',link:'查看课程'}].map(n=>`<article class="sticky-note note-${n.id}" data-note="${n.id}"><button class="note-handle" aria-label="移动${n.title}便利贴；也可使用方向键"><span aria-hidden="true">⋮⋮</span>${n.label}</button><h2>${n.title}</h2><p>${n.text}</p><a href="${n.href}">${n.link} ↗</a></article>`).join('')}


 <div class="scene-bottom"><a href="#library" class="home-progress">浏览四门课程 →</a></div>
 </section>`;
}
function library(){return `<section class="library-view page-wrap"><div class="page-heading"><p class="eyebrow">The reading shelf</p><h1>课程藏书</h1><p>计算机视觉、大模型、机器人学与扩散模型，选择一门开始学习。</p></div><div class="course-grid">${courses.map((c,i)=>`<a class="course-card ${c.color}" href="#course/${c.id}"><div class="course-art">${spine(c)}</div><div><span class="course-code">${String(i+1).padStart(2,'0')} / ${c.code}</span><h2>${c.name}</h2><p>${c.description}</p><span class="plain-link">翻开导读 <span aria-hidden="true">↗</span></span></div></a>`).join('')}</div></section>`;}
function course(id){const c=courses.find(c=>c.id===id);if(!c)return library();return `<section class="course-view page-wrap"><a class="back" href="#library">← 回到课程藏书</a><div class="course-detail"><div class="course-portrait ${c.color}">${spine(c)}<span>${c.code}</span></div><div class="course-copy"><p class="eyebrow">${c.en}</p><h1>${c.name}</h1><p class="detail-lead">${c.description}</p><h2>课程内容</h2><p>${c.goal}</p><div class="callout">打开官方课程网站，查看课程提供的讲义、视频及学习资料。</div><div class="button-row"><a class="button primary" href="${c.url}" target="_blank" rel="noopener noreferrer">${c.label} <span>↗</span></a></div></div></div></section>`;}
function render(){if(flipTween){flipTween.kill();flipTween=null;}bookTurning=false;hideCourseTip();if(motionContext){motionContext.revert();motionContext=null;}const [requested,id]=(location.hash.slice(1)||'home').split('/');const page=['home','library','course'].includes(requested)?requested:'library';main.innerHTML=page==='library'?library():page==='course'?course(id):home();document.body.dataset.page=page;document.title=(page==='library'?'课程藏书':page==='course'?(courses.find(c=>c.id===id)?.name||'课程藏书'):'首页')+' · mystudyroom';document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});window.scrollTo(0,0);document.body.classList.toggle('warm-room',state.lamp);initMotion(page);layoutNotes();}
document.addEventListener('click',e=>{const pageTurn=e.target.closest('[data-book-turn]');if(pageTurn){turnBook(Number(pageTurn.dataset.bookTurn),pageTurn);return;}if(e.target.closest('[data-reset-notes]')){state.notes={};layoutNotes();save();return;}const motion=e.target.closest('[data-motion-toggle]');if(motion){state.motionPaused=!state.motionPaused;save();document.querySelector('.home-scene')?.classList.toggle('is-still',state.motionPaused);motion.setAttribute('aria-pressed',String(state.motionPaused));motion.dataset.tip=state.motionPaused?'恢复动效':'暂停动效';return;}const lamp=e.target.closest('[data-lamp]');if(lamp){state.lamp=!state.lamp;save();document.body.classList.toggle('warm-room',state.lamp);lamp.setAttribute('aria-pressed',String(state.lamp));lamp.querySelector('.lamp-caption').innerHTML=(state.lamp?'关掉暖光':'点亮书房')+' <span aria-hidden="true">✧</span>';if(window.gsap&&!matchMedia('(prefers-reduced-motion: reduce)').matches)gsap.fromTo(lamp.querySelector('.art-slice'),{rotation:-2},{rotation:0,duration:.45,ease:'power2.out',overwrite:true});return;}});
let motionContext = null;
let homeArrived = false;
function initMotion(page){
 if(!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 motionContext = gsap.context(()=>{
  if(page==='home' && !homeArrived){
   homeArrived=true;
   const tl=gsap.timeline({defaults:{ease:'power2.out',duration:.65}});
   tl.from('.mug > .art-slice,.glasses > .art-slice,.lamp-facing > .art-slice',{y:14,opacity:0,stagger:.08,clearProps:'transform,opacity'},.12)
     .from('.spine > .art-slice',{y:30,opacity:0,rotation:-4,stagger:.075,duration:.45,clearProps:'transform,opacity'},.3)
     .from('.book-caption,.notebook-left',{opacity:0,duration:.35,clearProps:'opacity'},.45);
  
  }
 },main);
}
// Book names live beside the pointer, never on top of the illustrated covers.
const courseTip=document.createElement('div');
courseTip.id='course-tooltip';courseTip.className='course-tooltip';courseTip.role='tooltip';courseTip.hidden=true;document.body.append(courseTip);
let activeBook=null;
function hideCourseTip(){if(activeBook)activeBook.removeAttribute('aria-describedby');activeBook=null;courseTip.hidden=true;}
function placeCourseTip(x,y){const w=courseTip.offsetWidth,h=courseTip.offsetHeight;courseTip.style.left=Math.max(10,Math.min(innerWidth-w-10,x+18))+'px';courseTip.style.top=(y+h+30>innerHeight?Math.max(10,y-h-14):y+22)+'px';}
function showCourseTip(book,x,y){const c=courses.find(c=>c.id===book.dataset.course);if(!c)return;activeBook?.removeAttribute('aria-describedby');activeBook=book;courseTip.innerHTML=`<small>${c.code}</small><strong>${c.name}</strong><span>翻开课程导读 ↗</span>`;courseTip.hidden=false;book.setAttribute('aria-describedby',courseTip.id);placeCourseTip(x,y);}
document.addEventListener('pointerover',e=>{const book=e.target.closest('[data-course]');if(book&&e.pointerType!=='touch')showCourseTip(book,e.clientX,e.clientY);});
document.addEventListener('pointermove',e=>{if(activeBook&&e.pointerType!=='touch')placeCourseTip(e.clientX,e.clientY);});
document.addEventListener('pointerout',e=>{if(activeBook&&activeBook.contains(e.target)&&!activeBook.contains(e.relatedTarget))hideCourseTip();});
document.addEventListener('focusin',e=>{const book=e.target.closest('[data-course]');if(book){const r=book.getBoundingClientRect();showCourseTip(book,r.left,r.bottom);}});
document.addEventListener('focusout',e=>{if(e.target.closest('[data-course]'))hideCourseTip();});
window.addEventListener('blur',hideCourseTip);
document.addEventListener('keydown',e=>{if(e.key==='Escape')hideCourseTip();});

// Positions use scene-relative coordinates so notes stay reachable after resizing.
function defaultNote(id){const i=['week','route','winter'].indexOf(id);return innerWidth<=760?{x:[.07,.34,.59][i],y:[.71,.75,.70][i],z:5+i}:{x:[.53,.68,.83][i],y:[.72,.74,.71][i],z:5+i};}
function putNote(el,x,y){const scene=el.closest('.home-scene');const px=Math.max(0,Math.min(scene.clientWidth-el.offsetWidth,x*scene.clientWidth));const py=Math.max(0,Math.min(scene.clientHeight-el.offsetHeight,y*scene.clientHeight));el.style.left=px+'px';el.style.top=py+'px';return {x:px/scene.clientWidth,y:py/scene.clientHeight};}
function layoutNotes(){document.querySelectorAll('[data-note]').forEach(el=>{const n=state.notes[el.dataset.note]||defaultNote(el.dataset.note);putNote(el,n.x,n.y);el.style.zIndex=n.z;});}
function raiseNote(el){const notes=[...document.querySelectorAll('[data-note]')].sort((a,b)=>Number(a.style.zIndex)-Number(b.style.zIndex));notes.filter(n=>n!==el).concat(el).forEach((n,i)=>{n.style.zIndex=5+i;const pos=state.notes[n.dataset.note]||defaultNote(n.dataset.note);state.notes[n.dataset.note]={...pos,z:5+i};});}
let dragging=null;
document.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-note]');if(!el||e.target.closest('a')||e.button!==0)return;hideCourseTip();raiseNote(el);const r=el.getBoundingClientRect();dragging={el,id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top};el.classList.add('is-dragging');el.setPointerCapture(e.pointerId);e.preventDefault();});
document.addEventListener('pointermove',e=>{if(!dragging||e.pointerId!==dragging.id)return;const {el,dx,dy}=dragging;const scene=el.closest('.home-scene');const r=scene.getBoundingClientRect();const pos=putNote(el,(e.clientX-r.left-dx)/scene.clientWidth,(e.clientY-r.top-dy)/scene.clientHeight);state.notes[el.dataset.note]={...pos,z:Number(el.style.zIndex)};});
function finishNote(e){if(!dragging||e.pointerId!==dragging.id)return;const {el,id}=dragging;dragging=null;el.classList.remove('is-dragging');if(el.hasPointerCapture(id))el.releasePointerCapture(id);save();}
document.addEventListener('pointerup',finishNote);document.addEventListener('pointercancel',finishNote);
document.addEventListener('keydown',e=>{const handle=e.target.closest('.note-handle');if(!handle||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const el=handle.closest('[data-note]'),scene=el.closest('.home-scene'),step=e.shiftKey?30:10;raiseNote(el);const pos=putNote(el,(el.offsetLeft+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0))/scene.clientWidth,(el.offsetTop+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0))/scene.clientHeight);state.notes[el.dataset.note]={...pos,z:Number(el.style.zIndex)};save();});
window.addEventListener('resize',()=>{hideCourseTip();layoutNotes();});
window.addEventListener('hashchange',render);render();
