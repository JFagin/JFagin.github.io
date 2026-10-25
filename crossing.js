(() => {
  'use strict';
  const data=window.CROSSING_EXAMPLES;
  if(!data) return;
  const get=id=>document.getElementById('crossing-'+id);
  const parameters={
    mass:{label:'Black hole mass',values:['8.75','9.08','9.25'],baseline:1,cases:['log_mass_8.75','reference','log_mass_9.25'],symbol:'log₁₀(M / M☉)'},
    spin:{label:'Black hole spin',values:['−0.74','0','0.74'],baseline:2,cases:['spin_-0.74','spin_0','reference'],symbol:'Dimensionless spin'},
    slope:{label:'Temperature slope',values:['0.6','0.75','0.9'],baseline:1,cases:['beta_0.6','reference','beta_0.9'],symbol:'Temperature slope β'},
    inclination:{label:'Disk inclination',values:['30°','60°','75°'],baseline:1,cases:['inclination_30','reference','inclination_75'],symbol:'Inclination from face-on'},
    angle:{label:'Position angle',values:['0°','45°','90°'],baseline:0,cases:['reference','position_angle_45','position_angle_90'],symbol:'Position angle'},
    corona:{label:'Corona width',values:['1.5 Rg','3 Rg','6 Rg'],baseline:1,cases:['radial_sigma_1.5','reference','radial_sigma_6'],symbol:'Gaussian corona radial width'}
  };
  let orientation='90',key='mass',index=1,request=0;
  const config=()=>key==='angle'&&orientation==='90'
    ? {...parameters.angle,baseline:2,cases:['position_angle_0','position_angle_45','reference']}
    : parameters[key];
  function choices(){
    const p=config();
    get('parameter').title=p.symbol;
    get('values').setAttribute('aria-label',p.symbol);
    get('values').replaceChildren(...p.values.map((v,i)=>{
      const b=document.createElement('button'); b.type='button';b.textContent=v;
      b.setAttribute('aria-label',`${p.label} ${v}${i===p.baseline?', reference':''}`);
      b.addEventListener('click',()=>{index=i;render();});return b;
    }));
  }
  function render(){
    const p=config(),name=p.cases[index],record=data.suites[orientation].cases[name],id=++request;
    const title=name==='reference'?`Reference source · PA ${orientation}°`:`${p.label} ${p.values[index]} · PA ${record.angle}°`;
    const description=`log₁₀(M / M☉) = ${record.mass}, spin ${record.spin}, temperature slope ${record.slope}, inclination ${record.inclination}°, position angle ${record.angle}°, and corona radial width ${record.corona} Rg. The stellar field, driving signal, and corona height are fixed across these examples.`;
    get('values').querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
    get('previous').disabled=index===0;get('next').disabled=index===2;
    get('error').hidden=true;get('status').textContent='Loading '+title;
    get('image').setAttribute('aria-busy','true');
    const preload=new Image();
    preload.onload=()=>{
      if(id!==request)return;
      get('image').src=record.src;
      get('image').alt=title+'. '+description+' Simulated optical and X-ray spectra, light curves and magnification maps.';
      get('image').removeAttribute('aria-busy');
      get('figure').href=record.src;
      get('figure').dataset.title=title;
      get('figure').dataset.caption=description+' X-ray emission is experimental and follow-up measurements are illustrative.';
      get('status').textContent=title+' displayed.';
    };
    preload.onerror=()=>{
      if(id!==request)return;
      get('image').removeAttribute('aria-busy');get('error').hidden=false;
      get('error').textContent='This example could not load. The previous figure is still shown. Try another value.';
      get('status').textContent='Example failed to load.';
    };
    preload.src=record.src;
  }
  get('parameter').addEventListener('change',()=>{key=get('parameter').value;index=config().baseline;choices();render();});
  get('orientation').addEventListener('change',()=>{orientation=get('orientation').value;if(key==='angle')index=config().baseline;choices();render();});
  get('previous').addEventListener('click',()=>{if(index>0){index--;render();}});
  get('next').addEventListener('click',()=>{if(index<2){index++;render();}});
  get('controls').hidden=false;choices();
  // Keep the initial reference lazy until this part of the homepage is visible.
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){observer.disconnect();render();}
    },{rootMargin:'200px'});
    observer.observe(get('image'));
  }else render();
})();
