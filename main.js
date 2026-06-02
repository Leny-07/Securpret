(function() {
  // ── Config Avis Vérifiés ──────────────────────────────────────
  var AV_API_KEY    = 'ad13d5d0-d936-4471-b7b8-67dce6de9596';
  var AV_SECRET_KEY = 'le3%2FaBWCufk6mWCVu2pw%2BQXX600FTSsYkKHKe5E2aAm67eobap9EpY8Q4UC%2BtIkAfBBqN8zw8qmBYAv1sNjwiA%3D%3D';
  var PER_PAGE = 3; // avis affichés par page

  // ── État ─────────────────────────────────────────────────────
  var allReviews = [];
  var currentPage = 0;

  // ── Éléments DOM ─────────────────────────────────────────────
  var loading   = document.getElementById('avLoading');
  var carousel  = document.getElementById('avCarousel');
  var track     = document.getElementById('avTrack');
  var controls  = document.getElementById('avControls');
  var dotsWrap  = document.getElementById('avDots');
  var btnPrev   = document.getElementById('avPrev');
  var btnNext   = document.getElementById('avNext');
  var scoreEl   = document.getElementById('avScore');

  // ── Utilitaires ───────────────────────────────────────────────
  function starSVG() {
    return '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.9 5.9L19 8l-4.5 4.4L15.6 19 10 16l-5.6 3L5.5 12.4 1 8l6.1-1.1L10 1z"/></svg>';
  }

  function initials(name) {
    if (!name) return '?';
    var parts = name.trim().split(' ');
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function buildCard(review) {
    var rating  = parseInt(review.rate || review.rating || 5, 10);
    var author  = review.lastname ? review.firstname + ' ' + review.lastname.charAt(0) + '.' : (review.firstname || review.pseudo || 'Client');
    var text    = review.review || review.comment || '';
    var date    = formatDate(review.date || review.order_date);
    var stars   = '';
    for (var i = 0; i < 5; i++) stars += starSVG();

    return '<div class="av-carousel__slide">'
      + '<article class="testimonial">'
      + '<div class="testimonial__stars">' + stars + '</div>'
      + '<p class="testimonial__quote">\u00AB\u00A0' + text + '\u00A0\u00BB</p>'
      + '<div class="testimonial__author">'
      + '<div class="testimonial__avatar">' + initials(author) + '</div>'
      + '<div>'
      + '<div class="testimonial__name">' + author + '</div>'
      + (date ? '<div class="testimonial__date">' + date + '</div>' : '')
      + '</div>'
      + '</div>'
      + '</article>'
      + '</div>';
  }

  function renderPage(page) {
    currentPage = page;
    var start = page * PER_PAGE;
    var slice = allReviews.slice(start, start + PER_PAGE);

    // Rembourrer à 3 si moins d'avis disponibles sur cette page
    while (slice.length < PER_PAGE && allReviews.length >= PER_PAGE) {
      slice.push(allReviews[slice.length % allReviews.length]);
    }

    track.innerHTML = slice.map(buildCard).join('');

    // Dots
    var totalPages = Math.ceil(allReviews.length / PER_PAGE);
    dotsWrap.innerHTML = '';
    for (var i = 0; i < totalPages; i++) {
      var dot = document.createElement('button');
      dot.className = 'av-carousel__dot' + (i === page ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Page ' + (i + 1));
      (function(p){ dot.addEventListener('click', function(){ renderPage(p); }); })(i);
      dotsWrap.appendChild(dot);
    }

    btnPrev.disabled = (page === 0);
    btnNext.disabled = (page >= totalPages - 1);
  }

  // ── Appel API ────────────────────────────────────────────────
  function fetchReviews() {
    // Endpoint Avis Vérifiés / Skeepers — avis marque
    var url = 'https://long-salad-0bf5.lenycapelli222.workers.dev/api/v2.0/review/list'
      + '?apikey=' + AV_API_KEY
      + '&secretkey=' + AV_SECRET_KEY
      + '&nb_par_page=30'
      + '&ordre=date'
      + '&sens=desc'
      + '&note_min=4';

    fetch(url)
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function(data) {
        // Normalise selon la structure retournée
        var reviews = data.reviews || data.data || data.results || [];
        if (!reviews.length && Array.isArray(data)) reviews = data;

        // Note globale
        if (data.global_mark || data.note_moyenne) {
          var note = parseFloat(data.global_mark || data.note_moyenne).toFixed(1);
          scoreEl.textContent = note + '/5';
        }

        if (!reviews.length) {
          showError('Aucun avis disponible pour le moment.');
          return;
        }

        // Garder uniquement les avis avec texte
        allReviews = reviews.filter(function(r) {
          return (r.review || r.comment || '').trim().length > 10;
        });

        if (!allReviews.length) allReviews = reviews;

        loading.style.display = 'none';
        carousel.style.display = 'block';
        controls.style.display = 'flex';
        renderPage(0);
      })
      .catch(function(err) {
        console.warn('Avis Vérifiés API error:', err);
        showError('Impossible de charger les avis pour le moment.');
      });
  }

  function showError(msg) {
    loading.innerHTML = '<p class="av-carousel__error">' + msg + '</p>';
  }

  // ── Boutons ───────────────────────────────────────────────────
  btnPrev.addEventListener('click', function() {
    if (currentPage > 0) renderPage(currentPage - 1);
  });
  btnNext.addEventListener('click', function() {
    var totalPages = Math.ceil(allReviews.length / PER_PAGE);
    if (currentPage < totalPages - 1) renderPage(currentPage + 1);
  });

  // ── Init ─────────────────────────────────────────────────────
  fetchReviews();
})();


  // ===== NAVIGATION =====
  function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(function(p) {
      p.classList.remove('active');
    });
    
    // Show target page
    var target = document.getElementById('page-' + pageId);
    if (target) {
      target.classList.add('active');
    }
    
    // Update nav active state
    document.querySelectorAll('.site-nav__link').forEach(function(link) {
      link.classList.remove('is-active');
      if (link.getAttribute('data-page') === pageId) {
        link.classList.add('is-active');
      }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update URL hash for bookmarking
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
    // Close menu when a nav link is clicked
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

  // ===== FAQ ACCORDION (home page) =====
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
