// PSX: OG Values — data loading + rendering
let pets = [];
let changes = [];
let seedPets = [];
let defaultChanges = [];
let currentRoute = location.hash.replace("#","") || "home";
let currentPage = 1;
const perPage = 12;
let calcOffers = { yours: [], theirs: [] };

const EXCLUSIVE_TIERS = ["Huges", "Exclusives", "Titanics"];
const $ = (s) => document.querySelector(s);
const fmt = (n) => {
  if (n >= 1e12) return (n/1e12).toFixed(2).replace(/\.00$/,"") + "T";
  if (n >= 1e9) return (n/1e9).toFixed(2).replace(/\.00$/,"") + "B";
  if (n >= 1e6) return (n/1e6).toFixed(2).replace(/\.00$/,"") + "M";
  if (n >= 1e3) return (n/1e3).toFixed(2).replace(/\.00$/,"") + "K";
  return n.toLocaleString();
};
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");

function formatDate(d) {
  const dt = new Date(d);
  if (isNaN(dt)) return d || "—";
  return dt.toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"});
}

function lastUpdatedLabel() {
  const dates = changes.map(c => new Date(c.date)).filter(d => !isNaN(d));
  if (!dates.length) return "—";
  return formatDate(new Date(Math.max(...dates)));
}

function save() {
  $("#footerUpdated").textContent = "Last updated " + lastUpdatedLabel();
}

async function init() {
  try {
    const res = await fetch("data.json", { cache: "no-store" });
    const data = await res.json();
    seedPets = data.seedPets;
    defaultChanges = data.defaultChanges;
  } catch (err) {
    console.error("Could not load data.json:", err);
  }

  pets = seedPets.map(x => ({...x}));
  changes = defaultChanges.map(x => ({...x}));

  $("#footerUpdated").textContent = "Last updated " + lastUpdatedLabel();
  route();
}

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg; el.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove("show"), 2300);
}

// Pet images live in assets/pets/<slug>.png. If one's missing (or you
// haven't added images yet) it just falls back to a paw icon — the emoji
// per pet is shown next to the name instead, so nothing's lost either way.
function petImageMarkup(p) {
  const src = p.image || `assets/pets/${slugify(p.name)}.png`;
  return `<div class="pet-image">
    <img src="${src}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
    <div class="pet-image-fallback">🐾</div>
  </div>`;
}

function demandBadge(d) {
  if (d >= 9) return {text:"🔥 High demand", cls:""};
  if (d >= 7) return {text:"📈 Rising", cls:""};
  if (d <= 3) return {text:"💤 Slow", cls:"slow"};
  return null;
}

function petCard(p) {
  const badge = demandBadge(p.demand);
  return `<article class="pet-card" data-id="${p.id}" onclick="showPet(${p.id})">
    <div class="pet-stat-strip"><span>DMD <b>${p.demand}/10</b></span><span>${formatDate(p.release)}</span></div>
    ${petImageMarkup(p)}
    <div class="pet-name">${p.emoji ? p.emoji + " " : ""}${esc(p.name)}</div>
    <div class="pet-type">${esc(p.category)} · ${esc(p.variant)}</div>
    <div class="pet-tags">
      ${badge ? `<span class="tag tag-badge ${badge.cls}">${badge.text}</span>` : ""}
    </div>
    <div class="pet-row"><span class="value">${fmt(p.value)}</span><span class="${p.change >= 0 ? "up":"down"}">${p.change > 0 ? "+" : ""}${p.change}%</span></div>
  </article>`;
}

