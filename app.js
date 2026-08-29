/* ---------- theme ---------- */
const htmlEl = document.documentElement;
document.getElementById('themeToggle').addEventListener('click', () => {
  htmlEl.setAttribute('data-theme', htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

/* ---------- scroll reveal ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------- simulated demo (top of page) ---------- */
const niches = {
  dev: { name:'Aditi Sharma', role:'Full-stack Developer', source:'github.com/aditi-codes',
    lines:['$ fetching <span class="tag">github.com/aditi-codes</span>','<span class="ok">✓</span> found 14 repos, 3 pinned','<span class="ok">✓</span> extracted bio, languages, activity','$ writing <span class="tag">about</span>...','<span class="ok">✓</span> about — 38 words','$ writing <span class="tag">projects</span>...','<span class="ok">✓</span> 3 projects turned into blurbs','<span class="ok">✓</span> assembled in 5.8s'],
    blocks:[{h:'About',p:'Builds fast, accessible web apps. 3 yrs shipping production React + Node.'},{h:'Recent commit',p:'Refactored auth flow · 2 days ago · pulled live from GitHub.'},{h:'Featured project',p:'expense-tracker-api — 214★, written up from README.'}] },
  design: { name:'Rhea Kapoor', role:'Product Designer', source:'linkedin.com/in/rheakapoor',
    lines:['$ fetching <span class="tag">linkedin.com/in/rheakapoor</span>','<span class="ok">✓</span> found 4 case studies','<span class="ok">✓</span> extracted process notes','$ writing <span class="tag">case studies</span>...','<span class="ok">✓</span> 4 projects reframed','<span class="ok">✓</span> assembled in 5.4s'],
    blocks:[{h:'About',p:'Designs checkout flows that convert. 4 yrs across fintech and D2C.'},{h:'Case study',p:'Redesigned onboarding — drop-off cut from 41% to 12%.'},{h:'Featured work',p:'Payments redesign for a Series B fintech, shipped in 6 weeks.'}] },
  student: { name:'Karan Verma', role:'CS Student, Final Year', source:'resume — karan_verma.pdf',
    lines:['$ reading <span class="tag">karan_verma.pdf</span>','<span class="ok">✓</span> found 2 internships, 5 projects','$ writing <span class="tag">journey</span>...','<span class="ok">✓</span> timeline built','<span class="ok">✓</span> assembled in 5.1s'],
    blocks:[{h:'About',p:'Final-year CS student focused on backend systems and databases.'},{h:'Internship',p:'Summer intern, backend team — built a rate-limiting service.'},{h:'Growth',p:'From first Python script to a 5-project GitHub in 2 years.'}] }
};
const termBody = document.getElementById('termBody');
const previewCard = document.getElementById('previewCard');
const pvGrid = document.getElementById('pvGrid');
const pvName = document.getElementById('pvName');
const pvRole = document.getElementById('pvRole');
const linkInput = document.getElementById('linkInput');
let demoRunning = false;
let currentNiche = 'dev';

function runDemo(nicheKey){
  if (demoRunning) return;
  demoRunning = true;
  const data = niches[nicheKey] || niches.dev;
  currentNiche = nicheKey;
  linkInput.value = data.source;
  pvName.textContent = data.name;
  pvRole.textContent = data.role;
  termBody.innerHTML = '';
  previewCard.classList.remove('show');
  pvGrid.innerHTML = data.blocks.map(b => `<div class="pv-block"><div class="pv-bar" style="width:${40+Math.random()*30|0}%"></div><h4>${b.h}</h4><p>${b.p}</p></div>`).join('');
  const blocks = pvGrid.querySelectorAll('.pv-block');
  let delay = 0;
  data.lines.forEach(line => {
    delay += 380;
    setTimeout(() => {
      const p = document.createElement('p');
      p.className = 'term-line';
      p.innerHTML = line;
      termBody.appendChild(p);
      termBody.scrollTop = termBody.scrollHeight;
    }, delay);
  });
  setTimeout(() => {
    previewCard.classList.add('show');
    blocks.forEach((b,i) => setTimeout(() => b.classList.add('in'), i*160));
    demoRunning = false;
  }, delay + 300);
}
document.getElementById('buildBtn').addEventListener('click', () => runDemo(currentNiche));
linkInput.addEventListener('keydown', e => { if (e.key === 'Enter') runDemo(currentNiche); });
document.querySelectorAll('.tpl-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.tpl-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    runDemo(card.dataset.niche);
    document.getElementById('demo').scrollIntoView({ behavior:'smooth' });
  });
});
window.addEventListener('load', () => setTimeout(() => runDemo('dev'), 500));

/* ---------- real auth + AI (talks to server.js) ---------- */
let authToken = null; // kept in memory only — never persisted to browser storage
let authEmail = null;

