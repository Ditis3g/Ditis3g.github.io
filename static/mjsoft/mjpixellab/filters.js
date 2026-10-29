(function(root){
const definitions={
 identity:{name:'필터 미선택',description:'이전 단계의 결과를 그대로 보여줍니다. 왼쪽에서 필터를 선택하면 이 단계에 적용됩니다.',params:[],internal:true},
 gray:{name:'그레이스케일',description:'색상을 밝기 영상으로 변환합니다.',params:[]},
 brightness:{name:'밝기 / 대비',description:'밝기를 더하고 중간 밝기 기준으로 대비를 조절합니다.',params:[['brightness','밝기',-100,100,0,1],['contrast','대비',0,3,1,.05]]},
 invert:{name:'반전',description:'각 채널의 밝기를 반전합니다.',params:[]},
 gaussian:{name:'가우시안 블러',description:'가우시안 가중치로 영상을 부드럽게 합니다.',params:[['sigma','시그마',.5,5,1.5,.1]]},
 median:{name:'미디언 필터',description:'주변 픽셀의 중앙값으로 점 노이즈를 줄입니다.',params:[['radius','반경',1,3,1,1]]},
 sharpen:{name:'샤프닝',description:'원본과 흐린 영상의 차이를 강조합니다.',params:[['amount','강도',0,4,1,.1]]},
 threshold:{name:'이진화',description:'지정한 밝기 이상은 흰색, 미만은 검은색으로 바꿉니다.',params:[['threshold','임계값',0,255,128,1]]},
 otsu:{name:'자동 이진화 · Otsu',description:'밝기 히스토그램의 클래스 간 분산을 이용해 임계값을 선택합니다.',params:[]},
 sobel:{name:'엣지 검출 · Sobel',description:'가로·세로 밝기 변화량을 결합해 윤곽을 표시합니다.',params:[['gain','강도',.25,3,1,.05]]},
 erode:{name:'침식 · 최솟값',description:'밝은 영역을 줄입니다. 이진화 후 사용하면 형태학적 침식이 됩니다.',params:[['radius','반경',1,5,1,1]]},
 dilate:{name:'팽창 · 최댓값',description:'밝은 영역을 넓힙니다. 이진화 후 사용하면 형태학적 팽창이 됩니다.',params:[['radius','반경',1,5,1,1]]},
 opening:{name:'열기 · 침식 → 팽창',description:'작은 밝은 점이나 얇은 연결을 제거합니다.',params:[['radius','반경',1,5,1,1]]},
 closing:{name:'닫기 · 팽창 → 침식',description:'작은 어두운 틈이나 구멍을 메웁니다.',params:[['radius','반경',1,5,1,1]]}
};
function gray(data){const g=new Float32Array(data.length/4);for(let i=0;i<g.length;i++)g[i]=.2126*data[i*4]+.7152*data[i*4+1]+.0722*data[i*4+2];return g}
function otsu(g){const h=new Uint32Array(256);for(const v of g)h[Math.round(v)]++;let total=0;for(let i=0;i<256;i++)total+=i*h[i];let count=0,sum=0,best=-1,t=0;for(let i=0;i<256;i++){count+=h[i];sum+=i*h[i];if(!count||count===g.length)continue;const score=count*(g.length-count)*(sum/count-(total-sum)/(g.length-count))**2;if(score>best){best=score;t=i}}return t}
function blur(data,w,h,sigma){const r=Math.ceil(sigma*3),k=[];let sum=0;for(let i=-r;i<=r;i++){const v=Math.exp(-i*i/(2*sigma*sigma));k.push(v);sum+=v}for(let i=0;i<k.length;i++)k[i]/=sum;const tmp=new Float32Array(data.length),out=new Uint8ClampedArray(data);for(let y=0;y<h;y++)for(let x=0;x<w;x++)for(let c=0;c<3;c++){let v=0;for(let j=-r;j<=r;j++)v+=data[(y*w+Math.max(0,Math.min(w-1,x+j)))*4+c]*k[j+r];tmp[(y*w+x)*4+c]=v}for(let y=0;y<h;y++)for(let x=0;x<w;x++)for(let c=0;c<3;c++){let v=0;for(let j=-r;j<=r;j++)v+=tmp[(Math.max(0,Math.min(h-1,y+j))*w+x)*4+c]*k[j+r];out[(y*w+x)*4+c]=v}return out}
function morph(g,w,h,r,max){const out=new Float32Array(g.length);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let v=max?0:255;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const n=g[Math.max(0,Math.min(h-1,y+dy))*w+Math.max(0,Math.min(w-1,x+dx))];v=max?Math.max(v,n):Math.min(v,n)}out[y*w+x]=v}return out}
function process(image,type,p={}){const {width:w,height:h,data}=image;if(type==='identity')return {width:w,height:h,data:new Uint8ClampedArray(data),meta:image.meta||''};let out=new Uint8ClampedArray(data),g=gray(data),meta='';
 if(type==='gaussian')out=blur(data,w,h,p.sigma??1.5);
 else if(type==='sharpen'){const smooth=blur(data,w,h,1);for(let i=0;i<out.length;i++)if(i%4!==3)out[i]=data[i]+(p.amount??1)*(data[i]-smooth[i])}
 else if(type==='brightness'||type==='invert'){for(let i=0;i<out.length;i++)if(i%4!==3)out[i]=type==='invert'?255-data[i]:(data[i]-127.5)*(p.contrast??1)+127.5+(p.brightness??0)}
 else{if(type==='otsu'){const t=otsu(g);meta='Otsu 임계값: '+t;g=g.map(v=>v>t?255:0)}
 else if(type==='threshold')g=g.map(v=>v>=(p.threshold??128)?255:0);
 else if(type==='erode'||type==='dilate')g=morph(g,w,h,p.radius??1,type==='dilate');
 else if(type==='opening'||type==='closing'){const first=type==='closing';g=morph(morph(g,w,h,p.radius??1,first),w,h,p.radius??1,!first)}
 else if(type==='median'){const next=new Float32Array(g.length),r=p.radius??1;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=[];for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)a.push(g[Math.max(0,Math.min(h-1,y+dy))*w+Math.max(0,Math.min(w-1,x+dx))]);a.sort((a,b)=>a-b);next[y*w+x]=a[a.length>>1]}g=next}
 else if(type==='sobel'){const next=new Float32Array(g.length);const at=(x,y)=>g[Math.max(0,Math.min(h-1,y))*w+Math.max(0,Math.min(w-1,x))];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const gx=-at(x-1,y-1)+at(x+1,y-1)-2*at(x-1,y)+2*at(x+1,y)-at(x-1,y+1)+at(x+1,y+1),gy=-at(x-1,y-1)-2*at(x,y-1)-at(x+1,y-1)+at(x-1,y+1)+2*at(x,y+1)+at(x+1,y+1);next[y*w+x]=Math.hypot(gx,gy)*(p.gain??1)}g=next}
 for(let i=0;i<g.length;i++)out[i*4]=out[i*4+1]=out[i*4+2]=g[i];}
 return {width:w,height:h,data:out,meta};}
root.PixelFilters={definitions,process,gray};if(typeof module!=='undefined')module.exports=root.PixelFilters;
})(globalThis);