function renderHome() {
  const top = [...pets].sort((a,b)=>b.value-a.value).slice(0,5);
  const recent = [...changes].slice(0,5);
  const exclusiveCount = pets.filter(p => EXCLUSIVE_TIERS.includes(p.category)).length;
  $("#app").innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <div class="eyebrow">Pet Simulator X</div>
        <h1>Know what your<br><span class="grad">pets are worth.</span></h1>
        <p>Values get checked against trades and market activity, not guessed. Look a pet up, see what it's done lately, and run the numbers before you commit to a deal.</p>
        <div class="hero-actions">
          <a class="btn primary" href="#values">Browse values →</a>
          <a class="btn ghost" href="#calculator">Open calculator</a>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat"><b>${pets.length}</b><span>Pets tracked</span></div>
        <div class="stat"><b>${exclusiveCount}</b><span>Exclusives &amp; huges</span></div>
        <div class="stat stat-date"><b>${lastUpdatedLabel()}</b><span>Last synced</span></div>
      </div>
    </section>

    <div class="section-head">
      <div><h2>Recent movement</h2><p>Values that shifted lately.</p></div>
    </div>
    <section class="changes-grid">${recent.map(c => `
      <div class="change-card">
        <div class="change-top"><span class="change-name">${esc(c.pet)}</span><span class="${c.percent >= 0 ? "up":"down"}">${c.percent >= 0 ? "+" : ""}${c.percent}%</span></div>
        <div class="change-value"><span class="change-old">${fmt(c.old)} →</span><span class="change-new">${fmt(c.current)}</span></div>
        <div class="change-meta"><span>Demand ${c.demand}/10</span><span>${formatDate(c.date)}</span></div>
      </div>`).join("")}</section>

    <div class="section-head">
      <div><h2>Highest values</h2><p>The most expensive pets in the list right now.</p></div>
      <a class="btn" href="#values">See full list</a>
    </div>
    <section class="pet-grid">${top.map(petCard).join("")}</section>
  `;
}

function renderValues() {
  $("#app").innerHTML = `
    <div class="page-title"><h1>Values</h1><p>Filter by category, sort by whatever matters to you, and compare variants side by side.</p></div>
    <div class="toolbar">
      <input id="search" class="field" placeholder="Search for a pet…" autocomplete="off">
      <select id="sort" class="field">
        <option value="default">Default sort</option>
        <option value="high">Value: High to Low</option>
        <option value="low">Value: Low to High</option>
        <option value="az">Name: A to Z</option>
        <option value="demand">Demand: High to Low</option>
        <option value="release">Release Date: New to Old</option>
      </select>
      <select id="variant" class="field">
        <option>All Variants</option><option>Normal</option><option>Golden</option>
        <option>Rainbow</option><option>Dark Matter</option><option>Glitched</option>
      </select>
      <select id="category" class="field">
        <option>All</option><option>Huges</option><option>Exclusives</option><option>Titanics</option><option>Other</option>
      </select>
    </div>
    <div class="filters-row" id="chips">
      <button class="chip active" data-cat="All">All</button>
      <button class="chip" data-cat="Huges">Huges</button>
      <button class="chip" data-cat="Exclusives">Exclusives</button>
      <button class="chip" data-cat="Titanics">Titanics</button>
      <button class="chip" data-cat="Other">Other</button>
    </div>
    <div class="results-meta" id="resultsMeta"></div>
    <section class="pet-grid" id="petGrid"></section>
    <div class="pagination" id="pagination"></div>
  `;
  $("#search").addEventListener("input", ()=>{currentPage=1; updateValues();});
  $("#sort").addEventListener("change", ()=>{currentPage=1; updateValues();});
  $("#variant").addEventListener("change", ()=>{currentPage=1; updateValues();});
  $("#category").addEventListener("change", ()=>{currentPage=1; updateValues();});
  document.querySelectorAll("#chips .chip").forEach(btn => btn.addEventListener("click", ()=>{
    $("#category").value = btn.dataset.cat; currentPage=1;
    document.querySelectorAll("#chips .chip").forEach(x=>x.classList.remove("active")); btn.classList.add("active");
    updateValues();
  }));
  updateValues();
}

function updateValues() {
  const q = $("#search").value.trim().toLowerCase();
  const cat = $("#category").value;
  const variant = $("#variant").value;
  let list = pets.filter(p =>
    (!q || p.name.toLowerCase().includes(q)) &&
    (cat === "All" || p.category === cat) &&
    (variant === "All Variants" || p.variant === variant)
  );
  const sort = $("#sort").value;
  if(sort==="high") list.sort((a,b)=>b.value-a.value);
  if(sort==="low") list.sort((a,b)=>a.value-b.value);
  if(sort==="az") list.sort((a,b)=>a.name.localeCompare(b.name));
  if(sort==="demand") list.sort((a,b)=>b.demand-a.demand || b.value-a.value);
  if(sort==="release") list.sort((a,b)=>new Date(b.release)-new Date(a.release));
  const totalPages = Math.max(1, Math.ceil(list.length/perPage));
  currentPage = Math.min(currentPage,totalPages);
  const pageItems = list.slice((currentPage-1)*perPage,currentPage*perPage);
  $("#resultsMeta").textContent = `${list.length} result${list.length===1?"":"s"} · page ${currentPage} of ${totalPages}`;
  $("#petGrid").innerHTML = pageItems.length ? pageItems.map(petCard).join("") : `<div class="panel empty">Nothing matches that search. Try a different name or clear the filters.</div>`;
  $("#pagination").innerHTML = Array.from({length:totalPages},(_,i)=>`<button class="btn ${i+1===currentPage?"primary":""}" onclick="goPage(${i+1})">${i+1}</button>`).join("");
}
function goPage(n){currentPage=n;updateValues();window.scrollTo({top:0,behavior:"smooth"});}

function showPet(id) {
  const p = pets.find(x=>x.id===id); if(!p) return;
  const badge = demandBadge(p.demand);
  const backdrop=document.createElement("div");
  backdrop.className="modal-backdrop";
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) backdrop.remove(); });
  backdrop.innerHTML=`<div class="modal">
    <div class="modal-head"><div><h2>${p.emoji ? p.emoji + " " : ""}${esc(p.name)}</h2><p>${esc(p.category)} · ${esc(p.variant)}</p></div><button class="btn" onclick="this.closest('.modal-backdrop').remove()">✕</button></div>
    ${petImageMarkup(p)}
    <div class="pet-tags" style="margin-top:12px">
      <span class="tag">Demand ${p.demand}/10</span>
      ${badge ? `<span class="tag tag-badge ${badge.cls}">${badge.text}</span>` : ""}
    </div>
    <div class="modal-stats" style="margin-top:14px">
      <div class="stat"><b>${fmt(p.value)}</b><span>Current value</span></div>
      <div class="stat"><b>${p.change>=0?"+":""}${p.change}%</b><span>Recent change</span></div>
    </div>
    <p>Released: <strong>${formatDate(p.release)}</strong></p>
    <div class="modal-actions"><button class="btn primary" onclick="addToCalc(${p.id},'yours');this.closest('.modal-backdrop').remove()">Add to my offer</button><button class="btn" onclick="this.closest('.modal-backdrop').remove()">Close</button></div>
  </div>`;
  document.body.appendChild(backdrop);
}

function renderCalculator() {
  $("#app").innerHTML=`
    <div class="page-title"><h1>Calculator</h1><p>Stack pets on both sides of a trade and see who's actually ahead.</p></div>
    <div class="calc-layout">
      <section class="panel">
        <div class="offer-title"><h2>Your offer</h2><strong id="yourTotal">0</strong></div>
        <div class="offer-list" id="yoursList"></div>
        <div class="add-row"><select id="yourPet" class="field">${pets.map(p=>`<option value="${p.id}">${esc(p.name)} · ${fmt(p.value)}</option>`).join("")}</select><button class="btn primary" onclick="addSelected('yours')">Add</button></div>
      </section>
      <section class="panel">
        <div class="offer-title"><h2>Their offer</h2><strong id="theirTotal">0</strong></div>
        <div class="offer-list" id="theirsList"></div>
        <div class="add-row"><select id="theirPet" class="field">${pets.map(p=>`<option value="${p.id}">${esc(p.name)} · ${fmt(p.value)}</option>`).join("")}</select><button class="btn primary" onclick="addSelected('theirs')">Add</button></div>
      </section>
      <aside class="calc-side">
        <div class="eyebrow">Trade evaluation</div>
        <div id="calcResult" class="calc-result"><strong>ADD PETS</strong><p style="margin:5px 0 0;color:var(--muted)">Add pets to both sides to see how the trade shakes out.</p></div>
        <div><span style="color:var(--muted);font-size:12px">Value difference</span><div class="calc-total" id="diff">0</div></div>
        <p class="helper-note">This only compares listed values. Demand and how badly someone wants a specific pet can still make a "fair" trade feel lopsided in practice.</p>
        <button class="btn danger" onclick="clearCalc()">Clear calculator</button>
      </aside>
    </div>`;
  renderOffers();
}

function addSelected(side) {
  const id=Number(document.getElementById(side==="yours"?"yourPet":"theirPet").value);
  addToCalc(id,side);
}
function addToCalc(id,side){ const p=pets.find(x=>x.id===id); if(p){calcOffers[side].push({...p}); renderOffers(); toast(`${p.name} added to ${side==="yours"?"your":"their"} offer.`);} }
function removeCalc(side,index){calcOffers[side].splice(index,1);renderOffers();}
function clearCalc(){calcOffers={yours:[],theirs:[]};renderOffers();toast("Calculator cleared.");}
function total(side){return calcOffers[side].reduce((s,p)=>s+p.value,0);}

function calcCard(p, side, i) {
  return `<div class="pet-card calc-card">
    <button class="offer-remove" onclick="removeCalc('${side}',${i})" aria-label="Remove ${esc(p.name)}">×</button>
    ${petImageMarkup(p)}
    <div class="pet-name">${p.emoji ? p.emoji + " " : ""}${esc(p.name)}</div>
    <div class="pet-type">${esc(p.variant)}</div>
    <div class="pet-row"><span class="value">${fmt(p.value)}</span></div>
  </div>`;
}

function renderOffers(){
  ["yours","theirs"].forEach(side=>{
    const list=$(side==="yours"?"#yoursList":"#theirsList");
    list.innerHTML=calcOffers[side].length ? calcOffers[side].map((p,i)=>calcCard(p,side,i)).join("") : `<div class="empty">No pets added yet.</div>`;
  });
  const a=total("yours"),b=total("theirs"),d=a-b;
  $("#yourTotal").textContent=fmt(a);$("#theirTotal").textContent=fmt(b);$("#diff").textContent=(d>0?"+":"")+fmt(Math.abs(d));
  const result=$("#calcResult");
  if(!a&&!b){result.className="calc-result";result.innerHTML="<strong>ADD PETS</strong><p style='margin:5px 0 0;color:var(--muted)'>Add pets to both sides to see how the trade shakes out.</p>";return;}
  const pct = Math.max(a,b) ? Math.round(Math.abs(d)/Math.max(a,b)*100) : 0;
  let title = pct <= 5 ? "PRETTY FAIR" : d > 0 ? "YOU'RE AHEAD" : "THEY'RE AHEAD";
  result.className="calc-result"+(d<0&&pct>5?" loss":"");
  result.innerHTML=`<strong>${title}</strong><p style="margin:5px 0 0;color:var(--muted)">${pct}% value difference · ${d>=0?"You":"They"} have the higher total.</p>`;
}

function route(){
  currentRoute=location.hash.replace("#","")||"home";
  document.querySelectorAll(".nav a").forEach(a=>a.classList.toggle("active",a.dataset.route===currentRoute));
  if(currentRoute==="values")renderValues();
  else if(currentRoute==="calculator")renderCalculator();
  else renderHome();
  $(".nav")?.classList.remove("open");
  window.scrollTo(0,0);
}
window.addEventListener("hashchange",route);
$("#mobileMenu").addEventListener("click",()=>$(".nav").classList.toggle("open"));
init();
