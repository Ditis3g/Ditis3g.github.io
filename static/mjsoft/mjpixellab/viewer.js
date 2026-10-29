/* View coordinates are CSS pixels; image coordinates are original image pixels. */
(function(root){
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
function fitTransform(w,h,vw,vh){const scale=Math.max(.001,Math.min((vw-32)/w,(vh-32)/h,1));return {scale,x:(vw-w*scale)/2,y:(vh-h*scale)/2}}
function zoomAt(t,scale,point){scale=clamp(scale,.001,32);return {scale,x:point.x-(point.x-t.x)*scale/t.scale,y:point.y-(point.y-t.y)*scale/t.scale}}
function imagePoint(t,p){return {x:(p.x-t.x)/t.scale,y:(p.y-t.y)/t.scale}}
class Viewer{
 constructor(stage,canvas,onChange,onPixel){
  this.stage=stage;this.canvas=canvas;this.onChange=onChange;this.onPixel=onPixel;this.image=null;this.transform={scale:1,x:0,y:0};this.mode='fit';this.tool='hand';this.pointers=new Map();
  const local=e=>{const r=stage.getBoundingClientRect();return {x:e.clientX-r.left-stage.clientLeft,y:e.clientY-r.top-stage.clientTop}};
  stage.addEventListener('wheel',e=>{if(!this.image)return;e.preventDefault();const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?stage.clientHeight:1);this.setZoom(this.transform.scale*Math.exp(-clamp(delta,-400,400)*.002),local(e))},{passive:false});
  stage.addEventListener('pointerdown',e=>{
   if(!this.image||![0,1].includes(e.button))return;e.preventDefault();stage.focus({preventScroll:true});
   if(this.tool==='zoom'&&e.pointerType!=='touch'&&!this.space&&e.button!==1){this.setZoom(this.transform.scale*(e.altKey?.8:1.25),local(e));return}
   stage.setPointerCapture(e.pointerId);this.pointers.set(e.pointerId,local(e));this.gesture();stage.classList.add('dragging');
  });
  stage.addEventListener('pointermove',e=>{
   const p=local(e);if(this.pointers.has(e.pointerId)){this.pointers.set(e.pointerId,p);const points=[...this.pointers.values()];this.mode='manual';
    if(points.length>=2&&this.pinch){const c={x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2},distance=Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y),scale=clamp(this.pinch.scale*distance/this.pinch.distance,.001,32);this.transform={scale,x:c.x-this.pinch.image.x*scale,y:c.y-this.pinch.image.y*scale}}
    else if(this.drag){this.transform.x+=p.x-this.drag.x;this.transform.y+=p.y-this.drag.y;this.drag=p}
    this.apply();
   }
   if(this.image){const pImage=imagePoint(this.transform,p),x=Math.floor(pImage.x),y=Math.floor(pImage.y);if(x>=0&&y>=0&&x<this.image.width&&y<this.image.height){const i=(y*this.image.width+x)*4;this.onPixel({x,y,rgba:Array.from(this.image.data.slice(i,i+4))})}else this.onPixel(null)}
  });
  const release=e=>{this.pointers.delete(e.pointerId);this.gesture();if(!this.pointers.size)stage.classList.remove('dragging')};
  stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);stage.addEventListener('pointerleave',()=>{if(!this.pointers.size)this.onPixel(null)});
  stage.addEventListener('dblclick',()=>this.fit());stage.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();this.space=true;stage.classList.add('temporary-hand')}});stage.addEventListener('keyup',e=>{if(e.code==='Space'){this.space=false;stage.classList.remove('temporary-hand')}});stage.addEventListener('blur',()=>{this.space=false;stage.classList.remove('temporary-hand')});
  this.size={width:stage.clientWidth,height:stage.clientHeight};
  new ResizeObserver(()=>{const size={width:stage.clientWidth,height:stage.clientHeight};if(this.image){if(this.mode==='fit')this.fit();else{this.transform.x+=(size.width-this.size.width)/2;this.transform.y+=(size.height-this.size.height)/2;this.apply()}}this.size=size}).observe(stage);
 }
 gesture(){const p=[...this.pointers.values()];this.drag=p.length===1?p[0]:null;this.pinch=p.length>=2?{distance:Math.max(1,Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)),scale:this.transform.scale,image:imagePoint(this.transform,{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2})}:null}
 show(image,reset=false){
  const changed=image&&(image.width!==this.width||image.height!==this.height);this.image=image||null;this.canvas.hidden=!image;this.stage.classList.toggle('no-image',!image);if(!image){this.onPixel(null);return}
  this.canvas.width=image.width;this.canvas.height=image.height;this.canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(image.data),image.width,image.height),0,0);this.width=image.width;this.height=image.height;this.canvas.style.width=image.width+'px';this.canvas.style.height=image.height+'px';
  if(reset||changed||this.mode==='fit')this.fit();else this.apply();
 }
 fit(){if(!this.image)return;this.mode='fit';this.transform=fitTransform(this.width,this.height,this.stage.clientWidth,this.stage.clientHeight);this.apply()}
 setZoom(scale,point={x:this.stage.clientWidth/2,y:this.stage.clientHeight/2}){if(!this.image)return;this.mode='manual';this.transform=zoomAt(this.transform,scale,point);this.apply()}
 setTool(tool){this.tool=tool;this.stage.dataset.tool=tool}
 apply(){const {scale,x,y}=this.transform;this.canvas.style.transform=`translate(${x}px,${y}px) scale(${scale})`;this.canvas.style.imageRendering=scale>=2?'pixelated':'auto';this.onChange({scale,mode:this.mode})}
}
root.PixelViewport={Viewer,fitTransform,zoomAt,imagePoint};if(typeof module!=='undefined')module.exports=root.PixelViewport;
})(globalThis);
