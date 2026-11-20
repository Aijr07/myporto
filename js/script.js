document.addEventListener("DOMContentLoaded", function () {
  const header = document.getElementById("header");
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");
  const revealItems = document.querySelectorAll(".reveal");
  const backToTop = document.getElementById("back-to-top");
  const year = document.getElementById("year");

  if (year) year.textContent = new Date().getFullYear();

  function closeMenu() {
    navMenu.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Buka menu");
  }

  navToggle.addEventListener("click", function () {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    navToggle.setAttribute("aria-label", isOpen ? "Tutup menu" : "Buka menu");
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", function (event) {
    if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
      closeMenu();
    }
  });

  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 20);
    backToTop.classList.toggle("show", window.scrollY > 400);
    highlightNav();
  }

  function highlightNav() {
    const scrollY = window.scrollY + 120;
    let current = "";
    sections.forEach(function (section) {
      if (scrollY >= section.offsetTop) current = section.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
  }

  let ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
  onScroll();

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealItems.forEach(function (item) { observer.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add("visible"); });
  }

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.querySelectorAll(".project__link").forEach(function (link) {
    var href = (link.getAttribute("href") || "").trim();
    if (!href || href === "#") link.remove();
  });

  initImageZoom();

  function initImageZoom() {
    var zoomIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/></svg>';

    var lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.id = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Penampil gambar");
    lightbox.hidden = true;
    lightbox.innerHTML =
      '<button type="button" class="lightbox__close" aria-label="Tutup">&times;</button>' +
      '<button type="button" class="lightbox__nav lightbox__nav--prev" aria-label="Gambar sebelumnya">&#8249;</button>' +
      '<figure class="lightbox__figure">' +
        '<img class="lightbox__img" alt="">' +
        '<figcaption class="lightbox__caption"></figcaption>' +
      '</figure>' +
      '<button type="button" class="lightbox__nav lightbox__nav--next" aria-label="Gambar berikutnya">&#8250;</button>';
    document.body.appendChild(lightbox);

    var lbImg = lightbox.querySelector(".lightbox__img");
    var lbCaption = lightbox.querySelector(".lightbox__caption");
    var closeBtn = lightbox.querySelector(".lightbox__close");
    var prevBtn = lightbox.querySelector(".lightbox__nav--prev");
    var nextBtn = lightbox.querySelector(".lightbox__nav--next");
    var items = [];
    var currentIndex = 0;
    var lastFocused = null;

    document.querySelectorAll(".media:not(.media--cert)").forEach(function (media) {
      var imgs = media.querySelectorAll("img");
      if (!imgs.length) return;
      var img = imgs[imgs.length - 1];
      if (!img.getAttribute("src")) return;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "image-zoom-btn";
      btn.setAttribute("aria-label", "Lihat gambar secara full screen");
      btn.title = "Lihat gambar secara full screen";
      btn.innerHTML = zoomIcon;
      btn._zoomImg = img;

      media.classList.add("media--zoomable");
      media.appendChild(btn);

      img.addEventListener("error", function () {
        btn.remove();
        media.classList.remove("media--zoomable");
      });

      function open() {
        if (btn.isConnected) openLightbox(btn);
      }
      btn.addEventListener("click", function (e) { e.stopPropagation(); open(); });
      media.addEventListener("click", open);
    });

    function collectItems() {
      items = Array.prototype.map.call(
        document.querySelectorAll(".image-zoom-btn"),
        function (b) {
          return { src: b._zoomImg.currentSrc || b._zoomImg.src, alt: b._zoomImg.alt || "" };
        }
      );
    }

    function showCurrent() {
      var item = items[currentIndex];
      if (!item) return;
      lbImg.src = item.src;
      lbImg.alt = item.alt;
      lbCaption.textContent = item.alt;
    }

    function openLightbox(btn) {
      collectItems();
      var buttons = Array.prototype.slice.call(document.querySelectorAll(".image-zoom-btn"));
      currentIndex = Math.max(0, buttons.indexOf(btn));
      prevBtn.hidden = nextBtn.hidden = items.length < 2;
      lastFocused = document.activeElement;
      showCurrent();
      lightbox.hidden = false;
      document.body.classList.add("lightbox-open");
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.classList.remove("lightbox-open");
      lbImg.removeAttribute("src");
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function navigate(step) {
      if (items.length < 2) return;
      currentIndex = (currentIndex + step + items.length) % items.length;
      showCurrent();
    }

    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", function () { navigate(-1); });
    nextBtn.addEventListener("click", function () { navigate(1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") navigate(-1);
      else if (e.key === "ArrowRight") navigate(1);
    });
  }
});
