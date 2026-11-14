const main = document.querySelector('main');
const storageKey = 'mystudyroom-v1';
let state = { done: [], size: 18, lamp: false, motionPaused: false, notes: {} };
try { const saved = JSON.parse(localStorage.getItem(storageKey)); if(saved && typeof saved==='object') { state.done = Array.isArray(saved.done) ? saved.done.filter(x => typeof x==='string') : []; state.size = [17,18,20].includes(saved.size) ? saved.size : 18; state.lamp = saved.lamp === true; state.motionPaused = saved.motionPaused === true; if(saved.notes && typeof saved.notes === 'object') for(const id of ['week','route','winter']) { const n=saved.notes[id]; if(n && [n.x,n.y,n.z].every(Number.isFinite)) state.notes[id]={x:Math.max(0,Math.min(1,n.x)),y:Math.max(0,Math.min(1,n.y)),z:Math.max(5,Math.min(100,n.z))}; } } } catch {}
function save(){ try { localStorage.setItem(storageKey, JSON.stringify(state)); return true; } catch { toast('当前浏览器无法保存，仍可继续阅读。'); return false; } }
let toastTimer;
function toast(message){ const el=document.querySelector('.toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2600); }
const courses = [
 {id:'python',name:'基础入门',en:'First things first',code:'起步',color:'sage',description:'从认识 Python 开始，把编程、数学和深度学习的基础慢慢补齐。',goal:'能读懂简单代码，理解变量、循环、函数，以及向量与矩阵。',url:'https://cs231n.github.io/python-numpy-tutorial/',label:'Python / NumPy 官方课程教程',crop:[25,260,295,535]},
 {id:'vision',name:'计算机视觉',en:'Computer vision',code:'CS231n',color:'blue',description:'计算机怎样看懂一张图片？从图像分类、损失函数到卷积神经网络，认识深度学习的基本过程。',goal:'先掌握分类、梯度下降、反向传播和 CNN；基础熟悉后再进入作业。',url:'https://cs231n.stanford.edu/',label:'打开 CS231n 课程',crop:[330,260,288,535]},
 {id:'language',name:'大模型',en:'Language models',code:'CS336',color:'rose',description:'从文本如何变成数字开始，逐步理解 Transformer、语言模型训练与评估。',goal:'熟悉 Python、PyTorch 与深度学习后，再进入 tokenizer 和模型基础。',url:'https://cs336.stanford.edu/',label:'打开 CS336 课程',crop:[623,260,289,535]},
 {id:'robotics',name:'机器人学',en:'Introduction to robotics',code:'Princeton',color:'ochre',description:'机器人怎样找到路、保持平衡、判断自己在哪里？沿着规划、控制与状态估计逐步理解。',goal:'先学习图搜索和 RRT，再接触动力学、控制与滤波。第一轮以阅读为主。',url:'https://irom-lab.princeton.edu/intro-to-robotics/',label:'打开机器人学课程',crop:[916,260,296,535]},
 {id:'diffusion',name:'扩散模型',en:'Flow & diffusion',code:'MIT 6.S184',color:'navy',description:'如何从随机噪声中生成有结构的数据？先认识概率路径、flow matching 和逐步去噪。',goal:'有概率、微积分和深度学习基础后，从课程讲义与第一讲开始。',url:'https://diffusion.csail.mit.edu/2026/index.html',label:'打开扩散模型课程',crop:[1218,260,297,535]}
];
const weeks = [
 ['认识 Python','程序、输入与输出，读懂第一行代码。'],['变量与数据','认识数字、字符串，以及给数据取名字。'],['列表与循环','把一组数据放在一起，让程序重复做事。'],['条件与函数','判断什么时候做，以及如何复用一段代码。'],['回顾与报错','重新读懂前面的例子，学习看报错。'],['NumPy 数组','认识数组的维度、形状与基本运算。'],['向量与矩阵','从一组数字开始理解机器学习的数据表达。'],['整理与衔接','回顾八周内容，准备寒假的集中学习。']
];
function slice(file,sourceW,x,y,w,h,extra='') { return `<span class="art-slice ${extra}" style="--sw:${sourceW};--cx:${x};--cy:${y};--cw:${w};--ch:${h}"><img src="assets/${file}.png?v=2" alt="" draggable="false"></span>`; }
function spine(course){ return slice('course-books',1536,...course.crop); }
const bookMessages = [
 ['从这里开始','每一页，<br>都是新的开始。','程序、输入与输出，读懂第一行代码。'],
 ['让计算机看见','从一张图片，<br>认识一个世界。','图像分类、神经网络与卷积的第一步。'],
 ['读懂语言的线索','从一个词，<br>走进语言模型。','文本如何变成数字，模型如何学习语言。'],
 ['让想法开始行动','感知与行动，<br>在这里相遇。','沿着规划、控制与状态估计慢慢深入。'],
 ['从噪声中发现秩序','从点点噪声，<br>到清晰的图景。','认识逐步去噪，以及图像生成的过程。']
];
let bookPage=0, bookTurning=false, flipTween=null;
function bookSide(index,side){
 const c=courses[index],m=bookMessages[index];
 if(side==='left')return `<span class="notebook-left"><small>${m[0]}</small><span>${m[1]}</span></span>`;
 return `<div class="book-caption"><small>${index===0?'本周第一节':c.code}</small><strong>${index===0?'认识 Python':c.name}</strong><p class="book-summary">${m[2]}</p><a href="${index===0?'#read/python':'#course/'+c.id}">${index===0?'开始阅读':'翻开导读'} <b aria-hidden="true">↗</b></a></div>`;
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
  <div class="window-copy"><p class="eyebrow">A little room for learning</p><h1 id="home-title">我的学习书房</h1><p class="intro-copy">书翻到哪一页，就从哪一页开始。</p></div>
  <a class="phase-note" href="#roadmap"><span class="tiny-dot"></span>放假前 · 每周一小时 <span aria-hidden="true">↗</span></a>
 </div>
 <div class="scene-object mug" aria-hidden="true">${slice('study-objects',1254,110,15,465,570)}<svg class="steam-trails" viewBox="0 0 100 100"><path d="M35 92 C19 71 54 57 35 34 S40 9 42 3"/><path d="M55 95 C77 73 40 57 57 33 S58 10 55 2"/><path d="M73 97 C55 79 86 65 72 44 S78 18 79 6"/></svg><span class="music-note note-one">♪</span><span class="music-note note-two">♫</span><span class="music-note note-three">♩</span></div>
 <div class="scene-object glasses" aria-hidden="true">${slice('study-objects',1254,640,115,600,405)}</div>
 <button class="scene-object lamp" data-lamp aria-label="切换书房暖光" aria-pressed="${state.lamp}">${slice('study-objects',1254,90,640,475,595)}<span class="lamp-caption">${state.lamp?'关掉暖光':'点亮书房'} <span aria-hidden="true">✧</span></span></button>
 ${learningBook()}
 <div class="course-shelf"><p class="shelf-title">选一本，慢慢读 <span aria-hidden="true">↘</span></p><div class="shelf-books">${courses.map(c=>`<a href="#course/${c.id}" class="spine ${c.color}" data-course="${c.id}" aria-label="打开${c.name}导读">${spine(c)}</a>`).join('')}</div><div class="wood-shelf"></div><a class="shelf-link" href="#library">查看全部课程 <span aria-hidden="true">→</span></a></div>
 <div class="notes-caption">随手记下，慢慢完成 <button data-reset-notes>整理便利贴 ↺</button></div>
 ${[{id:'week',label:'这一周',title:'认识 Python',text:'一小时，读懂第一行代码。',href:'#read/python',link:'打开这一页'}, {id:'route',label:'慢慢起步',title:'八周学习路线',text:'给基础留一点时间。',href:'#roadmap',link:'看看下一步'}, {id:'winter',label:'01.18 · 寒假',title:'下一段旅程',text:'每天六小时，从编程与数学开始。',href:'#roadmap',link:'查看学习计划'}].map(n=>`<article class="sticky-note note-${n.id}" data-note="${n.id}"><button class="note-handle" aria-label="移动${n.title}便利贴；也可使用方向键"><span aria-hidden="true">⋮⋮</span>${n.label}</button><h2>${n.title}</h2><p>${n.text}</p><a href="${n.href}">${n.link} ↗</a></article>`).join('')}

 <button class="scene-motion-control" data-motion-toggle aria-pressed="${state.motionPaused}">${state.motionPaused?'让微风继续 ▷':'让书房静下来 Ⅱ'}</button>
 <div class="scene-bottom"><span class="chapter-label">Chapter 01 <i>·</i> 轻量准备</span><a href="#roadmap" class="home-progress"><span>${state.done.length} / 8 周阅读</span><span class="progress-track"><i style="width:${Math.min(state.done.length/8,1)*100}%"></i></span></a></div>
 </section>`;
}
function library(){return `<section class="library-view page-wrap"><div class="page-heading"><p class="eyebrow">The reading shelf</p><h1>课程藏书</h1><p>先读基础，再沿着自己的方向深入。</p></div><div class="course-grid">${courses.map((c,i)=>`<a class="course-card ${c.color}" href="#course/${c.id}"><div class="course-art">${spine(c)}</div><div><span class="course-code">${String(i+1).padStart(2,'0')} / ${c.code}</span><h2>${c.name}</h2><p>${c.description}</p><span class="plain-link">翻开导读 <span aria-hidden="true">↗</span></span></div></a>`).join('')}</div></section>`;}
function course(id){const c=courses.find(c=>c.id===id);if(!c)return library();return `<section class="course-view page-wrap"><a class="back" href="#library">← 回到课程藏书</a><div class="course-detail"><div class="course-portrait ${c.color}">${spine(c)}<span>${c.code}</span></div><div class="course-copy"><p class="eyebrow">${c.en}</p><h1>${c.name}</h1><p class="detail-lead">${c.description}</p><h2>第一轮，读到这里</h2><p>${c.goal}</p><div class="callout">${id==='python'?'现在就可以开始，每周留出一小时。':'先把基础读扎实，课程按自己的进度推进。'}</div><div class="button-row">${id==='python'?'<a class="button primary" href="#read/python">阅读第一节 <span>→</span></a>':''}<a class="button secondary" href="${c.url}" target="_blank" rel="noopener noreferrer">${c.label} <span>↗</span></a></div></div></div></section>`;}
function roadmap(){return `<section class="roadmap page-wrap"><div class="page-heading"><p class="eyebrow">One hour, one small step</p><h1>八周，慢慢起步</h1><p>2026.11.14 — 2027.01.08 · 每周约一小时</p></div><div class="roadmap-intro"><span class="number-serif">01—08</span><p>放假前只做一点点准备。<br>漏掉一周也没关系，从上次的位置继续。</p></div><ol class="week-list">${weeks.map((w,i)=>`<li><span class="week-number">${String(i+1).padStart(2,'0')}</span><div><h2>${w[0]}</h2><p>${w[1]}</p></div><span class="week-status">${i===0?(state.done.includes('python-1')?'已读完':'可以开始'):'后续阅读'}</span>${i===0?'<a class="week-go" href="#read/python" aria-label="阅读第一周认识 Python">↗</a>':''}</li>`).join('')}</ol><div class="winter-note"><p class="eyebrow">The next chapter</p><h2>1 月 18 日，开始集中学习</h2><p>Python 与数学基础 → CS231n 与 PyTorch → 机器人规划 → Transformer → 扩散模型。寒假路线随掌握程度调整。</p></div></section>`;}
function reader(){const done=state.done.includes('python-1');return `<div class="reader-layout"><aside class="reader-sidebar"><a class="back" href="#home">← 回到书房</a><p class="sidebar-heading">基础入门</p><span class="sidebar-meta">第一周 · 认识 Python</span><nav aria-label="本节目录"><a href="#what" data-anchor="what" class="selected"><span>01</span> 程序是什么</a><a href="#python" data-anchor="python"><span>02</span> 认识 Python</a><a href="#first-line" data-anchor="first-line"><span>03</span> 第一行代码</a><a href="#remember" data-anchor="remember"><span>04</span> 留下一个印象</a></nav><a class="sidebar-route" href="#roadmap">查看八周路线 ↗</a></aside><section class="reading-paper" aria-labelledby="lesson-title"><div class="paper-top"><span>First things first / 001</span><div class="font-tools" aria-label="正文字号">${[17,18,20].map((s,i)=>`<button data-size="${s}" aria-label="${['小','中','大'][i]}字号" aria-pressed="${state.size===s}">${['小','中','大'][i]}</button>`).join('')}</div></div><header class="lesson-header"><p class="eyebrow">第一周 · 入门阅读</p><h1 id="lesson-title">与 Python 初次见面</h1><p>这一节，先认识程序，再读懂一行代码。</p><div class="lesson-meta"><span>约 8 分钟阅读</span><span>零基础</span><span>无需安装软件</span></div></header><article style="--reading-size:${state.size}px"><section id="what"><h2><span>01</span> 程序是什么？</h2><p>想象你要告诉一个人怎样泡茶：先烧水，再把茶叶放进杯子，最后倒水。你把一件事拆成了有顺序的步骤。</p><p>程序也在表达步骤，只是执行它的是计算机。计算机不会自动理解“帮我整理一下”这种含糊的要求，需要我们把操作写得明确。</p><aside class="reading-note"><span>记在页边</span><p>编程的起点，是把你想做的事说清楚。</p></aside></section><section id="python"><h2><span>02</span> 认识 Python</h2><p>Python 是一种编程语言。它用一套约定好的写法，让人把操作交给计算机执行。你接下来学习的计算机视觉、大模型和机器人课程，都会用到它。</p><p>先不用记住很多术语。今天只要分清：<strong>代码是写下的指令，运行是让计算机执行这些指令。</strong></p></section><section id="first-line"><h2><span>03</span> 读懂第一行代码</h2><p>看这一行：</p><div class="code-block"><div><span>Python</span><span>阅读示例</span></div><pre><code><span class="code-fn">print</span>(<span class="code-string">"你好，书房"</span>)</code></pre><div class="code-result"><span>运行后显示</span><code>你好，书房</code></div></div><p><code>print</code> 会把括号里的内容显示出来；引号告诉 Python，这里面是一段文字。引号本身不会显示在结果里。</p><p>如果把引号里的文字换成你的名字，运行后就会显示你的名字。此刻只需读懂它，不必安装任何软件。</p></section><section id="remember"><h2><span>04</span> 留下一个印象</h2><p>合上这一页前，试着用自己的话说说：代码和运行有什么区别？上面这行代码，会让计算机做什么？</p><p>能说清楚就够了。下一次，我们从“给数据取一个名字”开始认识变量。</p><a class="source-link" href="https://docs.python.org/zh-cn/3/tutorial/introduction.html" target="_blank" rel="noopener noreferrer">想多读一点：Python 官方中文教程 ↗</a></section></article><div class="lesson-finish"><div><span class="eyebrow">今日的一小步</span><p>读懂一行代码，也是开始。</p></div><button class="button primary" data-complete aria-pressed="${done}">${done?'已读完 ✓':'标记读完 ✓'}</button></div><a class="next-reading" href="#roadmap"><span>接下来 · 变量与数据</span><span>回到学习路线 →</span></a><div class="page-number">— 01 —</div></section></div>`;}
function render(){if(flipTween){flipTween.kill();flipTween=null;}bookTurning=false;hideCourseTip();if(motionContext){motionContext.revert();motionContext=null;}const hash=location.hash.slice(1)||'home';const [page,id]=hash.split('/');if(['what','python','first-line','remember'].includes(page))return; main.innerHTML=page==='read'?reader():page==='roadmap'?roadmap():page==='library'?library():page==='course'?course(id):home();document.body.dataset.page=page;document.title=(page==='read'?'与 Python 初次见面':page==='roadmap'?'八周学习路线':page==='library'?'课程藏书':'首页')+' · mystudyroom';document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});window.scrollTo(0,0);document.body.classList.toggle('warm-room',state.lamp);initMotion(page); layoutNotes();}
document.addEventListener('click',e=>{const pageTurn=e.target.closest('[data-book-turn]');if(pageTurn){turnBook(Number(pageTurn.dataset.bookTurn),pageTurn);return;}if(e.target.closest('[data-reset-notes]')){state.notes={};layoutNotes();save();return;}const motion=e.target.closest('[data-motion-toggle]');if(motion){state.motionPaused=!state.motionPaused;save();document.querySelector('.home-scene')?.classList.toggle('is-still',state.motionPaused);motion.setAttribute('aria-pressed',String(state.motionPaused));motion.textContent=state.motionPaused?'让微风继续 ▷':'让书房静下来 Ⅱ';return;}const lamp=e.target.closest('[data-lamp]');if(lamp){state.lamp=!state.lamp;save();document.body.classList.toggle('warm-room',state.lamp);lamp.setAttribute('aria-pressed',String(state.lamp));lamp.querySelector('.lamp-caption').innerHTML=(state.lamp?'关掉暖光':'点亮书房')+' <span aria-hidden="true">✧</span>';if(window.gsap&&!matchMedia('(prefers-reduced-motion: reduce)').matches)gsap.fromTo(lamp.querySelector('.art-slice'),{rotation:-2},{rotation:0,duration:.45,ease:'power2.out',overwrite:true});return;}const anchor=e.target.closest('[data-anchor]');if(anchor){e.preventDefault();document.getElementById(anchor.dataset.anchor)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});return;}const sizing=e.target.closest('[data-size]');if(sizing){state.size=Number(sizing.dataset.size);save();document.querySelector('article').style.setProperty('--reading-size',state.size+'px');document.querySelectorAll('[data-size]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.size)===state.size)));return;}const complete=e.target.closest('[data-complete]');if(complete){const done=state.done.includes('python-1');state.done=done?state.done.filter(x=>x!=='python-1'):[...state.done,'python-1'];const saved=save();complete.textContent=done?'标记读完 ✓':'已读完 ✓';complete.setAttribute('aria-pressed',String(!done));if(saved)toast(done?'已取消读完标记':'这一页读完了，下次接着读。');}});
let motionContext = null;
let homeArrived = false;
function initMotion(page){
 if(!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 motionContext = gsap.context(()=>{
  if(page==='home' && !homeArrived){
   homeArrived=true;
   const tl=gsap.timeline({defaults:{ease:'power2.out',duration:.65}});
   tl.from('.open-book > .art-slice',{y:18,scale:.97,rotationX:8,transformOrigin:'center bottom',clearProps:'transform'},0)
     .from('.mug > .art-slice,.glasses > .art-slice,.lamp > .art-slice',{y:14,opacity:0,stagger:.08,clearProps:'transform,opacity'},.12)
     .from('.spine > .art-slice',{y:30,opacity:0,rotation:-4,stagger:.075,duration:.45,clearProps:'transform,opacity'},.3)
     .from('.book-caption,.notebook-left',{opacity:0,duration:.35,clearProps:'opacity'},.45);
  }else if(page==='read'){
   gsap.from('.reading-paper',{y:12,rotationY:-3,transformOrigin:'left center',duration:.5,clearProps:'transform'});
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
