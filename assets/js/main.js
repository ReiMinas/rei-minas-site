(() => {
  const PHONE = '5532984550570';
  const products = window.REI_MINAS_PRODUCTS || [];
  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  const menuBtn = q('#menuBtn'); const nav = q('#mainNav');
  menuBtn?.addEventListener('click', () => { const open = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', String(open)); });
  qa('#mainNav a').forEach(a => a.addEventListener('click', () => { nav?.classList.remove('open'); menuBtn?.setAttribute('aria-expanded','false'); }));

  const year = q('#year'); if(year) year.textContent = new Date().getFullYear();

  let memoryCart = [];
  const getCart = () => {
    try { return JSON.parse(localStorage.getItem('reiMinasQuote') || '[]'); }
    catch (_) { return memoryCart; }
  };
  const saveCart = cart => {
    memoryCart = cart;
    try { localStorage.setItem('reiMinasQuote', JSON.stringify(cart)); } catch (_) {}
    renderCart();
  };
  const addToCart = id => { const cart=getCart(); const item=cart.find(x=>x.id===id); item ? item.qty++ : cart.push({id,qty:1}); saveCart(cart); openDrawer(); };
  const removeFromCart = id => saveCart(getCart().filter(x=>x.id!==id));

  const drawer=q('#quoteDrawer'), backdrop=q('#drawerBackdrop');
  const openDrawer=()=>{drawer?.classList.add('open');backdrop?.classList.add('open');drawer?.setAttribute('aria-hidden','false')};
  const closeDrawer=()=>{drawer?.classList.remove('open');backdrop?.classList.remove('open');drawer?.setAttribute('aria-hidden','true')};
  q('#quoteFab')?.addEventListener('click',openDrawer); q('#drawerClose')?.addEventListener('click',closeDrawer); backdrop?.addEventListener('click',closeDrawer);

  function renderCart(){
    const cart=getCart(), body=q('#quoteItems'), count=q('#quoteCount');
    if(count) count.textContent=cart.reduce((a,b)=>a+b.qty,0);
    if(!body) return;
    if(!cart.length){ body.innerHTML='<p class="form-note">Sua cotação está vazia. Adicione produtos do catálogo.</p>'; return; }
    body.innerHTML=cart.map(it=>{const p=products.find(x=>x.id===it.id);if(!p)return'';return `<div class="quote-item"><img src="${p.image}" alt=""><div><strong>${esc(p.name)}</strong><small>Quantidade: ${it.qty}</small></div><button data-remove="${p.id}" aria-label="Remover ${esc(p.name)}">Remover</button></div>`}).join('');
    qa('[data-remove]').forEach(b=>b.onclick=()=>removeFromCart(b.dataset.remove));
  }

  q('#sendQuote')?.addEventListener('click',()=>{
    const cart=getCart(); if(!cart.length){alert('Adicione pelo menos um produto à cotação.');return;}
    const lines=cart.map(it=>{const p=products.find(x=>x.id===it.id);return `• ${p?.name||it.id} — qtd. ${it.qty}`});
    const text=`Olá, Rei Minas! Gostaria de solicitar uma cotação comercial:\n\n${lines.join('\n')}\n\nCidade/empresa: `;
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`,'_blank','noopener');
  });

  function productCard(p){return `<article class="product-card" data-category="${esc(p.category.toLowerCase())}" data-name="${esc((p.name+' '+p.flavors.join(' ')).toLowerCase())}"><div class="product-media"><img src="${p.image}" alt="${esc(p.name)}"></div><div class="product-body"><span class="product-kicker">${esc(p.category)} · ${esc(p.size)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="chips">${p.flavors.map(f=>`<span class="chip">${esc(f)}</span>`).join('')}</div><div class="card-actions"><button class="btn btn-outline" data-detail="${p.id}">Ver detalhes</button><button class="btn btn-primary" data-add="${p.id}">Cotação</button></div></div></article>`}
  const catalog=q('#catalogGrid'); if(catalog){catalog.innerHTML=products.map(productCard).join('');}
  qa('[data-add]').forEach(b=>b.addEventListener('click',()=>addToCart(b.dataset.add)));

  const modal=q('#productModal'), modalContent=q('#modalInner');
  const closeModal=()=>modal?.classList.remove('open'); q('#modalClose')?.addEventListener('click',closeModal); modal?.addEventListener('click',e=>{if(e.target===modal)closeModal()});
  qa('[data-detail]').forEach(b=>b.addEventListener('click',()=>{const p=products.find(x=>x.id===b.dataset.detail);if(!p||!modalContent)return;modalContent.innerHTML=`<div class="modal-grid"><div class="modal-media"><img src="${p.image}" alt="${esc(p.name)}"></div><div class="modal-content"><span class="product-kicker">${esc(p.category)} · ${esc(p.size)}</span><h2>${esc(p.name)}</h2><p>${esc(p.description)}</p><h3>Sabores / opção</h3><div class="chips">${p.flavors.map(f=>`<span class="chip">${esc(f)}</span>`).join('')}</div><p class="form-note">Disponibilidade comercial, quantidade mínima e rota de entrega devem ser confirmadas com a equipe Rei Minas.</p><button class="btn btn-primary" id="modalAdd">Adicionar à cotação</button></div></div>`;modal.classList.add('open');q('#modalAdd').onclick=()=>{addToCart(p.id);closeModal();}}));

  const search=q('#catalogSearch'); const filterBtns=qa('[data-filter]'); let current='all';
  function applyFilter(){ const term=(search?.value||'').toLowerCase().trim(); qa('#catalogGrid .product-card').forEach(c=>{const okCat=current==='all'||c.dataset.category===current;const okTerm=!term||c.dataset.name.includes(term);c.classList.toggle('hidden',!(okCat&&okTerm));});}
  search?.addEventListener('input',applyFilter); filterBtns.forEach(b=>b.addEventListener('click',()=>{current=b.dataset.filter;filterBtns.forEach(x=>x.classList.toggle('active',x===b));applyFilter();}));

  qa('form[data-whatsapp-form]').forEach(form=>form.addEventListener('submit',e=>{
    e.preventDefault(); if(!form.reportValidity()) return;
    const fd=new FormData(form), title=form.dataset.title||'Atendimento pelo site';
    const lines=[...fd.entries()].filter(([,v])=>String(v).trim()).map(([k,v])=>`${k}: ${v}`);
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(`Olá, Rei Minas! ${title}\n\n${lines.join('\n')}`)}`,'_blank','noopener');
  }));

  document.addEventListener('keydown', e => { if(e.key === 'Escape'){ closeDrawer(); closeModal(); } });
  renderCart();
})();
