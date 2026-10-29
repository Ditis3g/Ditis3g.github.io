const $=id=>document.getElementById(id),F=PixelFilters;
let original,steps=[],outputs=[],thumbs=[],selected=-1,undo=[],redo=[],timer,worker,version=0,busy=false,name='샘플',loadVersion=0;
let viewOriginal=false,commandIndex=0;
const clone=v=>JSON.parse(JSON.stringify(v));
const viewer=new PixelViewport.Viewer($('imageStage'),$('result'),({scale,mode})=>{
 if(document.activeElement!==$('zoomPercent'))$('zoomPercent').value=Number((scale*100).toFixed(1));
 $('zoomInfo').textContent=(scale*100).toFixed(1)+'%'+(mode==='fit'?' · 맞춤':'');
},pixel=>{
 if(!pixel){$('pixelInfo').textContent='마우스를 올리면 좌표와 픽셀값 표시';return}
 const [r,g,b]=pixel.rgba;$('pixelInfo').textContent=`X ${pixel.x} · Y ${pixel.y} | RGB ${r}, ${g}, ${b} | 밝기 ${(.2126*r+.7152*g+.0722*b).toFixed(1)}`;
});

function status(t){$('status').textContent=t}
function draw(canvas,image){canvas.width=image.width;canvas.height=image.height;canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(image.data),image.width,image.height),0,0)}
function thumbnail(image){const full=document.createElement('canvas');draw(full,image);const c=document.createElement('canvas');c.width=150;c.height=90;c.getContext('2d').drawImage(full,0,0,c.width,c.height);return c.toDataURL()}
function checkpoint(){undo.push({steps:clone(steps),selected});if(undo.length>30)undo.shift();redo=[]}
function invalidate(){clearTimeout(timer);version++;if(worker){worker.terminate();worker=null}}
function recompute(from=0){invalidate();outputs.length=Math.min(outputs.length,from);thumbs.length=Math.min(thumbs.length,from);if(!steps.length){busy=false;render();status('원본 · [＋ 단계 추가]를 누른 뒤 필터를 선택하세요.');return}const start=Math.min(from,outputs.length);busy=true;render();status((start+1)+'단계부터 '+steps.length+'단계까지 다시 계산 중…');const id=version;timer=setTimeout(()=>{const m={id,start,image:start?outputs[start-1]:original,steps:clone(steps.slice(start))};if(location.protocol!=='file:'&&typeof Worker!=='undefined'){try{const activeWorker=new Worker('worker.js?v=20261029-pixel-stage3');worker=activeWorker;activeWorker.onmessage=({data})=>finish(data);activeWorker.onerror=event=>{event.preventDefault();activeWorker.terminate();if(worker===activeWorker)worker=null;if(m.id===version)fallback(m)};activeWorker.postMessage(m);return}catch{}}fallback(m)},130)}
async function fallback(m){try{let image=m.image;const results=[];for(const step of m.steps){await new Promise(r=>setTimeout(r,0));if(m.id!==version)return;image=F.process(image,step.type,step.params);results.push(image)}finish({id:m.id,start:m.start,results})}catch(e){finish({id:m.id,error:e.message})}}
function finish(m){if(m.id!==version)return;if(worker){worker.terminate();worker=null}busy=false;if(m.error){render();status('처리 실패: '+m.error);return}outputs.splice(m.start,outputs.length-m.start,...m.results);thumbs.splice(m.start,thumbs.length-m.start,...m.results.map(thumbnail));render();status(steps.length+'개 단계 계산 완료 · 파라미터를 바꾸면 뒤쪽 결과도 갱신됩니다.')}
function button(text,action,disabled=false){const b=document.createElement('button');b.textContent=text;b.disabled=disabled;b.onclick=action;return b}
function renderChain(){const container=$('chain'),scroll=container.scrollLeft;container.replaceChildren();const all=[{label:'원본',thumb:original?thumbnail(original):null},...steps.map((s,i)=>({label:F.definitions[s.type].name,thumb:thumbs[i]}))];all.forEach((s,n)=>{const i=n-1,card=document.createElement('div');card.className='step'+(selected===i?' selected':'');const choose=button('',()=>select(i));choose.setAttribute('aria-label',n+'단계 '+s.label);choose.setAttribute('aria-pressed',String(selected===i));if(s.thumb){const img=document.createElement('img');img.src=s.thumb;img.alt=s.label;choose.append(img)}const label=document.createElement('strong');label.textContent=n+' · '+s.label;choose.append(label);if(!s.thumb){const wait=document.createElement('small');wait.textContent='재계산 대기';choose.append(wait)}card.append(choose);if(i>=0){const actions=document.createElement('div');actions.className='step-tools';const left=button('←',()=>move(i,-1),i===0),right=button('→',()=>move(i,1),i===steps.length-1),del=button('×',()=>remove(i));left.setAttribute('aria-label',(i+1)+'단계 앞으로 이동');right.setAttribute('aria-label',(i+1)+'단계 뒤로 이동');del.setAttribute('aria-label',(i+1)+'단계 삭제');actions.append(left,right,del);card.append(actions)}container.append(card)});const plus=button('＋ 단계 추가',beginAdd,steps.length>=16);plus.className='add-step';plus.title='이전 결과를 그대로 보여주는 빈 단계 추가';container.append(plus);container.scrollLeft=scroll}
function histogram(image){const ctx=$('hist').getContext('2d');ctx.clearRect(0,0,512,115);if(!image)return;const h=new Uint32Array(256);for(const v of F.gray(image.data))h[Math.round(v)]++;const peak=Math.max(...h);ctx.fillStyle='#77ead0';for(let i=0;i<256;i++){const v=peak?h[i]/peak*105:0;ctx.fillRect(i*2,115-v,2,v)}}
function render(){
 renderMode();$('recipeState').textContent=steps.length+'개 단계'+(busy?' · 계산 중':'');renderChain();
 const output=selected<0?original:outputs[selected],display=viewOriginal?original:output;
 viewer.show(display);$('resultTitle').textContent=(viewOriginal||selected<0?'원본':(selected+1)+'단계 · '+F.definitions[steps[selected].type].name)+' · '+name+(display?'':' · 재계산 대기');
 $('imageInfo').textContent=display?display.width+' × '+display.height+' px · 8-bit RGBA':'선택 단계 계산 중';
 $('showOriginal').setAttribute('aria-pressed',String(viewOriginal));$('showOriginal').textContent=viewOriginal?'단계 결과 보기':'원본 보기';
 $('meta').textContent=display?.meta||'';histogram(display);$('save').disabled=busy||!display;$('undo').disabled=!undo.length;$('redo').disabled=!redo.length;
 $('delete').disabled=selected<0;$('moveUp').disabled=selected<=0;$('moveDown').disabled=selected<0||selected>=steps.length-1;
 for(const id of ['zoomIn','zoomOut','fitView','actualSize','zoomPercent'])$(id).disabled=!display;
}
function select(i){viewOriginal=false;selected=i;inspector();render();catalog()}
function inspector(){const step=steps[selected];$('pickFilter').disabled=!step;$('pickFilter').textContent=step&&step.type!=='identity'?F.definitions[step.type].name+' ▾':'필터 선택…';$('params').replaceChildren();$('selectedTitle').textContent=step?(selected+1)+' · '+F.definitions[step.type].name:'원본';$('description').textContent=step?F.definitions[step.type].description:'처리 단계를 선택해 필터를 바꾸거나, ＋ 단계 추가를 눌러 시작하세요.';if(!step)return;for(const [key,label,min,max,defaultValue,increment]of F.definitions[step.type].params){const wrap=document.createElement('label');wrap.className='param';wrap.textContent=label;const range=document.createElement('input'),number=document.createElement('input');Object.assign(range,{type:'range',min,max,step:increment,value:step.params[key]??defaultValue});Object.assign(number,{type:'number',min,max,step:increment,value:step.params[key]??defaultValue});range.setAttribute('aria-label',label);number.setAttribute('aria-label',label+' 숫자');let checkpointed=false;function update(input,other){if(input.value===''||!Number.isFinite(Number(input.value)))return;let value=Math.min(max,Math.max(min,Number(input.value)));value=Math.round((value-min)/increment)*increment+min;value=Number(value.toFixed(6));if(value===step.params[key])return;if(!checkpointed){checkpoint();checkpointed=true}step.params[key]=value;other.value=value;recompute(selected)}for(const [a,b]of [[range,number],[number,range]]){a.oninput=()=>update(a,b);a.onchange=()=>{a.value=step.params[key];checkpointed=false};a.onblur=()=>{a.value=step.params[key];checkpointed=false}}wrap.append(number,range);$('params').append(wrap)}}
function move(i,delta){const target=i+delta;if(target<0||target>=steps.length)return;checkpoint();[steps[i],steps[target]]=[steps[target],steps[i]];selected=target;inspector();catalog();recompute(Math.min(i,target))}
function remove(i){checkpoint();steps.splice(i,1);selected=Math.min(i,steps.length-1);inspector();catalog();recompute(i)}
function matchesFilter(key,q){const d=F.definitions[key];return q.toLowerCase().trim().split(/\s+/).every(word=>(key+' '+d.name+' '+d.description+' '+d.category+' '+({gray:'grayscale grey 흑백',threshold:'binary threshold 문턱값',gaussian:'gaussian blur 흐림',sobel:'edge 윤곽',erode:'erosion 침식',dilate:'dilation 팽창',opening:'open',closing:'close',otsu:'automatic auto threshold'}[key]||'')).toLowerCase().includes(word))}
function catalog(){
 const q=$('search').value.trim(),category=$('category').value,entries=Object.entries(F.definitions).filter(([key,d])=>!d.internal&&(category==='all'||category===d.category)&&matchesFilter(key,q));$('catalog').replaceChildren();
 function item([key,d]){const b=button(d.name,()=>chooseFilter(key));b.classList.toggle('active',steps[selected]?.type===key);b.setAttribute('aria-pressed',String(steps[selected]?.type===key));b.title=d.description;return b}
 if(!q&&category==='all'){const group=document.createElement('div'),title=document.createElement('h3');title.textContent='자주 쓰는 필터';group.className='common-filters';group.append(title);for(const key of ['gray','gaussian','median','brightness','threshold','otsu','sobel','opening'])group.append(item([key,F.definitions[key]]));$('catalog').append(group)}
 for(const categoryName of [...new Set(entries.map(([,d])=>d.category))]){const group=document.createElement('details'),heading=document.createElement('summary'),children=entries.filter(([,d])=>d.category===categoryName);heading.textContent=categoryName+' · '+children.length;group.open=!!q||category!=='all';group.append(heading);for(const entry of children)group.append(item(entry));$('catalog').append(group)}
 if(!entries.length){const p=document.createElement('p');p.textContent='검색 결과가 없습니다.';$('catalog').append(p)}$('filterCount').textContent='필터 라이브러리 · '+entries.length+' / '+Object.values(F.definitions).filter(d=>!d.internal).length;
}
function load(image,title,detail=''){viewOriginal=false;viewer.width=null;invalidate();original=image;outputs=[];thumbs=[];selected=Math.min(selected,steps.length-1);undo=[];redo=[];busy=false;name=title;inspector();catalog();if(steps.length)recompute(0);else{render();status('이미지를 열었습니다 · '+image.width+' × '+image.height+detail)}}
async function open(file){if(!file)return;const token=++loadVersion,url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();if(token!==loadVersion)return;const ratio=Math.min(1,1600/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*ratio));c.height=Math.max(1,Math.round(img.height*ratio));const ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);load(ctx.getImageData(0,0,c.width,c.height),file.name,ratio<1?' · 긴 변 1600 px로 축소':'')}catch{if(token===loadVersion)status('이미지를 열 수 없습니다. PNG/JPEG/WebP 등을 사용하세요.')}finally{URL.revokeObjectURL(url);$('file').value=''}}
function restore(source,target){if(!source.length)return;target.push({steps:clone(steps),selected});const state=source.pop();steps=state.steps;selected=state.selected;inspector();catalog();recompute(0)}
$('file').onchange=e=>open(e.target.files[0]);$('search').oninput=catalog;$('category').onchange=catalog;$('moveUp').onclick=()=>move(selected,-1);$('moveDown').onclick=()=>move(selected,1);$('delete').onclick=()=>{if(selected>=0)remove(selected)};$('undo').onclick=()=>restore(undo,redo);$('redo').onclick=()=>restore(redo,undo);$('reset').onclick=()=>{if(!steps.length)return;checkpoint();steps=[];selected=-1;inspector();catalog();recompute()};
$('save').onclick=()=>{const image=viewer.image;if(!image)return;const canvas=document.createElement('canvas');draw(canvas,image);canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name.replace(/\.[^.]+$/,'')+'-'+(viewOriginal||selected<0?'original':'step-'+(selected+1))+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)})};
const categories=['all',...new Set(Object.values(F.definitions).filter(d=>!d.internal).map(d=>d.category))];for(const category of categories){const option=document.createElement('option');option.value=category;option.textContent=category==='all'?'모든 분류':category;$('category').append(option)}catalog();document.addEventListener('dragover',e=>e.preventDefault());document.addEventListener('drop',e=>{e.preventDefault();open(e.dataTransfer.files[0])});

