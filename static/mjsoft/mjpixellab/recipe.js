(function(root){
function validate(value,definitions){
 if(!value||value.format!=='pixel-lab-recipe'||value.version!==1)throw Error('Pixel Lab 레시피 형식 또는 버전이 올바르지 않습니다.');
 if(!Array.isArray(value.steps)||value.steps.length>16)throw Error('레시피는 최대 16단계까지 지원합니다.');
 const steps=value.steps.map((s,i)=>{
  if(!s||typeof s.type!=='string'||!Object.hasOwn(definitions,s.type))throw Error((i+1)+'단계의 필터를 지원하지 않습니다.');
  const d=definitions[s.type],params={};
  if(!s.params||typeof s.params!=='object'||Array.isArray(s.params))throw Error('파라미터 형식이 잘못되었습니다.');
  const keys=new Set(d.params.map(p=>p[0]));for(const k of Object.keys(s.params))if(!keys.has(k))throw Error('알 수 없는 파라미터: '+k);
  for(const [key,label,min,max,defaultValue,step]of d.params){const n=s.params[key]??defaultValue;if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max||Math.abs((n-min)/step-Math.round((n-min)/step))>1e-5)throw Error((i+1)+'단계 '+label+' 값이 허용 범위를 벗어났습니다.');params[key]=n}
  return {type:s.type,params};
 });
 return {name:typeof value.name==='string'?value.name.slice(0,100):'불러온 레시피',steps};
}
function serialize(name,steps){return {format:'pixel-lab-recipe',version:1,name:name||'새 레시피',processing:{colorDepth:8,maxImageSide:1600},steps:JSON.parse(JSON.stringify(steps))}}
root.PixelRecipe={validate,serialize};if(typeof module!=='undefined')module.exports=root.PixelRecipe;
})(globalThis);
