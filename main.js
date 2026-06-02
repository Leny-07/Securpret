// ===== NAVIGATION =====
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.remove('active');
  });

  var target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
  }

  document.querySelectorAll('.site-nav__link').forEach(function(link) {
    link.classList.remove('is-active');
    if (link.getAttribute('data-page') === pageId) {
      link.classList.add('is-active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
  history.pushState(null, '', '#' + pageId);
}

// Handle browser back/forward
window.addEventListener('popstate', function() {
  var hash = window.location.hash.replace('#', '');
  if (hash && ['accueil','assurance','equipe','contact'].indexOf(hash) !== -1) {
    showPage(hash);
  } else {
    showPage('accueil');
  }
});

// Load page from hash on initial load
(function() {
  var hash = window.location.hash.replace('#', '');
  if (hash && ['accueil','assurance','equipe','contact'].indexOf(hash) !== -1) {
    showPage(hash);
  }
})();

// ===== MOBILE MENU TOGGLE =====
var menuBtn = document.getElementById('menuToggle');
var nav = document.getElementById('siteNav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', function() {
    var isOpen = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', isOpen);
  });
  nav.querySelectorAll('.site-nav__link').forEach(function(link) {
    link.addEventListener('click', function() {
      nav.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', false);
    });
  });
}

// ===== HEADER SCROLL EFFECT =====
var header = document.getElementById('siteHeader');
if (header) {
  window.addEventListener('scroll', function() {
    if (window.scrollY > 10) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  });
}

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-item').forEach(function(item) {
  var q = item.querySelector('.faq-question');
  if (q) {
    q.addEventListener('click', function() {
      var isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item').forEach(function(i) {
        i.classList.remove('is-open');
      });
      if (!isOpen) item.classList.add('is-open');
    });
  }
});

// ===== SCROLL ANIMATIONS =====
if ('IntersectionObserver' in window) {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in, .slide-up').forEach(function(el) {
    observer.observe(el);
  });
}