function demo(){loadVersion++;const c=document.createElement('canvas');c.width=960;c.height=640;const x=c.getContext('2d');let g=x.createLinearGradient(0,0,960,640);g.addColorStop(0,'#25384c');g.addColorStop(1,'#93bba9');x.fillStyle=g;x.fillRect(0,0,960,640);x.fillStyle='#f4d89d';x.fillRect(130,145,400,330);x.fillStyle='#152534';for(const [a,b]of [[210,230],[450,230],[210,395],[450,395]]){x.beginPath();x.arc(a,b,32,0,Math.PI*2);x.fill()}x.fillStyle='#e58c70';x.beginPath();x.arc(720,320,135,0,Math.PI*2);x.fill();x.fillStyle='#243348';x.beginPath();x.arc(720,320,65,0,Math.PI*2);x.fill();x.fillStyle='white';x.font='22px sans-serif';x.fillText('PIXEL LAB / FILTER SAMPLE',130,555);const image=x.getImageData(0,0,960,640);let seed=42;for(let i=0;i<image.data.length;i+=4){seed=(1664525*seed+1013904223)>>>0;const noise=(seed/4294967296-.5)*24;for(let k=0;k<3;k++)image.data[i+k]+=noise}load(image,'노이즈 · 형상 샘플')}

