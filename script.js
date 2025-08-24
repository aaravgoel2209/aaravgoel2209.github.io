// Utility: clamp number
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// Hero typed text effect
const typedEl = document.querySelector('.typed');
const roles = [
  'AI/ML • Robotics • Algorithms',
  'VEX Programmer @ RuiGuan',
  'CS50x & CS50P (7th Grade)',
  'Mentored and Teached 10k + members Python and ML'
];
let rIndex = 0, charIndex = 0, deleting = false;

function typeLoop() {
  const current = roles[rIndex];
  if (!deleting) {
    typedEl.textContent = current.slice(0, ++charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1200);
      return;
    }
  } else {
    typedEl.textContent = current.slice(0, --charIndex);
    if (charIndex === 0) {
      deleting = false;
      rIndex = (rIndex + 1) % roles.length;
    }
  }
  const delay = deleting ? 28 : 42;
  setTimeout(typeLoop, delay);
}
typeLoop();

// Stats counter
const counters = document.querySelectorAll('.num');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = Number(el.dataset.target || '0');
      let val = 0;
      const step = Math.max(1, Math.ceil(target / 80));
      const tick = () => {
        val = Math.min(target, val + step);
        el.textContent = val.toLocaleString();
        if (val < target) requestAnimationFrame(tick);
      };
      tick();
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => revealObserver.observe(c));

// Scroll reveal for sections
const sections = document.querySelectorAll('.reveal');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.14 });
sections.forEach(s => sectionObserver.observe(s));

// 3D tilt for hero image
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

// Lightbox for certs
const certsGrid = document.getElementById('certsGrid');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const closeLightbox = document.getElementById('closeLightbox');

if (certsGrid && lightbox && lightboxImg) {
  certsGrid.addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if (!img) return;
    lightboxImg.src = img.src;
    if (typeof lightbox.showModal === 'function') {
      lightbox.showModal();
    } else {
      lightbox.setAttribute('open', '');
    }
  });
  closeLightbox.addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.close();
  });
}

// Skill filter for projects
const tagBar = document.getElementById('skillTags');
const projects = document.querySelectorAll('.project-card');
let activeSkill = null;

if (tagBar) {
  tagBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.tag');
    if (!btn) return;
    const skill = btn.dataset.skill;
    if (activeSkill === skill) {
      activeSkill = null;
      btn.classList.remove('active');
      projects.forEach(p => p.style.display = '');
      return;
    }
    // clear
    tagBar.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    activeSkill = skill;
    projects.forEach(p => {
      const skills = (p.getAttribute('data-skills') || '').split(' ');
      p.style.display = skills.includes(skill) ? '' : 'none';
    });
  });
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

// Theme toggle
const themeBtn = document.getElementById('theme-toggle');
const body = document.body;
const storedTheme = localStorage.getItem('theme');
if (storedTheme) body.classList.toggle('light', storedTheme === 'light');
themeBtn.addEventListener('click', () => {
  const isLight = body.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
