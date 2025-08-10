
// Crosera static front-end (localStorage-based)
// Owner email for mailto actions:
const OWNER_EMAIL = 'chronoslord54@gmail.com';
const ADMIN_PASSWORD = 'motherforever'; // change by exporting/importing data or editing file if desired

// Default data
const DEFAULT_PRODUCTS = [
  {id:'1', name:'Crochet Scarf', description:'Soft and warm handmade scarf.', price:25.00, image:'frontend/images/products/scarf.svg'},
  {id:'2', name:'Crochet Hat', description:'Cozy handmade hat.', price:20.00, image:'frontend/images/products/hat.svg'}
];

const DEFAULT_SETTINGS = {
  about: "Hi — I'm the maker behind Crosera. I craft each item with care and the hope it becomes a cherished piece.",
  care: "Hand wash cold. Lay flat to dry. Do not bleach.",
  colors: { primary:'#ffdac1', accent:'#ff9aa2' }
};

// Utilities
function $(s){ return document.querySelector(s) }
function $all(s){ return Array.from(document.querySelectorAll(s)) }

// Load and Save
function loadData(){
  const stored = localStorage.getItem('crosera_data');
  if(stored){
    try{
      const parsed = JSON.parse(stored);
      return parsed;
    }catch(e){
      console.warn('Could not parse stored data', e);
    }
  }
  return { products: DEFAULT_PRODUCTS.slice(), settings: DEFAULT_SETTINGS };
}
function saveData(data){
  localStorage.setItem('crosera_data', JSON.stringify(data));
  applySettings(data.settings);
}

let app = loadData();
applySettings(app.settings);

