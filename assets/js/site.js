// Lightweight site JS — mobile drawer, reveal-on-scroll, contact form demo
(function () {
  // ---- Mobile nav drawer --------------------------------------------------
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const drawer = document.querySelector('.nav__drawer');

  function setOpen(open) {
    if (!nav) return;
    nav.classList.toggle('nav--open', open);
    document.body.classList.toggle('nav-locked', open);
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (drawer) drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('nav--open'));
    });
  }

  // Close when any drawer link is tapped
  if (drawer) {
    drawer.addEventListener('click', function (e) {
      const a = e.target.closest('a');
      if (a) setOpen(false);
    });
  }

  // ESC closes drawer
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  // Close drawer when viewport grows past mobile breakpoint
  const mq = window.matchMedia('(min-width: 821px)');
  const onChange = () => { if (mq.matches) setOpen(false); };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq.addListener) mq.addListener(onChange);

  // ---- Reveal on scroll ---------------------------------------------------
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ---- Footer year --------------------------------------------------------
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // ---- Contact form (demo, no backend) ------------------------------------
  const form = document.querySelector('form.card-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      const original = btn.innerHTML;
      btn.textContent = "Thanks — we'll be in touch →";
      btn.disabled = true;
      setTimeout(() => { btn.innerHTML = original; btn.disabled = false; form.reset(); }, 3200);
    });
  }
})();
