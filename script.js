// ---------- Config ----------
const GITHUB_USERNAME_DEFAULT = ''; // <--- set your GitHub username here for auto-fetch

// Utility
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

// Typed hero
const typedEl = document.querySelector('.typed');
const roles = [
  'AI/ML • Robotics • Algorithms',
  'Programming Lead @ RuiGuan VEX',
  'CS50x & CS50P (7th Grade)',
  'Mentored and Teached 10k + members Python and ML'
];
let rIndex = 0, charIndex = 0, deleting = false;
function typeLoop() {
  const current = roles[rIndex];
  if (!deleting) {
    typedEl.textContent = current.slice(0, ++charIndex);
    if (charIndex === current.length) { deleting = true; setTimeout(typeLoop, 1200); return; }
  } else {
    typedEl.textContent = current.slice(0, --charIndex);
    if (charIndex === 0) { deleting = false; rIndex = (rIndex + 1) % roles.length; }
  }
  setTimeout(typeLoop, deleting ? 28 : 42);
}
typeLoop();

// Stats counter
const counters = document.querySelectorAll('.num');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target; const target = Number(el.dataset.target || '0');
      let val = 0; const step = Math.max(1, Math.ceil(target / 80));
      const tick = () => { val = Math.min(target, val + step); el.textContent = val.toLocaleString(); if (val < target) requestAnimationFrame(tick); };
      tick(); revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => revealObserver.observe(c));

// Scroll reveal
const sections = document.querySelectorAll('.reveal');
const sectionObserver = new IntersectionObserver((entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.14 });
sections.forEach(s => sectionObserver.observe(s));

// 3D tilt
const card = document.querySelector('.pfp-glass');
if (card) {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rx = clamp((0.5 - y) * 12, -12, 12);
    const ry = clamp((x - 0.5) * 12, -12, 12);
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = 'rotateX(0) rotateY(0)');
}

// Theme toggle (improved persistence)
const themeBtn = document.getElementById('theme-toggle');
const body = document.body;
const storedTheme = localStorage.getItem('theme');
if (storedTheme) body.classList.toggle('light', storedTheme === 'light');
themeBtn.addEventListener('click', () => {
  const isLight = body.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});
document.getElementById('year').textContent = new Date().getFullYear();

// Lightbox for certs grid
const certsGrid = document.getElementById('certsGrid');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const closeLightbox = document.getElementById('closeLightbox');
if (certsGrid && lightbox && lightboxImg) {
  certsGrid.addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if (!img) return;
    lightboxImg.src = img.src;
    if (typeof lightbox.showModal === 'function') lightbox.showModal(); else lightbox.setAttribute('open', '');
  });
  closeLightbox.addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
}

// Contact (demo only)
const form = document.querySelector('form.contact');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = form.querySelector('.form-msg');
    msg.textContent = 'Thanks — message captured locally (wire this to your backend or Formspree).';
    form.reset();
    setTimeout(() => msg.textContent = '', 3000);
  });
}

// Skill filter
const tagBar = document.getElementById('skillTags');
const projects = document.querySelectorAll('.project-card');
let activeSkill = null;
if (tagBar) {
  tagBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.tag');
    if (!btn) return;
    const skill = btn.dataset.skill;
    if (activeSkill === skill) {
      activeSkill = null; btn.classList.remove('active'); projects.forEach(p => p.style.display = '');
      return;
    }
    tagBar.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
    btn.classList.add('active'); activeSkill = skill;
    projects.forEach(p => {
      const skills = (p.getAttribute('data-skills') || '').split(' ');
      p.style.display = skills.includes(skill) ? '' : 'none';
    });
  });
}

// ---------- Generic modal system ----------
$$('[data-open]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-open');
    const modal = document.getElementById(id);
    if (!modal) return;
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
    modal.dataset.openedOnce = 'true'; // flag
    // lazy-initialize if needed
    if (id === 'projectsModal') initProjectsModal();
    if (id === 'certsModal') initCertsModal();
  });
});
$$('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => btn.closest('dialog')?.close());
});

// Close modal on backdrop click
$$('dialog.modal').forEach(dlg => {
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
});

