
/* Shared behaviour: menu, reveal, counters, cart, filters, forms, etc. */
function failImg(t){
  if(!t||t.tagName!=='IMG'||t.dataset.failed)return;
  t.dataset.failed=1;
  var d=document.createElement('div');
  d.className='img-fallback '+(t.className||'');
  d.setAttribute('role','img');d.setAttribute('aria-label',t.alt||'');
  d.innerHTML='<i class="fa-regular fa-image"></i>';
  t.replaceWith(d);
}
window.addEventListener('error',function(e){failImg(e.target)},true);

document.addEventListener('DOMContentLoaded',function(){
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  $$('img').forEach(function(i){if(i.complete&&i.naturalWidth===0&&i.getAttribute('src'))failImg(i)});

  /* toast */
  var toast=document.createElement('div');toast.className='toast';toast.setAttribute('role','status');
  document.body.appendChild(toast);var tt;
  function say(msg,icon){toast.innerHTML='<i class="fa-solid fa-'+(icon||'circle-check')+'"></i><span>'+msg+'</span>';toast.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('show')},2600)}

  /* drawer menu */
  var nav=$('.main-nav'),burger=$('.nav-toggle');
  if(nav&&burger){
    var ov=document.createElement('div');ov.className='nav-overlay';document.body.appendChild(ov);
    $$('a',nav).forEach(function(a,i){a.style.setProperty('--i',i)});
    var setMenu=function(o){nav.classList.toggle('open',o);ov.classList.toggle('show',o);burger.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':''};
    burger.addEventListener('click',function(){setMenu(!nav.classList.contains('open'))});
    ov.addEventListener('click',function(){setMenu(false)});
    $$('a',nav).forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});
    window.addEventListener('resize',function(){if(innerWidth>960)setMenu(false)});
  }

  /* header state + back to top + active link */
  var hdr=$('[data-header]'),top=document.createElement('button');
  top.className='to-top';top.setAttribute('aria-label','Back to top');top.innerHTML='<i class="fa-solid fa-arrow-up"></i>';document.body.appendChild(top);
  top.addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'})});
  var pend=[],tick=false;
  function sweep(){tick=false;pend=pend.filter(function(el){if(el.classList.contains('in'))return false;var r=el.getBoundingClientRect();if(r.bottom<0){el.classList.add('in');return false}return true})}
  var onScroll=function(){if(!tick){tick=true;requestAnimationFrame(sweep)}var y=scrollY;if(hdr)hdr.classList.toggle('scrolled',y>40);top.classList.toggle('show',y>600)};
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  var links=$$('.main-nav a[href^="#"]'),secs=links.map(function(a){return $(a.getAttribute('href'))}).filter(Boolean);
  if('IntersectionObserver' in window&&secs.length){
    var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){l.classList.toggle('active',l.getAttribute('href')==='#'+e.target.id)})}})},{rootMargin:'-45% 0px -50% 0px'});
    secs.forEach(function(s){so.observe(s)});
  }

  /* reveal on scroll (with stagger) */
  $$('[data-stagger]').forEach(function(p){$$('[data-reveal]',p).forEach(function(c,i){c.style.setProperty('--d',i%8)})});
  var rv=$$('[data-reveal]');pend=rv.slice();
  if('IntersectionObserver' in window){
    var ro=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    rv.forEach(function(el){ro.observe(el)});
  }else rv.forEach(function(el){el.classList.add('in')});

  /* counters */
  var co=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;co.unobserve(e.target);var el=e.target,to=+el.dataset.count,suf=el.dataset.suffix||'',t0=performance.now(),d=1600;
    (function step(t){var p=Math.min((t-t0)/d,1),v=Math.round(to*(1-Math.pow(1-p,3)));el.textContent=v.toLocaleString()+suf;if(p<1)requestAnimationFrame(step)})(t0)})},{threshold:.5});
  $$('[data-count]').forEach(function(el){co.observe(el)});

  /* cart + wishlist */
  var count=0,badge=$('#cart-count');
  $$('.add-cart').forEach(function(b){b.addEventListener('click',function(){
    count++;if(badge){badge.textContent=count;badge.classList.remove('bump');void badge.offsetWidth;badge.classList.add('bump')}
    var o=b.innerHTML;b.innerHTML='<i class="fa-solid fa-check"></i> Added';b.classList.add('added');
    setTimeout(function(){b.innerHTML=o;b.classList.remove('added')},1300);
    say((b.dataset.product||'Item')+' added to your bag','bag-shopping');
  })});
  $$('.wish').forEach(function(b){b.addEventListener('click',function(){var on=b.classList.toggle('on');var i=$('i',b);if(i){i.className=(on?'fa-solid':'fa-regular')+' fa-heart'}if(on)say('Saved to wishlist','heart')})});

  /* search + filter tabs */
  var s=$('#search');
  function apply(){
    var term=s?s.value.toLowerCase().trim():'',act=$('[data-filter].active'),cat=act?act.dataset.filter:'all',n=0;
    $$('[data-cat]').forEach(function(p){
      var ok=(cat==='all'||(' '+p.dataset.cat+' ').indexOf(' '+cat+' ')>-1)&&(!term||(p.dataset.name||p.textContent).toLowerCase().indexOf(term)>-1);
      p.classList.toggle('hide',!ok);if(ok){n++;p.classList.remove('in');void p.offsetWidth;p.classList.add('in')}
    });
    var nr=$('#no-results');if(nr)nr.classList.toggle('hide',n>0);
  }
  if(s)s.addEventListener('input',apply);
  $$('[data-filter]').forEach(function(b){b.addEventListener('click',function(){$$('[data-filter]').forEach(function(x){x.classList.remove('active')});b.classList.add('active');apply()})});

  /* sliders */
  $$('[data-slide]').forEach(function(b){b.addEventListener('click',function(){var tr=$(b.dataset.slide);if(!tr)return;var w=tr.firstElementChild?tr.firstElementChild.getBoundingClientRect().width+20:300;tr.scrollBy({left:(+b.dataset.dir)*w,behavior:'smooth'})})});

  /* faq */
  $$('.faq-q').forEach(function(q){q.addEventListener('click',function(){var it=q.parentElement,o=it.classList.contains('open');$$('.faq-item').forEach(function(x){x.classList.remove('open')});if(!o)it.classList.add('open')})});

  $$('.service').forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')})});

  /* forms */
  $$('form[data-toast]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();say(f.dataset.toast);f.reset()})});
  $$('[data-year]').forEach(function(e){e.textContent=new Date().getFullYear()});

  /* countdown to next Sunday midnight */
  $$('[data-countdown]').forEach(function(box){
    var end=new Date();end.setHours(23,59,59,0);end.setDate(end.getDate()+((7-end.getDay())%7));
    var u={d:$('[data-u=d]',box),h:$('[data-u=h]',box),m:$('[data-u=m]',box),s:$('[data-u=s]',box)};
    var pad=function(n){return String(n).padStart(2,'0')};
    (function tick(){var diff=Math.max(0,end-new Date()),S=Math.floor(diff/1000);
      u.d.textContent=pad(Math.floor(S/86400));u.h.textContent=pad(Math.floor(S%86400/3600));u.m.textContent=pad(Math.floor(S%3600/60));u.s.textContent=pad(S%60);setTimeout(tick,1000)})();
  });

  /* laundry price estimator */
  var calc=$('#calc');
  if(calc){
    var sel=$('select',calc),qty=$('input[type=range]',calc),out=$('#calc-total'),ql=$('#calc-qty'),unit=$('#calc-unit'),exp=$('#calc-express');
    var upd=function(){var o=sel.options[sel.selectedIndex],p=+o.dataset.price,q=+qty.value,t=p*q*(exp&&exp.checked?1.3:1);
      ql.textContent=q;unit.textContent=o.dataset.unit+(q>1?'s':'');out.textContent='\u20A6'+Math.round(t).toLocaleString()};
    [sel,qty,exp].forEach(function(el){el&&el.addEventListener('input',upd)});upd();
  }

  /* age gate (wine) */
  var gate=$('#age-gate');
  if(gate){
    var ok=false;try{ok=sessionStorage.getItem('aged')==='1'}catch(e){}
    if(!ok){gate.classList.add('show');document.body.style.overflow='hidden'}
    var close=function(){gate.classList.remove('show');document.body.style.overflow='';try{sessionStorage.setItem('aged','1')}catch(e){}};
    $('[data-age=yes]',gate).addEventListener('click',close);
    $('[data-age=no]',gate).addEventListener('click',function(){$('.gate-msg',gate).textContent='Sorry, you must be 18 or older to enter this site.'});
  }
});
