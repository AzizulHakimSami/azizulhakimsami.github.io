(() => {
  'use strict';
  const root = document.documentElement;
  const theme = document.querySelector('#theme-toggle');
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  let savedTheme;
  try { savedTheme = localStorage.getItem('portfolio-theme'); } catch (_) {}
  function setTheme(value) {
    root.dataset.theme = value;
    theme.setAttribute('aria-pressed', String(value === 'dark'));
    theme.setAttribute('aria-label', value === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    theme.querySelector('span').textContent = value === 'dark' ? 'Light' : 'Dark';
  }
  setTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : preference.matches ? 'dark' : 'light');
  theme.addEventListener('click', () => {
    savedTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(savedTheme);
    try { localStorage.setItem('portfolio-theme', savedTheme); } catch (_) {}
  });
  preference.addEventListener('change', event => { if (!savedTheme) setTheme(event.matches ? 'dark' : 'light'); });
  const menu = document.querySelector('#menu-toggle');
  const nav = document.querySelector('#main-nav');
  function closeMenu(restoreFocus = false) {
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', 'false');
    menu.textContent = 'Menu';
    nav.classList.remove('is-open');
    if (open && restoreFocus) menu.focus();
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(true); });
  document.addEventListener('click', event => { if (!event.target.closest('header')) closeMenu(); });
  const mobile = matchMedia('(max-width: 760px)');
  mobile.addEventListener('change', () => closeMenu());
  const progress = document.querySelector('.reading-progress');
  const topLink = document.querySelector('.floating-top');
  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  let scheduled = false;
  function updateScroll() {
    const maximum = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${maximum > 0 ? Math.min(1, Math.max(0, scrollY / maximum)) : 0})`;
    topLink.hidden = scrollY < 700;
    let current = '';
    for (const section of sections) if (section.getBoundingClientRect().top <= 160) current = section.id;
    if (scrollY + innerHeight >= root.scrollHeight - 10) current = 'contact';
    for (const link of navLinks) {
      if (link.hash === '#' + current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    scheduled = false;
  }
  function requestScroll() { if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }
  addEventListener('scroll', requestScroll, { passive: true });
  addEventListener('resize', requestScroll);
  updateScroll();
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const careers = [...document.querySelectorAll('.career')];
  const count = document.querySelector('#experience-count');
  function filterExperience(filter) {
    let total = 0;
    for (const career of careers) {
      let visible = 0;
      for (const role of career.querySelectorAll('.role')) {
        const show = filter === 'all' || role.dataset.category === filter;
        role.hidden = !show;
        if (show) { visible++; total++; }
      }
      career.hidden = visible === 0;
    }
    for (const button of filterButtons) button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    count.textContent = `${total} ${total === 1 ? 'role' : 'roles'} shown`;
    requestScroll();
  }
  for (const button of filterButtons) button.addEventListener('click', () => filterExperience(button.dataset.filter));
  filterExperience('all');
  document.querySelector('#print-profile').addEventListener('click', () => window.print());
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.06 });
    for (const element of document.querySelectorAll('.section-head, .skill, .education-list article, .about > div, .lab')) {
      if (element.getBoundingClientRect().top >= innerHeight) {
        element.classList.add('reveal-pending'); observer.observe(element);
      }
    }
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) { observer.disconnect(); document.querySelectorAll('.reveal-pending').forEach(el => el.classList.remove('reveal-pending')); }
    });
  }
  root.classList.add('enhanced');
  document.querySelectorAll('.js-only').forEach(el => el.classList.add('js-ready'));
})();
