const types = ['All', 'Residential', 'Commercial', 'Land & Plots', 'Rental & Lease'];
const $ = s => document.querySelector(s);
let current = 'All';

async function loadProperties() {
  const cards = $('#cards');
  try {
    const res = await fetch('/api/properties?type=' + encodeURIComponent(current));
    const list = await res.json();
    cards.innerHTML = list.length ? list.map(p => `
      <article class="card"><small>${esc(p.type)}</small><h3>${esc(p.title)}</h3>
      <p>${esc(p.location)}</p><p>${esc(p.details)}</p><div class="price">${esc(p.price)}</div></article>`).join('')
      : '<p>No properties in this category yet. Send us an enquiry and we’ll find one for you.</p>';
  } catch { cards.innerHTML = '<p>Could not load properties. Refresh the page to try again.</p>'; }
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function renderFilters() {
  $('#filters').innerHTML = types.map(t => `<button class="${t === current ? 'on' : ''}">${t}</button>`).join('');
}
$('#filters').addEventListener('click', e => {
  if (e.target.tagName !== 'BUTTON') return;
  current = e.target.textContent; renderFilters(); loadProperties();
});
document.querySelectorAll('[data-filter]').forEach(a => a.addEventListener('click', () => {
  current = a.dataset.filter; renderFilters(); loadProperties();
}));
document.querySelectorAll('[data-interest]').forEach(a => a.addEventListener('click', () => {
  document.querySelector('[name=interest]').value = a.dataset.interest;
}));

$('#form').addEventListener('submit', async e => {
  e.preventDefault();
  const status = $('#status');
  status.textContent = 'Sending…';
  try {
    const res = await fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(e.target))) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    status.textContent = 'Thank you. Our advisor will call you shortly.';
    e.target.reset();
  } catch (err) { status.textContent = err.message || 'Could not send. Please try again.'; }
});

$('#yr').textContent = new Date().getFullYear();
renderFilters(); loadProperties();
