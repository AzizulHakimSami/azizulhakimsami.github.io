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
  const mobile = matchMedia('(max-width: 960px)');
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
  // Preserve the visitor's expanded cards when printing the complete public profile.
  const highlightDetails = [...document.querySelectorAll('.highlight-details')];
  let detailsBeforePrint;
  addEventListener('beforeprint', () => {
    if (detailsBeforePrint) return;
    detailsBeforePrint = highlightDetails.map(detail => detail.open);
    highlightDetails.forEach(detail => { detail.open = true; });
  });
  addEventListener('afterprint', () => {
    if (!detailsBeforePrint) return;
    highlightDetails.forEach((detail, index) => { detail.open = detailsBeforePrint[index]; });
    detailsBeforePrint = null;
  });

  function goToSection(hash, filter) {
    const section = document.querySelector(hash);
    if (!section) return;
    if (filter) filterExperience(filter);
    if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1');
    section.focus({ preventScroll: true });
    section.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }
  for (const link of document.querySelectorAll('[data-experience-filter]')) {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
      event.preventDefault();
      goToSection(link.hash, link.dataset.experienceFilter);
    });
  }

  // Native dialog supplies modal focus containment and Escape-to-close behavior.
  const quickDialog = document.querySelector('#quick-dialog');
  const quickOpen = document.querySelector('#quick-open');
  const quickInput = document.querySelector('#quick-search');
  const quickResults = document.querySelector('#quick-results');
  const quickCount = document.querySelector('#quick-count');
  const quickEmpty = document.querySelector('#quick-empty');
  const destinations = [
    { title: 'Work highlights', description: 'Automation, IT support, and a robotics project', hash: '#highlights', keywords: 'selected projects ev3 lego color robot', home: true },
    { title: 'About Azizul', description: 'My background and approach', hash: '#about', keywords: 'biography bangladesh hamburg', home: true },
    { title: 'All experience', description: 'Explore my career in Hamburg', hash: '#experience', filter: 'all', keywords: 'work jobs career history', home: true },
    { title: 'Automation experience', description: 'Process automation at Hapag-Lloyd', hash: '#experience', filter: 'automation', keywords: 'developer internship working student vba macros' },
    { title: 'IT support experience', description: 'Watson Farley & Williams · Hogan Lovells', hash: '#experience', filter: 'it', keywords: 'legal law helpdesk information technology' },
    { title: 'Business experience', description: 'Hapag-Lloyd · ZENJOB', hash: '#experience', filter: 'business', keywords: 'rpx administration office assistant data entry excel' },
    { title: 'Skills & toolkit', description: 'Code, data, and engineering', hash: '#skills', keywords: 'python java c vba excel macros git visual studio intellij alteryx power bi powerbi microsoft 365 sap jira iam latex arduino tm4c1294 labview pspice pcb measurement hardware', home: true },
    { title: 'Education', description: 'University studies and the EV3 lab project', hash: '#education', keywords: 'haw hamburg eurasia chittagong mohsin college information electrical engineering bachelor bsc lego robotics', home: true },
    { title: 'Contact & sharing', description: 'Connect on LinkedIn or share this profile', hash: '#contact', keywords: 'connect social linkedin profile link', home: true }
  ];
  function renderDestinations() {
    const terms = quickInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = destinations.filter(item => terms.length
      ? terms.every(term => `${item.title} ${item.description} ${item.keywords}`.toLowerCase().includes(term))
      : item.home);
    quickResults.replaceChildren();
    for (const item of matches) {
      const row = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quick-result';
      const label = document.createElement('span');
      const title = document.createElement('strong');
      title.textContent = item.title;
      const description = document.createElement('small');
      description.textContent = item.description;
      const arrow = document.createElement('span');
      arrow.className = 'result-arrow';
      arrow.textContent = '↗';
      arrow.setAttribute('aria-hidden', 'true');
      label.append(title, description);
      button.append(label, arrow);
      button.addEventListener('click', () => {
        quickDialog.close();
        requestAnimationFrame(() => goToSection(item.hash, item.filter));
      });
      row.append(button);
      quickResults.append(row);
    }
    quickEmpty.hidden = matches.length > 0;
    quickCount.textContent = terms.length ? `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}` : 'Jump to a section';
  }
  function openQuickNavigation() {
    if (quickDialog.open) return;
    closeMenu();
    quickInput.value = '';
    renderDestinations();
    quickDialog.showModal();
    document.body.classList.add('dialog-open');
    quickInput.focus();
  }
  if (typeof quickDialog.showModal === 'function') {
    quickOpen.hidden = false;
    quickOpen.addEventListener('click', openQuickNavigation);
    document.querySelector('#quick-close').addEventListener('click', () => quickDialog.close());
    quickDialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
    quickDialog.addEventListener('click', event => {
      if (event.target !== quickDialog) return;
      const bounds = quickDialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) quickDialog.close();
    });
    quickInput.addEventListener('input', renderDestinations);
    quickInput.addEventListener('keydown', event => {
      const buttons = [...quickResults.querySelectorAll('button')];
      if (event.key === 'ArrowDown' && buttons.length) { event.preventDefault(); buttons[0].focus(); }
      if (event.key === 'ArrowUp' && buttons.length) { event.preventDefault(); buttons.at(-1).focus(); }
      if (event.key === 'Enter' && buttons.length && !event.isComposing) { event.preventDefault(); buttons[0].click(); }
    });
    quickResults.addEventListener('keydown', event => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const buttons = [...quickResults.querySelectorAll('button')];
      const index = buttons.indexOf(document.activeElement);
      if (index < 0) return;
      event.preventDefault();
      const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
      if (next < 0 || next >= buttons.length) quickInput.focus();
      else buttons[next].focus();
    });
    document.addEventListener('keydown', event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !event.altKey && !event.isComposing) {
        event.preventDefault();
        if (quickDialog.open) quickDialog.close(); else openQuickNavigation();
      }
    });
  }

  const shareButton = document.querySelector('#share-profile');
  const shareStatus = document.querySelector('#share-status');
  const shareFallback = document.querySelector('#share-fallback');
  const profileUrl = document.querySelector('#profile-url');
  shareButton.addEventListener('click', async () => {
    shareStatus.textContent = '';
    shareFallback.hidden = true;
    shareButton.disabled = true;
    try {
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ title: 'Azizul Hakim | IT & Process Automation', url: profileUrl.value });
          shareStatus.textContent = 'Profile shared.';
          return;
        } catch (error) { if (error.name === 'AbortError') return; }
      }
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(profileUrl.value);
      shareStatus.textContent = 'Profile link copied. Ready to share.';
    } catch (_) {
      shareFallback.hidden = false;
      shareStatus.textContent = 'Select and copy the link below to share this profile.';
      profileUrl.focus();
      profileUrl.select();
    } finally { shareButton.disabled = false; }
  });
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