const tabLogin = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');
const tabGenerate = document.getElementById('tabGenerate');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const generateForm = document.getElementById('generateForm');
const navAuthBtn = document.getElementById('navAuthBtn');

function showTab(which){
  [tabLogin, tabSignup, tabGenerate].forEach(t => t.classList.remove('active'));
  [loginForm, signupForm, generateForm].forEach(f => f.style.display = 'none');
  if (which === 'login'){ tabLogin.classList.add('active'); loginForm.style.display = 'block'; }
  if (which === 'signup'){ tabSignup.classList.add('active'); signupForm.style.display = 'block'; }
  if (which === 'generate'){ tabGenerate.classList.add('active'); generateForm.style.display = 'block'; }
}
tabLogin.addEventListener('click', () => showTab('login'));
tabSignup.addEventListener('click', () => showTab('signup'));
tabGenerate.addEventListener('click', () => { if (authToken) showTab('generate'); });

function onAuthed(token, email){
  authToken = token;
  authEmail = email;
  tabGenerate.style.display = 'inline-block';
  document.getElementById('genUserLabel').value = email || '';
  navAuthBtn.textContent = 'Signed in';
  showTab('generate');
}

document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const status = document.getElementById('loginStatus');
  status.textContent = 'signing in...'; status.className = 'status-msg';
  try {
    const r = await fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    const data = await r.json();
    if (!r.ok) { status.textContent = data.error || 'login failed'; status.className = 'status-msg err'; return; }
    status.textContent = 'signed in ✓'; status.className = 'status-msg ok';
    onAuthed(data.token, email);
  } catch (e) { status.textContent = 'server not reachable — is it running?'; status.className = 'status-msg err'; }
});

document.getElementById('signupBtn').addEventListener('click', async () => {
  const email = document.getElementById('suEmail').value.trim();
  const password = document.getElementById('suPassword').value;
  const slug = document.getElementById('suSlug').value.trim();
  const status = document.getElementById('signupStatus');
  status.textContent = 'creating account...'; status.className = 'status-msg';
  try {
    const r = await fetch('/api/signup', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password, slug }) });
    const data = await r.json();
    if (!r.ok) { status.textContent = data.error || 'signup failed'; status.className = 'status-msg err'; return; }
    status.textContent = 'account created ✓'; status.className = 'status-msg ok';
    onAuthed(data.token, email);
  } catch (e) { status.textContent = 'server not reachable — is it running?'; status.className = 'status-msg err'; }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  authToken = null; authEmail = null;
  tabGenerate.style.display = 'none';
  navAuthBtn.textContent = 'Sign in';
  showTab('login');
});

let lastGenerated = null;

document.getElementById('genBtn').addEventListener('click', async () => {
  const niche = document.getElementById('genNiche').value;
  const sourceText = document.getElementById('genSource').value;
  const status = document.getElementById('genStatus');
  const result = document.getElementById('genResult');
  status.textContent = 'assembling with real AI...'; status.className = 'status-msg';
  result.classList.remove('show');
  try {
    const r = await fetch('/api/generate', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + authToken },
      body: JSON.stringify({ sourceText, niche })
    });
    const data = await r.json();
    if (!r.ok) { status.textContent = data.error || 'generation failed'; status.className = 'status-msg err'; return; }
    status.textContent = 'generated ✓'; status.className = 'status-msg ok';
    lastGenerated = data;
    document.getElementById('resName').textContent = data.name || authEmail;
    document.getElementById('resRole').textContent = data.role || niche;
    document.getElementById('resAbout').textContent = data.about || '';
    document.getElementById('resBlocks').innerHTML = (data.blocks || []).map(b => `<div class="result-block"><div class="t">${b.title||''}</div><div class="b">${b.body||''}</div></div>`).join('');
    result.classList.add('show');
    document.getElementById('saveBtn').style.display = 'inline-block';
  } catch (e) {
    status.textContent = 'server not reachable — is it running?'; status.className = 'status-msg err';
  }
});

document.getElementById('saveBtn').addEventListener('click', async () => {
  const status = document.getElementById('genStatus');
  if (!lastGenerated) return;
  status.textContent = 'saving...'; status.className = 'status-msg';
  try {
    const r = await fetch('/api/portfolio', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + authToken },
      body: JSON.stringify({
        name: lastGenerated.name, role: lastGenerated.role, about: lastGenerated.about,
        niche: document.getElementById('genNiche').value, data_json: lastGenerated
      })
    });
    const data = await r.json();
    if (!r.ok) { status.textContent = data.error || 'save failed'; status.className = 'status-msg err'; return; }
    status.textContent = 'saved ✓ — published at /api/p/<your-slug>'; status.className = 'status-msg ok';
  } catch (e) { status.textContent = 'server not reachable'; status.className = 'status-msg err'; }
});

navAuthBtn.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('real').scrollIntoView({ behavior:'smooth' });
});
