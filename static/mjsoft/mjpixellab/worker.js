importScripts('filters.js?v=20261029-pixel-stage3','extra-filters.js?v=20261029-pixel-stage3');
onmessage=({data:m})=>{try{let image=m.image;const results=[];for(const step of m.steps){image=PixelFilters.process(image,step.type,step.params);results.push(image)}postMessage({id:m.id,start:m.start,results},results.map(r=>r.data.buffer))}catch(e){postMessage({id:m.id,error:e.message})}};