$('pickFilter').onclick=openCommands;
// First visit shows only the original; stages are created with the add button.
$('demo').onclick=demo;demo();

function downloadJSON(value,filename){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('recipeSave').onclick=()=>{const title=$('recipeName').value.trim()||'새 레시피';downloadJSON(PixelRecipe.serialize(title,steps),title.replace(/[<>:"/\\|?*]/g,'_')+'.json');status('레시피를 저장했습니다. 이미지 파일은 포함되지 않습니다.')};
let recipeLoadVersion=0;
$('recipeFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;const token=++recipeLoadVersion;try{if(file.size>1024*1024)throw Error('레시피는 1 MB 이하만 지원합니다.');const recipe=PixelRecipe.validate(JSON.parse(await file.text()),F.definitions);if(token!==recipeLoadVersion)return;checkpoint();steps=recipe.steps;selected=steps.length-1;$('recipeName').value=recipe.name;inspector();catalog();recompute(0)}catch(error){status('레시피 불러오기 실패: '+error.message)}finally{e.target.value=''}};

function renderMode(){
 const step=steps[selected];
 $('modeHint').textContent=step?.type==='identity'?(selected+1)+'단계 · 입력 그대로 표시 중. 왼쪽에서 필터를 선택하세요.':selected>=0?(selected+1)+'단계 편집 · 필터를 고르면 이 단계만 교체합니다.':'원본 보기 · 새 단계는 ＋ 버튼으로 추가하세요.';
 $('commandAdd').disabled=steps.length>=16;
}
function beginAdd(){
 if(steps.length>=16){status('최대 16단계까지 추가할 수 있습니다.');return}
 const input=steps.length?outputs[steps.length-1]:original,ready=!busy&&!!input;
 checkpoint();viewOriginal=false;steps.push({type:'identity',params:{}});selected=steps.length-1;
 if($('filterDialog').open)$('filterDialog').close();
 inspector();catalog();
 if(ready){outputs.push(input);thumbs.push(thumbnail(input));render();status('새 단계를 추가했습니다. 이전 결과를 그대로 표시합니다. 왼쪽에서 필터를 선택하세요.')}
 else recompute(selected);
 requestAnimationFrame(()=>$('chain').scrollLeft=$('chain').scrollWidth);
}
function chooseFilter(type){
 if(!Object.hasOwn(F.definitions,type))return;
 if(selected<0){status('원본은 교체할 수 없습니다. 먼저 [＋ 단계 추가]를 눌러주세요.');return}
 if(steps[selected].type===type)return;
 viewOriginal=false;checkpoint();steps[selected]={type,params:Object.fromEntries(F.definitions[type].params.map(p=>[p[0],p[4]]))};inspector();catalog();recompute(selected);
}

function openCommands(){
 $('filterDialogMode').textContent=selected>=0?(selected+1)+'단계 필터 교체':'원본 보기';
 $('filterDialog').querySelector('.command-footer small').textContent=selected>=0?'필터를 고르면 현재 단계만 교체하고 뒤쪽 결과를 다시 계산합니다.':'원본은 바꿀 수 없습니다. ＋ 빈 단계 추가를 눌러주세요.';
 $('commandSearch').value='';commandIndex=0;renderCommands();if(!$('filterDialog').open)$('filterDialog').showModal();$('commandSearch').focus();
}
function renderCommands(){
 const query=$('commandSearch').value.toLowerCase().trim(),rank=([key,d])=>!query?0:key.toLowerCase()===query||d.name.toLowerCase()===query?0:key.toLowerCase().includes(query)||d.name.toLowerCase().includes(query)?1:2;const entries=Object.entries(F.definitions).filter(([key,d])=>!d.internal&&matchesFilter(key,query)).sort((a,b)=>rank(a)-rank(b));commandIndex=Math.max(0,Math.min(commandIndex,entries.length-1));$('commandResults').replaceChildren();
 entries.forEach(([key,d],i)=>{const b=button('',()=>{if(selected<0)return;chooseFilter(key);$('filterDialog').close()});b.className='command-item'+(i===commandIndex?' highlighted':'');b.dataset.index=i;b.disabled=selected<0;const name=document.createElement('strong'),category=document.createElement('small'),description=document.createElement('span');name.textContent=d.name;category.textContent=d.category;description.textContent=d.description;b.append(name,category,description);$('commandResults').append(b)});
 $('commandCount').textContent=entries.length+'개 필터';if(!entries.length){const p=document.createElement('p');p.textContent='검색 결과가 없습니다.';$('commandResults').append(p)}
}
$('commandSearch').oninput=()=>{commandIndex=0;renderCommands()};
$('commandSearch').onkeydown=e=>{const items=[...$('commandResults').querySelectorAll('button')];if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();commandIndex=Math.max(0,Math.min(items.length-1,commandIndex+(e.key==='ArrowDown'?1:-1)));items.forEach((b,i)=>b.classList.toggle('highlighted',i===commandIndex));items[commandIndex]?.scrollIntoView({block:'nearest'})}if(e.key==='Enter'){e.preventDefault();items[commandIndex]?.click()}};
$('closeCommands').onclick=()=>$('filterDialog').close();$('commandOpen').onclick=openCommands;$('commandAdd').onclick=beginAdd;
$('zoomIn').onclick=()=>viewer.setZoom(viewer.transform.scale*1.25);$('zoomOut').onclick=()=>viewer.setZoom(viewer.transform.scale/1.25);
$('fitView').onclick=()=>viewer.fit();$('actualSize').onclick=()=>viewer.setZoom(1);
$('zoomPercent').onchange=()=>{const value=Number($('zoomPercent').value);if(Number.isFinite(value)&&value>0)viewer.setZoom(value/100);$('zoomPercent').value=Number((viewer.transform.scale*100).toFixed(1))};
$('zoomPercent').onkeydown=e=>{if(e.key==='Enter'){$('zoomPercent').onchange();$('zoomPercent').blur()}};
function setViewerTool(tool){viewer.setTool(tool);$('handTool').setAttribute('aria-pressed',String(tool==='hand'));$('magnifierTool').setAttribute('aria-pressed',String(tool==='zoom'))}
$('handTool').onclick=()=>setViewerTool('hand');$('magnifierTool').onclick=()=>setViewerTool('zoom');
$('showOriginal').onclick=()=>{viewOriginal=!viewOriginal;render()};
let oldBodyOverflow='';
function expandWorkbench(){const root=document.querySelector('.pixel-workbench')||document.querySelector('main'),expanded=root.classList.toggle('workbench-expanded');if(expanded){oldBodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden'}else document.body.style.overflow=oldBodyOverflow;$('expandWorkbench').textContent=expanded?'작업실 크기 복원':'작업실 크게 보기';$('expandWorkbench').setAttribute('aria-pressed',String(expanded))}
$('expandWorkbench').onclick=expandWorkbench;
document.addEventListener('keydown',e=>{
 if($('filterDialog').open)return;
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommands();return}
 if(e.key==='Escape'&&document.querySelector('.workbench-expanded')){expandWorkbench();return}
 if(e.target.closest('input,select,textarea,[contenteditable=true]'))return;
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();$(e.shiftKey?'redo':'undo').click();return}
 if(e.ctrlKey||e.metaKey||e.altKey)return;
 const key=e.key.toLowerCase();if(['+','=','-','f','1','v','z','o'].includes(key))e.preventDefault();
 if(key==='+'||key==='=')$('zoomIn').click();else if(key==='-')$('zoomOut').click();else if(key==='f')viewer.fit();else if(key==='1')viewer.setZoom(1);else if(key==='v')setViewerTool('hand');else if(key==='z')setViewerTool('zoom');else if(key==='o')$('showOriginal').click();
});