// Rendering products
function renderProducts(){
  const grid = $('#product-grid');
  grid.innerHTML = '';
  app.products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.image}" alt="${escapeHtml(p.name)}">
      <h3>${escapeHtml(p.name)}</h3>
      <p>${escapeHtml(p.description)}</p>
      <div style="display:flex;gap:10px;align-items:center;justify-content:center;margin-top:8px;">
        <strong>$${Number(p.price).toFixed(2)}</strong>
        <button class="btn" data-add="${p.id}">Add to Cart</button>
      </div>
    `;
    grid.appendChild(card);
  });
  // attach add handlers
  $all('[data-add]').forEach(btn => {
    btn.addEventListener('click', ()=> addToCart(btn.getAttribute('data-add')));
  });
}

// Cart handling (localStorage)
function getCart(){ return JSON.parse(localStorage.getItem('crosera_cart')||'{}'); }
function saveCart(cart){ localStorage.setItem('crosera_cart', JSON.stringify(cart)); updateCartCount(); }
function addToCart(id){
  const cart = getCart();
  cart[id] = (cart[id]||0) + 1;
  saveCart(cart);
  alert('Item added to cart!');
}
function updateCartCount(){
  const cart = getCart();
  const count = Object.values(cart).reduce((s,n)=>s+Number(n),0);
  $('#cart-count').textContent = count;
}
function openCart(){
  const modal = $('#cart-modal');
  const itemsDiv = $('#cart-items');
  itemsDiv.innerHTML = '';
  const cart = getCart();
  if(Object.keys(cart).length === 0){
    itemsDiv.innerHTML = '<p>Your cart is empty.</p>';
  } else {
    const list = document.createElement('div');
    let total = 0;
    Object.entries(cart).forEach(([id,qty])=>{
      const p = app.products.find(x=>x.id===id);
      if(!p) return;
      const row = document.createElement('div');
      row.style.display='flex'; row.style.justifyContent='space-between'; row.style.alignItems='center'; row.style.padding='8px 0';
      row.innerHTML = `<div style="flex:1"><strong>${escapeHtml(p.name)}</strong><div style="font-size:13px">${escapeHtml(p.description)}</div></div>
        <div style="width:120px;text-align:right">
          <input type="number" min="0" value="${qty}" data-q="${escapeHtml(id)}" style="width:60px;padding:6px;border-radius:6px;border:1px solid #ddd;">
          <div style="margin-top:6px;"><strong>$${(p.price*qty).toFixed(2)}</strong></div>
        </div>`;
      list.appendChild(row);
      total += p.price * qty;
    });
    const totalDiv = document.createElement('div');
    totalDiv.style.textAlign='right'; totalDiv.style.padding='12px 0';
    totalDiv.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
    itemsDiv.appendChild(list);
    itemsDiv.appendChild(totalDiv);

    // attach change handlers
    itemsDiv.querySelectorAll('[data-q]').forEach(input => {
      input.addEventListener('change', ()=>{
        const id = input.getAttribute('data-q');
        const val = Number(input.value);
        const cart = getCart();
        if(val <= 0){ delete cart[id]; }
        else cart[id] = val;
        saveCart(cart);
        openCart(); // refresh
      });
    });
  }
  modal.classList.remove('hidden');
}

// Checkout - creates mailto link with order details for the owner
function checkout(){
  const cart = getCart();
  if(Object.keys(cart).length === 0){ alert('Cart is empty.'); return; }
  let body = 'New order from Crosera:%0D%0A%0D%0A';
  let total = 0;
  Object.entries(cart).forEach(([id,qty])=>{
    const p = app.products.find(x=>x.id===id);
    if(!p) return;
    body += `${p.name} — Qty: ${qty} — $${(p.price*qty).toFixed(2)}%0D%0A`;
    total += p.price * qty;
  });
  body += `%0D%0ATotal: $${total.toFixed(2)}%0D%0A%0D%0A`;
  body += 'Customer Details:%0D%0AName:%0D%0AEmail:%0D%0APhone:%0D%0AAddress:%0D%0A%0D%0A(Please replace the fields above with customer details before sending)%0D%0A';
  const subject = encodeURIComponent('Crosera - New Order');
  const mailto = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;
  // open mail client
  window.location.href = mailto;
}

// Admin & settings
function applySettings(settings){
  if(!settings) return;
  document.getElementById('about-content').innerText = settings.about || '';
  document.getElementById('care-content').innerText = settings.care || '';
  document.documentElement.style.setProperty('--primary', settings.colors?.primary || '#ffdac1');
  document.documentElement.style.setProperty('--accent', settings.colors?.accent || '#ff9aa2');
  // set admin color inputs if present
  if($('#color-primary')) $('#color-primary').value = settings.colors?.primary || '#ffdac1';
  if($('#color-accent')) $('#color-accent').value = settings.colors?.accent || '#ff9aa2';
  if($('#about-edit')) $('#about-edit').value = settings.about || '';
  if($('#care-edit')) $('#care-edit').value = settings.care || '';
}
function openAdminPanel(){
  $('#admin-panel').classList.remove('hidden');
  renderAdminProducts();
}
function closeAdminPanel(){ $('#admin-panel').classList.add('hidden'); }
function renderAdminProducts(){
  const list = $('#admin-products-list');
  list.innerHTML = '';
  app.products.forEach(p => {
    const row = document.createElement('div');
    row.style.display='flex'; row.style.justifyContent='space-between'; row.style.alignItems='center'; row.style.padding='8px 0';
    row.innerHTML = `<div style="flex:1"><strong>${escapeHtml(p.name)}</strong><div style="font-size:13px">${escapeHtml(p.description)}</div></div>
      <div style="min-width:160px;text-align:right">
        <button class="btn small" data-edit="${p.id}">Edit</button>
        <button class="btn alt" data-del="${p.id}">Delete</button>
      </div>`;
    list.appendChild(row);
  });
  // attach handlers
  $all('[data-edit]').forEach(b => b.addEventListener('click', ()=> startEditProduct(b.getAttribute('data-edit'))));
  $all('[data-del]').forEach(b => b.addEventListener('click', ()=> { if(confirm('Delete this product?')){ deleteProduct(b.getAttribute('data-del')); } }));
}

function startEditProduct(id){
  const p = app.products.find(x=>x.id===id);
  if(!p) return;
  $('#product-id').value = p.id;
  $('#product-name').value = p.name;
  $('#product-desc').value = p.description;
  $('#product-price').value = p.price;
  if(p.image) $('#image-preview').innerHTML = `<img src="${p.image}" style="max-width:160px;border-radius:8px">`;
  openAdminPanel(); // ensure visible
  document.getElementById('product-name').focus();
}
function deleteProduct(id){
  app.products = app.products.filter(x=>x.id!==id);
  saveData(app);
  renderProducts();
  renderAdminProducts();
}

function resetProductForm(){
  $('#product-id').value='';
  $('#product-name').value='';
  $('#product-desc').value='';
  $('#product-price').value='';
  $('#product-image').value='';
  $('#image-preview').innerHTML='';
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderProducts();
  updateCartCount();
  // cart handlers
  $('#cart-button').addEventListener('click', openCart);
  $('#close-cart').addEventListener('click', ()=> $('#cart-modal').classList.add('hidden'));
  $('#checkout-btn').addEventListener('click', checkout);

  // admin request modal
  $('#admin-request-btn').addEventListener('click', ()=> $('#admin-request-modal').classList.remove('hidden'));
  $('#close-request').addEventListener('click', ()=> $('#admin-request-modal').classList.add('hidden'));
  $('#admin-request-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = $('#requester-name').value.trim();
    if(!name) return alert('Please enter your name.');
    // open mail client (mailto) to notify owner
    const subject = encodeURIComponent('Admin access request - Crosera');
    const body = encodeURIComponent(`Admin access request from: ${name}%0D%0APlease approve or deny.`);
    window.location.href = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;
  });

  // admin login modal
  $('#admin-login-btn').addEventListener('click', ()=> $('#admin-login-modal').classList.remove('hidden'));
  $('#close-admin-login').addEventListener('click', ()=> $('#admin-login-modal').classList.add('hidden'));
  $('#admin-login-submit').addEventListener('click', ()=>{
    const val = $('#admin-password-input').value;
    if(val === ADMIN_PASSWORD){
      $('#admin-login-modal').classList.add('hidden');
      openAdminPanel();
    } else {
      alert('Incorrect password.');
    }
    $('#admin-password-input').value='';
  });

  // admin panel close
  $('#close-admin-panel').addEventListener('click', closeAdminPanel);
  $('#logout-admin').addEventListener('click', ()=>{ closeAdminPanel(); alert('Logged out.'); });

  // product form save
  $('#product-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    const id = $('#product-id').value || (Date.now().toString());
    const name = $('#product-name').value.trim();
    const desc = $('#product-desc').value.trim();
    const price = parseFloat($('#product-price').value) || 0;
    let image = null;
    const preview = $('#image-preview img');
    if(preview) image = preview.src;
    // if editing, replace
    const existing = app.products.find(x=>x.id===id);
    if(existing){
      existing.name = name; existing.description = desc; existing.price = price;
      if(image) existing.image = image;
    } else {
      app.products.push({id, name, description:desc, price, image: image || ''});
    }
    saveData(app);
    resetProductForm();
    renderProducts();
    renderAdminProducts();
  });

  // image upload preview for product form
  $('#product-image').addEventListener('change', (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = function(ev){
      $('#image-preview').innerHTML = `<img src="${ev.target.result}" style="max-width:160px;border-radius:8px">`;
    };
    reader.readAsDataURL(f);
  });
  $('#cancel-product').addEventListener('click', resetProductForm);

  // settings save
  $('#save-settings').addEventListener('click', ()=>{
    app.settings.about = $('#about-edit').value;
    app.settings.care = $('#care-edit').value;
    app.settings.colors.primary = $('#color-primary').value;
    app.settings.colors.accent = $('#color-accent').value;
    saveData(app);
    renderProducts();
    alert('Settings saved.');
  });

  // export / import
  $('#export-data').addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(app, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'crosera_data.json'; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });
  $('#import-data').addEventListener('change', (e)=>{
    const f = e.target.files[0]; if(!f) return;
    const reader = new FileReader();
    reader.onload = (ev)=>{
      try{
        const parsed = JSON.parse(ev.target.result);
        if(parsed.products && parsed.settings){
          app = parsed;
          saveData(app);
          renderProducts();
          renderAdminProducts();
          alert('Data imported.');
        } else alert('Invalid file format.');
      }catch(err){ alert('Could not read file.'); }
    };
    reader.readAsText(f);
  });

  // quick open admin if data empty
  renderAdminProducts();
});

// helper escape
function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"}[m];}); }