// ---------- Projects Modal (GitHub fetch + search/sort) ----------
let projectsInit = false;
function initProjectsModal() {
  if (projectsInit) return;
  projectsInit = true;
  const list = $('#projectsList');
  const search = $('#projSearch');
  const sort = $('#projSort');
  const userInput = $('#githubUser');
  const fetchBtn = $('#fetchGitHub');

  const state = { items: [], filtered: [] };

  function render(items) {
    list.innerHTML = '';
    if (!items.length) { list.innerHTML = '<p style="opacity:.7">No projects found. Try a different search.</p>'; return; }
    const frag = document.createDocumentFragment();
    items.forEach(repo => {
      const card = document.createElement('article');
      card.className = 'list-card';
      card.innerHTML = `
        <h4>${repo.name}</h4>
        <p>${repo.description || ''}</p>
        <div class="list-meta">
          <span>★ ${repo.stargazers_count}</span>
          <span>${repo.language || '—'}</span>
          <span>Updated ${new Date(repo.updated_at).toLocaleDateString()}</span>
        </div>
        <div class="list-actions">
          <a class="btn tiny" href="${repo.html_url}" target="_blank" rel="noopener">Code</a>
          ${repo.homepage ? `<a class="btn tiny ghost" href="${repo.homepage}" target="_blank" rel="noopener">Demo</a>` : ''}
        </div>
      `;
      frag.appendChild(card);
    });
    list.appendChild(frag);
  }

  function apply() {
    const q = (search.value || '').toLowerCase();
    let arr = [...state.items];
    if (q) arr = arr.filter(r =>
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
    const s = sort.value;
    if (s === 'updated') arr.sort((a,b)=> new Date(b.updated_at)-new Date(a.updated_at));
    if (s === 'stars') arr.sort((a,b)=> b.stargazers_count - a.stargazers_count);
    if (s === 'name') arr.sort((a,b)=> a.name.localeCompare(b.name));
    state.filtered = arr;
    render(arr);
  }

  // Demo local items until user fetches
  state.items = [
    { name:'AI Maze Solver', description:'Visual A* and DFS pathfinding with metrics.', stargazers_count:42, language:'Python', updated_at:new Date().toISOString(), html_url:'#', homepage:'#' },
    { name:'Smarter Dev Bots', description:'Automation and analytics for a 15k+ community.', stargazers_count:73, language:'Python', updated_at:new Date().toISOString(), html_url:'#', homepage:'' },
    { name:'Vision Playground', description:'Computer vision experiments and notebooks.', stargazers_count:12, language:'Jupyter Notebook', updated_at:new Date().toISOString(), html_url:'#', homepage:'' }
  ];
  apply();

  async function fetchGitHub(user) {
    try {
      const resp = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=updated`);
      if (!resp.ok) throw new Error('GitHub API error');
      const data = await resp.json();
      // Optional: filter forks and archived by default
      state.items = data.filter(r => !r.fork && !r.archived);
      apply();
    } catch (err) {
      list.innerHTML = `<p style="color:#ef4444">Could not fetch from GitHub. Check username or rate limits.</p>`;
    }
  }

  // Prefill username
  userInput.value = GITHUB_USERNAME_DEFAULT;
  if (GITHUB_USERNAME_DEFAULT) fetchGitHub(GITHUB_USERNAME_DEFAULT);

  fetchBtn.addEventListener('click', () => {
    const user = userInput.value.trim();
    if (user) fetchGitHub(user);
  });
  search.addEventListener('input', apply);
  sort.addEventListener('change', apply);
}

// ---------- Certifications Modal (masonry + search + local add) ----------
let certsInit = false;
function initCertsModal() {
  if (certsInit) return;
  certsInit = true;
  const list = $('#certsList');
  const search = $('#certSearch');
  const input = $('#certsInput');

  const items = [
    { src: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop', name:'CS50x' },
    { src: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1200&auto=format&fit=crop', name:'CS50P' }
  ];

  function render() {
    const q = (search.value || '').toLowerCase();
    list.innerHTML = '';
    const arr = items.filter(it => !q || it.name.toLowerCase().includes(q));
    arr.forEach(it => {
      const fig = document.createElement('figure');
      fig.innerHTML = `<img src="${it.src}" alt="${it.name}"><figcaption>${it.name}</figcaption>`;
      list.appendChild(fig);
    });
  }
  render();
  search.addEventListener('input', render);

  // Add local images
  if (input) {
    input.addEventListener('change', () => {
      const files = [...input.files];
      files.forEach(file => {
        const url = URL.createObjectURL(file);
        items.push({ src: url, name: file.name.replace(/\.[^.]+$/, '') });
      });
      render();
      input.value = '';
    });
  }
}
