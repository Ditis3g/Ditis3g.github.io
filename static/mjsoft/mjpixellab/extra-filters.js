(function(){
const F=PixelFilters,base=F.process,D=F.definitions;
const r=['radius','반경',1,5,1,1],amount=['amount','강도',0,5,1,.1];
const groups={identity:'기본',gray:'색상 / 밝기',brightness:'색상 / 밝기',invert:'색상 / 밝기',gaussian:'노이즈 / 평활화',median:'노이즈 / 평활화',sharpen:'윤곽 / 강조',threshold:'이진화',otsu:'이진화',sobel:'윤곽 / 강조',erode:'형태학',dilate:'형태학',opening:'형태학',closing:'형태학'};
for(const [k,d]of Object.entries(D))d.category=groups[k];
function add(key,name,category,description,params=[]){D[key]={name,category,description,params}}
for(const [k,n]of [['red','빨강 채널'],['green','초록 채널'],['blue','파랑 채널'],['hue','색상 H'],['saturation','채도 S'],['value','명도 V']])add(k,n,'색상 / 밝기','선택한 채널을 0–255 밝기 영상으로 분리합니다.');
add('gamma','감마 보정','색상 / 밝기','출력 = 255 × (입력/255)^감마. 1 미만이면 밝아집니다.',[['gamma','감마',.1,4,1,.1]]);
add('stretch','명암 정규화','색상 / 밝기','밝기 최솟값과 최댓값을 0–255로 늘립니다.');
add('equalize','히스토그램 평활화','색상 / 밝기','누적 밝기 분포로 전역 대비를 조절합니다.');
add('posterize','포스터화','색상 / 밝기','RGB 채널별 밝기 단계 수를 줄입니다.',[['levels','단계 수',2,32,4,1]]);
add('range','범위 이진화','이진화','하한 이상, 상한 이하만 흰색으로 표시합니다. 하한이 상한보다 크면 빈 결과입니다.',[['low','하한',0,255,80,1],['high','상한',0,255,180,1]]);
add('meanThreshold','평균값 자동 이진화','이진화','영상 전체 평균 밝기를 임계값으로 사용합니다.');
add('isodata','자동 이진화 · IsoData','이진화','두 밝기 그룹의 평균을 반복 계산합니다.');
add('adaptive','적응형 평균 이진화','이진화','픽셀 밝기가 주변 평균 − C보다 크면 흰색으로 표시합니다.',[['radius','반경',1,20,7,1],['offset','C',-40,40,5,1]]);
add('mean','평균 필터','노이즈 / 평활화','사각 이웃 영역의 평균을 RGB별로 계산합니다.',[r]);
add('minimum','최솟값 필터','노이즈 / 평활화','밝기 영상의 국소 최솟값을 선택합니다.',[r]);
add('maximum','최댓값 필터','노이즈 / 평활화','밝기 영상의 국소 최댓값을 선택합니다.',[r]);
add('variance','분산 필터','노이즈 / 평활화','국소 분산에 배율을 곱해 질감 변화를 표시합니다.',[r,['gain','배율',.01,1,.1,.01]]);
add('prewitt','엣지 검출 · Prewitt','윤곽 / 강조','3×3 Prewitt 기울기 크기를 표시합니다.',[['gain','강도',.1,3,1,.1]]);
add('scharr','엣지 검출 · Scharr','윤곽 / 강조','3×3 Scharr 기울기 크기를 4로 나눠 표시합니다.',[['gain','강도',.1,3,1,.1]]);
add('laplace','라플라시안','윤곽 / 강조','4방향 이차 미분의 절댓값을 표시합니다.',[amount]);
add('emboss','엠보스','윤곽 / 강조','방향성 기울기에 128을 더해 음영을 만듭니다.',[amount]);
add('dog','Difference of Gaussians','윤곽 / 강조','시그마와 그 1.6배 블러 차이의 절댓값을 강조합니다.',[['sigma','시그마',.5,4,1,.1],amount]);
add('gradient','형태학적 기울기','형태학','팽창 결과에서 침식 결과를 뺍니다.',[r]);
add('tophat','화이트 톱햇','형태학','원본 밝기에서 열기 결과를 빼 작은 밝은 구조를 강조합니다.',[r]);
add('blackhat','블랙 톱햇','형태학','닫기 결과에서 원본 밝기를 빼 작은 어두운 구조를 강조합니다.',[r]);
add('outline','이진 외곽선','이진 영상','128 이상을 전경으로 간주하여 침식 결과를 뺍니다.');
add('fillholes','이진 구멍 채우기','이진 영상','128 이상은 전경. 영상 테두리와 연결되지 않은 배경을 채웁니다.');
add('removeSmall','작은 객체 제거','이진 영상','128 이상 전경의 4방향 연결 성분 중 최소 면적 미만을 제거합니다.',[['area','최소 면적 (px)',1,2000,50,1]]);
add('flipH','좌우 반전','기하 변환','영상의 좌우를 뒤집습니다.');
add('flipV','상하 반전','기하 변환','영상의 상하를 뒤집습니다.');
add('rotate90','90° 시계방향 회전','기하 변환','가로와 세로 크기가 바뀝니다.');
add('rotate180','180° 회전','기하 변환','영상 중심을 기준으로 180° 회전합니다.');
add('add','상수 더하기','픽셀 연산','RGB에 상수를 더합니다. 범위를 벗어난 값은 0–255로 제한합니다.',[['amount','값',-255,255,20,1]]);
add('multiply','상수 곱하기','픽셀 연산','RGB에 배율을 곱합니다.',[['amount','배율',0,5,1.2,.1]]);
add('log','로그 변환','픽셀 연산','255 × log(1+입력) / log(256)을 계산합니다.');
add('sqrt','제곱근 변환','픽셀 연산','정규화된 RGB의 제곱근을 계산합니다.');
add('square','제곱 변환','픽셀 연산','정규화된 RGB의 제곱을 계산합니다.');
function avg(g,w,h,r){const out=new Float32Array(g.length),s=new Float64Array((w+1)*(h+1));for(let y=0;y<h;y++){let sum=0;for(let x=0;x<w;x++){sum+=g[y*w+x];s[(y+1)*(w+1)+x+1]=s[y*(w+1)+x+1]+sum}}for(let y=0;y<h;y++)for(let x=0;x<w;x++){const l=Math.max(0,x-r),t=Math.max(0,y-r),rr=Math.min(w,x+r+1),b=Math.min(h,y+r+1);out[y*w+x]=(s[b*(w+1)+rr]-s[t*(w+1)+rr]-s[b*(w+1)+l]+s[t*(w+1)+l])/((rr-l)*(b-t))}return out}
const originalKeys=new Set(Object.keys(groups));
F.process=function(image,type,p={}){
 if(originalKeys.has(type))return base(image,type,p);
 if(!D[type])throw Error('지원하지 않는 필터: '+type);
 const {width:w,height:h,data}=image,n=w*h;let out=new Uint8ClampedArray(data),g=F.gray(data),result=null,meta='',width=w,height=h;
 const radius=p.radius??1,toImage=v=>{const data=new Uint8ClampedArray(v.length*4);for(let i=0;i<v.length;i++){data[i*4]=data[i*4+1]=data[i*4+2]=v[i];data[i*4+3]=255}return {width:w,height:h,data}};
 const morph=(t)=>F.gray(base(image,t,{radius}).data);
 if(['gamma','posterize','add','multiply','log','sqrt','square'].includes(type)){for(let i=0;i<out.length;i++)if(i%4!==3){const v=data[i];out[i]=type==='gamma'?255*(v/255)**(p.gamma??1):type==='posterize'?Math.round(v/255*((p.levels??4)-1))*255/((p.levels??4)-1):type==='add'?v+(p.amount??20):type==='multiply'?v*(p.amount??1.2):type==='log'?255*Math.log1p(v)/Math.log(256):type==='sqrt'?255*Math.sqrt(v/255):v*v/255}}
 else if(['red','green','blue','hue','saturation','value'].includes(type)){result=new Float32Array(n);for(let i=0;i<n;i++){const r=data[4*i]/255,gg=data[4*i+1]/255,b=data[4*i+2]/255,max=Math.max(r,gg,b),min=Math.min(r,gg,b),d=max-min;let hue=0;if(d)hue=max===r?((gg-b)/d+6)%6:max===gg?(b-r)/d+2:(r-gg)/d+4;result[i]=type==='red'?r*255:type==='green'?gg*255:type==='blue'?b*255:type==='value'?max*255:type==='saturation'?(max?d/max*255:0):hue/6*255}}
 else if(type==='stretch'){let min=255,max=0;for(const v of g){min=Math.min(min,v);max=Math.max(max,v)}result=g.map(v=>max===min?v:(v-min)*255/(max-min))}
 else if(type==='equalize'){const hist=new Uint32Array(256),cdf=new Uint32Array(256);for(const v of g)hist[Math.round(v)]++;let sum=0,first=0;for(let i=0;i<256;i++){sum+=hist[i];cdf[i]=sum;if(!first&&sum)first=sum}result=g.map(v=>n===first?v:(cdf[Math.round(v)]-first)*255/(n-first))}
 else if(['range','meanThreshold','isodata','adaptive'].includes(type)){let t=g.reduce((a,b)=>a+b,0)/n;if(type==='isodata')for(let k=0;k<100;k++){let lo=0,hi=0,nl=0,nh=0;for(const v of g)if(v<=t){lo+=v;nl++}else{hi+=v;nh++}if(!nl||!nh)break;const next=(lo/nl+hi/nh)/2;if(Math.abs(next-t)<.1){t=next;break}t=next}if(type==='adaptive'){const a=avg(g,w,h,p.radius??7);result=g.map((v,i)=>v>a[i]-(p.offset??5)?255:0)}else result=g.map(v=>type==='range'?(v>=(p.low??80)&&v<=(p.high??180)?255:0):v>t?255:0);if(type==='meanThreshold'||type==='isodata')meta='임계값: '+t.toFixed(2)}
 else if(type==='mean'){for(let c=0;c<3;c++){const plane=Float32Array.from({length:n},(_,i)=>data[4*i+c]),a=avg(plane,w,h,radius);for(let i=0;i<n;i++)out[4*i+c]=a[i]}}
 else if(type==='minimum'||type==='maximum')result=morph(type==='minimum'?'erode':'dilate');
 else if(type==='variance'){const m=avg(g,w,h,radius),sq=avg(g.map(v=>v*v),w,h,radius);result=m.map((v,i)=>Math.max(0,sq[i]-v*v)*(p.gain??.1))}
 else if(['gradient','tophat','blackhat'].includes(type)){const a=morph(type==='gradient'?'dilate':type==='tophat'?'opening':'closing'),b=type==='gradient'?morph('erode'):g;result=a.map((v,i)=>type==='tophat'?b[i]-v:v-b[i])}
 else if(type==='dog'){const a=base(image,'gaussian',{sigma:p.sigma??1}),b=base(image,'gaussian',{sigma:(p.sigma??1)*1.6});for(let i=0;i<out.length;i++)if(i%4!==3)out[i]=Math.abs(a.data[i]-b.data[i])*(p.amount??1)}
 else if(['prewitt','scharr','laplace','emboss'].includes(type)){result=new Float32Array(n);const at=(x,y)=>g[Math.max(0,Math.min(h-1,y))*w+Math.max(0,Math.min(w-1,x))];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(type==='laplace')result[i]=Math.abs(at(x-1,y)+at(x+1,y)+at(x,y-1)+at(x,y+1)-4*g[i])*(p.amount??1);else if(type==='emboss')result[i]=128+(at(x+1,y+1)-at(x-1,y-1))*(p.amount??1);else{const a=type==='scharr'?3:1,b=type==='scharr'?10:1,gx=a*(at(x+1,y-1)-at(x-1,y-1)+at(x+1,y+1)-at(x-1,y+1))+b*(at(x+1,y)-at(x-1,y)),gy=a*(at(x-1,y+1)-at(x-1,y-1)+at(x+1,y+1)-at(x+1,y-1))+b*(at(x,y+1)-at(x,y-1));result[i]=Math.hypot(gx,gy)*(p.gain??1)/(type==='scharr'?4:1)}}}
 else if(type==='outline'){const binary=g.map(v=>v>=128?255:0),eroded=F.gray(base(toImage(binary),'erode',{radius:1}).data);result=binary.map((v,i)=>v-eroded[i])}
 else if(type==='fillholes'||type==='removeSmall'){const binary=g.map(v=>v>=128?255:0),seen=new Uint8Array(n),queue=new Int32Array(n);result=new Float32Array(binary);const neighbors=(i,visit)=>{const x=i%w,y=Math.floor(i/w);if(x)visit(i-1);if(x<w-1)visit(i+1);if(y)visit(i-w);if(y<h-1)visit(i+w)};if(type==='fillholes'){let head=0,tail=0;const push=i=>{if(!seen[i]&&!binary[i]){seen[i]=1;queue[tail++]=i}};for(let x=0;x<w;x++){push(x);push((h-1)*w+x)}for(let y=0;y<h;y++){push(y*w);push(y*w+w-1)}while(head<tail)neighbors(queue[head++],push);for(let i=0;i<n;i++)if(!binary[i]&&!seen[i])result[i]=255}else for(let i=0;i<n;i++)if(binary[i]&&!seen[i]){let head=0,tail=0;queue[tail++]=i;seen[i]=1;while(head<tail)neighbors(queue[head++],j=>{if(binary[j]&&!seen[j]){seen[j]=1;queue[tail++]=j}});if(tail<(p.area??50))for(let k=0;k<tail;k++)result[queue[k]]=0}}
 else if(['flipH','flipV','rotate90','rotate180'].includes(type)){if(type==='rotate90'){width=h;height=w}for(let y=0;y<h;y++)for(let x=0;x<w;x++){const xx=type==='flipH'||type==='rotate180'?w-1-x:type==='rotate90'?h-1-y:x,yy=type==='flipV'||type==='rotate180'?h-1-y:type==='rotate90'?x:y;for(let c=0;c<4;c++)out[(yy*width+xx)*4+c]=data[(y*w+x)*4+c]}}
 if(result)for(let i=0;i<n;i++)out[i*4]=out[i*4+1]=out[i*4+2]=result[i];
 return {width,height,data:out,meta};
};
})();
