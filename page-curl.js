/* Paint the original illustrated sheet onto a moving cylindrical fold. */
(() => {
 // Raw illustration coordinates trace only the top paper face, excluding the cover,
 // stacked page edges, gold binding and the ribbon below the spine.
 const outlines={right:'M756 184 C850 109 1080 118 1347 149 Q1358 151 1364 178 L1440 726 Q1442 745 1415 744 C1160 740 870 700 756 775 Z',left:'M756 184 C650 109 360 112 169 137 Q154 140 148 171 L64 720 Q61 739 110 740 C340 742 617 681 756 775 Z'};
 function nodeText(node){return [...node.childNodes].map(n=>n.nodeType===3?n.textContent:n.nodeName==='BR'?'\n':nodeText(n)).join('');}
 function linesFor(ctx,text,width){const lines=[];for(const paragraph of text.split('\n')){let line='';for(const char of paragraph){if(line&&ctx.measureText(line+char).width>width){lines.push(line);line=char;}else line+=char;}lines.push(line);}return lines;}
 function texture(book,side,markup,image,w,h){
  const ratio=2,canvas=document.createElement('canvas');canvas.width=Math.ceil(w*ratio);canvas.height=Math.ceil(h*ratio);
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  const fraction=side==='right'?.5:.05,sourceX=12+1515*fraction,scaleX=w/(1515*.45),scaleY=h/(855*.86);
  ctx.setTransform(ratio*scaleX,0,0,ratio*scaleY,-sourceX*ratio*scaleX,-100*ratio*scaleY);ctx.clip(new Path2D(outlines[side]));ctx.setTransform(ratio,0,0,ratio,0,0);
  ctx.drawImage(image,12+1515*fraction,100,1515*.45,855*.86,0,0,w,h);
  const probe=document.createElement('div');probe.style.cssText='position:absolute;inset:0;visibility:hidden;pointer-events:none';probe.setAttribute('aria-hidden','true');probe.setAttribute('inert','');probe.innerHTML=markup;book.append(probe);
  const parent=probe.firstElementChild,cx=parent.offsetWidth/2,cy=parent.offsetHeight/2;
  ctx.save();ctx.translate(parent.offsetLeft-book.clientWidth*fraction+cx,parent.offsetTop+cy);ctx.rotate(3*Math.PI/180);
  for(const child of parent.children){
   const style=getComputedStyle(child);if(style.display==='none')continue;
   const size=parseFloat(style.fontSize),padding=parseFloat(style.paddingTop)||0;
   const lineHeight=parseFloat(style.lineHeight)||size*1.2;
   ctx.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;ctx.fillStyle=style.color;ctx.textAlign='center';ctx.textBaseline='alphabetic';
   if('letterSpacing' in ctx)ctx.letterSpacing=style.letterSpacing;
   const lines=child.tagName==='P'?linesFor(ctx,nodeText(child),child.clientWidth||parent.clientWidth):nodeText(child).split('\n');
   lines.forEach((line,i)=>ctx.fillText(line,0,child.offsetTop+padding+(lineHeight-size)/2+size*.82+i*lineHeight-cy));
  }
  ctx.restore();probe.remove();
  const shades=[canvas];
  for(const alpha of [.04,.08,.12]){const shaded=document.createElement('canvas');shaded.width=canvas.width;shaded.height=canvas.height;const paint=shaded.getContext('2d');paint.drawImage(canvas,0,0);paint.globalCompositeOperation='source-atop';paint.fillStyle=`rgba(55,40,22,${alpha})`;paint.fillRect(0,0,shaded.width,shaded.height);shades.push(shaded);}
  return shades;
 }
 function create(book,{forward,frontMarkup,backMarkup}){
  const image=book.querySelector('.art-slice img');if(!image?.complete||!image.naturalWidth)return null;
  const bw=book.clientWidth,bh=book.clientHeight,w=bw*.45,h=bh*.86;
  const front=texture(book,forward?'right':'left',frontMarkup,image,w,h),back=texture(book,forward?'left':'right',backMarkup,image,w,h);
  if(!front||!back)return null;
  const canvas=document.createElement('canvas');canvas.className='flip-leaf paper-curl-canvas';canvas.setAttribute('aria-hidden','true');canvas.setAttribute('inert','');
  const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.ceil(bw*ratio);canvas.height=Math.ceil(bh*ratio);const ctx=canvas.getContext('2d');if(!ctx)return null;
  const sign=forward?1:-1,count=112,step=w/count,lens=Math.max(700,bw*1.6);
  function draw(t){
   ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,bw,bh);
   const radius=Math.max(.001,w*.145*Math.sin(Math.PI*t)),boundary=(1-t)*w-Math.PI*radius/2;
   function point(u){let x=u,z=0,angle=0;if(u>boundary){angle=Math.min(Math.PI,(u-boundary)/radius);if(u<boundary+Math.PI*radius){x=boundary+radius*Math.sin(angle);z=radius*(1-Math.cos(angle));}else{x=boundary-(u-boundary-Math.PI*radius);z=2*radius;}}const scale=lens/(lens-z);return{x:bw*.5+sign*x*scale,z,angle,scale};}
   const strips=[];
   for(let i=0;i<count;i++){const a=point(i*step),b=point((i+1)*step),m=point((i+.5)*step);strips.push({i,a,b,m});}
   strips.sort((a,b)=>a.m.z-b.m.z);
   for(const {i,a,b,m} of strips){
    const isBack=m.angle>Math.PI/2,reverse=forward?isBack:!isBack;
    const textures=isBack?back:front,shade=Math.min(3,Math.round((1-Math.abs(Math.cos(m.angle)))*3)),source=textures[shade];
    const sx=(reverse?count-1-i:i)*source.width/count,sw=source.width/count;
    const dx=Math.min(a.x,b.x),dw=Math.abs(b.x-a.x);if(dw<.01)continue;
    const dy=h*.5*(1-m.scale),dh=h*m.scale;
    ctx.drawImage(source,sx,0,sw,source.height,dx-.15,dy,dw+.3,dh);
   }
  }
  return{element:canvas,draw};
 }
 window.studyPaperCurl={create};
})();
