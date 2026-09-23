(() => {
  'use strict';
  const TARGET_BYTES = 3_850_000; // Leave margin below portals that enforce decimal 4 MB.
  const MAX_FILES = 40;
  const MAX_PAGES = 120;
  const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const $ = s => document.querySelector(s);
  const state = { files: [], outputBlob: null, outputUrl: '', pages: 0, busy: false };

  function reduceMotion(){ return matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function applyTheme(){
    const pref = localStorage.getItem('signwell-theme') || 'system';
    const dark = pref === 'dark' || (pref === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.body.classList.toggle('dark', dark);
    document.body.classList.toggle('taiwan-theme', dark);
    document.documentElement.dataset.swTheme = dark ? 'taiwan' : 'light';
    $('#themeColorMeta')?.setAttribute('content', dark ? '#14251f' : '#f4f7f8');
    const b=$('#themeBtn');
    if(b){
      b.setAttribute('aria-label',dark?'切換至淺色模式':'切換至台灣主題色');
      b.setAttribute('aria-pressed',dark?'true':'false');
      b.title=dark?'目前：台灣主題｜切換至淺色模式':'目前：淺色模式｜切換至台灣主題';
    }
  }
  function ensureThemeWash(){
    let wash=$('#swThemeLightWash');
    if(wash) return wash;
    wash=document.createElement('div'); wash.id='swThemeLightWash'; wash.setAttribute('aria-hidden','true'); document.body.appendChild(wash); return wash;
  }
  function toggleTheme(ev){
    const btn=$('#themeBtn'),r=btn?.getBoundingClientRect?.();
    const x=Number.isFinite(ev?.clientX)&&ev.clientX>0?ev.clientX:(r?r.left+r.width/2:innerWidth*.92);
    const y=Number.isFinite(ev?.clientY)&&ev.clientY>0?ev.clientY:(r?r.top+r.height/2:innerHeight*.08);
    document.documentElement.style.setProperty('--sw-theme-x',x+'px');
    document.documentElement.style.setProperty('--sw-theme-y',y+'px');
    const nextDark=!document.body.classList.contains('dark');
    localStorage.setItem('signwell-theme', nextDark ? 'dark' : 'light');
    const html=document.documentElement;
    html.classList.remove('sw-theme-to-light','sw-theme-to-dark','sw-theme-fallback-to-light','sw-theme-fallback-to-taiwan');
    html.classList.add('sw-theme-changing',nextDark?'sw-theme-to-dark':'sw-theme-to-light');
    const cleanup=()=>html.classList.remove('sw-theme-changing','sw-theme-to-light','sw-theme-to-dark','sw-theme-fallback-to-light','sw-theme-fallback-to-taiwan');
    const run=()=>applyTheme();
    if(document.startViewTransition&&!reduceMotion()){
      const vt=document.startViewTransition(run); vt.finished.finally(cleanup);
    }else{
      if(!reduceMotion()){
        ensureThemeWash();
        requestAnimationFrame(()=>html.classList.add(nextDark?'sw-theme-fallback-to-taiwan':'sw-theme-fallback-to-light'));
      }
      run(); setTimeout(cleanup,720);
    }
  }
  applyTheme();
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{
    if((localStorage.getItem('signwell-theme')||'system')==='system') applyTheme();
  });

  const fmtBytes = n => n >= 1e6 ? `${(n/1e6).toFixed(2)} MB` : n >= 1e3 ? `${(n/1e3).toFixed(0)} KB` : `${n} B`;
  const esc = s => String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const typeLabel = f => f.type === 'application/pdf' || /\.pdf$/i.test(f.name) ? 'PDF' : (f.type.split('/')[1]||'IMAGE').toUpperCase();

  function setStatus(text, pct, error=false){
    $('#progressPanel').classList.remove('hidden');
    $('#progressStatus').textContent = text;
    $('#progressStatus').classList.toggle('error', !!error);
    $('#progressPct').textContent = `${Math.max(0,Math.min(100,Math.round(pct||0)))}%`;
    $('#progressBar').style.width = `${Math.max(0,Math.min(100,pct||0))}%`;
  }
  function clearOutput(){
    if(state.outputUrl) URL.revokeObjectURL(state.outputUrl);
    state.outputBlob = null; state.outputUrl='';
    $('#resultPanel').classList.add('hidden');
  }
  function renderFiles(resetOutput=true){
    if(resetOutput) clearOutput();
    const box=$('#fileList');
    box.innerHTML=state.files.map((f,i)=>`<div class="file"><div class="file-index">${i+1}</div><div class="file-main"><div class="file-name">${esc(f.name)}</div><div class="file-meta">${typeLabel(f)} · ${fmtBytes(f.size)}</div></div><button class="file-remove" type="button" data-rm="${i}" aria-label="移除 ${esc(f.name)}">×</button></div>`).join('');
    $('#compressBtn').disabled=!state.files.length || state.busy;
    $('#clearBtn').disabled=!state.files.length || state.busy;
    box.querySelectorAll('[data-rm]').forEach(btn=>btn.onclick=()=>{ if(state.busy)return; state.files.splice(Number(btn.dataset.rm),1); renderFiles(); });
  }
  function addFiles(list){
    const next=[...list].filter(f=>f && (f.type==='application/pdf'||f.type.startsWith('image/')||/\.(pdf|jpe?g|png|webp|heic)$/i.test(f.name)));
    if(!next.length)return;
    state.files=[...state.files,...next].slice(0,MAX_FILES);
    renderFiles();
  }

  async function loadPdfJs(){
    if(window.pdfjsLib){ window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS_WORKER; return window.pdfjsLib; }
    await new Promise((resolve,reject)=>{
      const s=document.createElement('script'); s.src=PDFJS_URL; s.async=true; s.onload=resolve; s.onerror=()=>reject(new Error('PDF 解析元件載入失敗，請確認網路後再試。')); document.head.appendChild(s);
    });
    if(!window.pdfjsLib) throw new Error('PDF 解析元件沒有正確啟動。');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS_WORKER;
    return window.pdfjsLib;
  }

  async function imageBitmapFromFile(file){
    if('createImageBitmap' in window){
      try{return await createImageBitmap(file,{imageOrientation:'from-image'});}catch(_){ }
    }
    return await new Promise((resolve,reject)=>{
      const url=URL.createObjectURL(file), img=new Image();
      img.onload=()=>{URL.revokeObjectURL(url);resolve(img)}; img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error(`無法讀取圖片：${file.name}`))}; img.src=url;
    });
  }

  async function collectSources(){
    const sources=[]; let pageCount=0;
    for(let i=0;i<state.files.length;i++){
      const file=state.files[i];
      setStatus(`分析 ${file.name}`, 3 + (i/state.files.length)*9);
      if(file.type==='application/pdf'||/\.pdf$/i.test(file.name)){
        const pdfjs=await loadPdfJs();
        const doc=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise;
        pageCount+=doc.numPages;
        if(pageCount>MAX_PAGES) throw new Error(`頁數超過 ${MAX_PAGES} 頁，請分成兩次處理。`);
        for(let p=1;p<=doc.numPages;p++) sources.push({kind:'pdf',doc,pageNo:p,name:file.name});
      }else{
        pageCount+=1; if(pageCount>MAX_PAGES) throw new Error(`頁數超過 ${MAX_PAGES} 頁，請分成兩次處理。`);
        sources.push({kind:'image',file,name:file.name});
      }
    }
    state.pages=pageCount;
    return sources;
  }

  async function renderSource(source,longSide){
    let rawW,rawH,draw;
    if(source.kind==='pdf'){
      const page=await source.doc.getPage(source.pageNo);
      const vp1=page.getViewport({scale:1}); rawW=vp1.width;rawH=vp1.height;
      const scale=Math.max(.18,longSide/Math.max(rawW,rawH));
      const vp=page.getViewport({scale});
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(vp.width));canvas.height=Math.max(1,Math.round(vp.height));
      const ctx=canvas.getContext('2d',{alpha:false}); ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
      await page.render({canvasContext:ctx,viewport:vp,background:'#ffffff'}).promise;
      return {canvas,pxW:canvas.width,pxH:canvas.height};
    }
    const bitmap=await imageBitmapFromFile(source.file); rawW=bitmap.width||bitmap.naturalWidth; rawH=bitmap.height||bitmap.naturalHeight;
    const scale=Math.min(1,longSide/Math.max(rawW,rawH));
    const w=Math.max(1,Math.round(rawW*scale)),h=Math.max(1,Math.round(rawH*scale));
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(bitmap,0,0,w,h);
    if(bitmap.close) bitmap.close();
    return {canvas,pxW:w,pxH:h};
  }
  const canvasToJpeg = (canvas,q)=>new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('圖片壓縮失敗。')),'image/jpeg',q));
  const ascii = s => new TextEncoder().encode(s);
  function concatBytes(chunks){
    const len=chunks.reduce((n,c)=>n+c.length,0),out=new Uint8Array(len);let off=0;for(const c of chunks){out.set(c,off);off+=c.length}return out;
  }

  function buildPdf(pages){
    if(!pages.length) throw new Error('沒有可輸出的頁面。');
    const chunks=[],offsets=[0];let total=0;
    const push=b=>{const u=typeof b==='string'?ascii(b):b;chunks.push(u);total+=u.length};
    const obj=(n,bodyParts)=>{offsets[n]=total;push(`${n} 0 obj\n`);for(const p of bodyParts)push(p);push(`\nendobj\n`)};
    push('%PDF-1.4\n%SIGNWELL\n');
    const pageNums=pages.map((_,i)=>3+i*3),maxObj=2+pages.length*3;
    obj(1,[`<< /Type /Catalog /Pages 2 0 R >>`]);
    obj(2,[`<< /Type /Pages /Count ${pages.length} /Kids [${pageNums.map(n=>`${n} 0 R`).join(' ')}] >>`]);
    pages.forEach((p,i)=>{
      const pageObj=3+i*3,imgObj=4+i*3,contentObj=5+i*3;
      const portrait=p.pxH>=p.pxW,pw=portrait?595.28:841.89,ph=portrait?841.89:595.28;
      const pageRatio=pw/ph,imgRatio=p.pxW/p.pxH;let dw,dh,dx,dy;
      if(imgRatio>pageRatio){dw=pw;dh=pw/imgRatio;dx=0;dy=(ph-dh)/2}else{dh=ph;dw=ph*imgRatio;dy=0;dx=(pw-dw)/2}
      const content=`q\n${dw.toFixed(2)} 0 0 ${dh.toFixed(2)} ${dx.toFixed(2)} ${dy.toFixed(2)} cm\n/Im${i+1} Do\nQ`;
      obj(pageObj,[`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw.toFixed(2)} ${ph.toFixed(2)}] /Resources << /XObject << /Im${i+1} ${imgObj} 0 R >> >> /Contents ${contentObj} 0 R >>`]);
      obj(imgObj,[`<< /Type /XObject /Subtype /Image /Width ${p.pxW} /Height ${p.pxH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.bytes.length} >>\nstream\n`,p.bytes,'\nendstream']);
      obj(contentObj,[`<< /Length ${ascii(content).length} >>\nstream\n${content}\nendstream`]);
    });
    const xref=total;push(`xref\n0 ${maxObj+1}\n0000000000 65535 f \n`);
    for(let i=1;i<=maxObj;i++)push(`${String(offsets[i]||0).padStart(10,'0')} 00000 n \n`);
    push(`trailer\n<< /Size ${maxObj+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    return concatBytes(chunks);
  }

  async function encodePass(sources,longSide,quality,passIndex){
    const pages=[];
    for(let i=0;i<sources.length;i++){
      const base=12 + passIndex*2, span=68;
      setStatus(`第 ${passIndex+1} 輪 · 處理第 ${i+1}/${sources.length} 頁`,base+(i/Math.max(1,sources.length))*span);
      const rendered=await renderSource(sources[i],longSide);
      const blob=await canvasToJpeg(rendered.canvas,quality);
      const bytes=new Uint8Array(await blob.arrayBuffer());
      pages.push({bytes,pxW:rendered.pxW,pxH:rendered.pxH});
      rendered.canvas.width=1;rendered.canvas.height=1;
      await new Promise(r=>setTimeout(r,0));
    }
    return pages;
  }

  async function compress(){
    if(state.busy||!state.files.length)return;
    state.busy=true;renderFiles(false);clearOutput();$('#progressPanel').classList.remove('hidden');$('#resultPanel').classList.add('hidden');
    const originalBytes=state.files.reduce((n,f)=>n+f.size,0);
    try{
      if(state.files.length===1 && (state.files[0].type==='application/pdf'||/\.pdf$/i.test(state.files[0].name)) && state.files[0].size<=TARGET_BYTES){
        setStatus('原 PDF 已低於 4 MB，直接保留原始品質。',100);
        state.pages=0; finish(state.files[0],originalBytes,true); return;
      }
      const sources=await collectSources();
      const mobile=matchMedia('(max-width:700px)').matches || (navigator.deviceMemory&&navigator.deviceMemory<=4);
      let longSide=mobile?1380:1780,quality=.80,pdfBytes=null,best=null;
      for(let pass=0;pass<7;pass++){
        const enc=await encodePass(sources,longSide,quality,pass);
        pdfBytes=buildPdf(enc);
        best=pdfBytes;
        setStatus(`檢查檔案大小：${fmtBytes(pdfBytes.length)}`,82+pass*2);
        if(pdfBytes.length<=TARGET_BYTES)break;
        const ratio=TARGET_BYTES/pdfBytes.length;
        if(quality>.48){quality=Math.max(.48,quality*Math.max(.68,ratio*.96));}
        else{
          longSide=Math.max(520,Math.floor(longSide*Math.max(.68,Math.sqrt(ratio)*.94)));
          quality=Math.max(.30,Math.min(.52,quality*.96));
        }
      }
      if(best.length>TARGET_BYTES){
        longSide=Math.max(440,Math.floor(longSide*.78));quality=.27;
        const enc=await encodePass(sources,longSide,quality,7);best=buildPdf(enc);
      }
      if(best.length>TARGET_BYTES) throw new Error(`內容頁數太多，已壓到可讀性安全下限仍為 ${fmtBytes(best.length)}。建議拆成兩份後再上傳。`);
      const blob=new Blob([best],{type:'application/pdf'});setStatus('完成，PDF 已壓縮到 4 MB 以下。',100);finish(blob,originalBytes,false);
    }catch(err){
      setStatus(err?.message||'壓縮失敗，請重新選擇檔案。',100,true);
    }finally{state.busy=false;renderFiles(false);}
  }

  function finish(blob,originalBytes,passThrough){
    clearOutput();state.outputBlob=blob;state.outputUrl=URL.createObjectURL(blob);
    const a=$('#downloadBtn');a.href=state.outputUrl;a.download='學習歷程_4MB.pdf';
    $('#resultPanel').classList.remove('hidden');
    $('#outOriginal').textContent=fmtBytes(originalBytes);$('#outSize').textContent=fmtBytes(blob.size);
    $('#outPages').textContent=state.pages?`${state.pages} 頁`:(passThrough?'原 PDF':'-');
    $('#resultTitle').textContent=passThrough?'原檔已符合 4 MB 限制':'壓縮完成';
    $('#resultText').textContent=passThrough?'沒有重新編碼，保留原本 PDF 文字與畫質。':'已轉成單一 PDF，檔案大小保留安全邊界低於 4 MB。';
    $('#resultPanel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'nearest'});
  }

  const input=$('#fileInput'),drop=$('#dropzone');
  $('#pickBtn').onclick=()=>input.click(); input.onchange=()=>{addFiles(input.files);input.value=''};
  ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('drag')}));
  ['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('drag')}));
  drop.addEventListener('drop',e=>addFiles(e.dataTransfer.files));
  $('#compressBtn').onclick=compress;
  $('#clearBtn').onclick=()=>{if(state.busy)return;state.files=[];renderFiles();$('#progressPanel').classList.add('hidden')};
  $('#resetBtn').onclick=()=>{state.files=[];renderFiles();$('#progressPanel').classList.add('hidden');clearOutput();scrollTo({top:0,behavior:'smooth'})};
  $('#themeBtn').onclick=toggleTheme;
  renderFiles();
})();
