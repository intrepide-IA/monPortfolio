/**
 * Contenu éditable via data/site-content.json (sans modifier le HTML).
 */
(function () {
  const SITE_CONTENT_PATH = "./data/site-content.json";

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initialsFromName(name) {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  let siteData = null;

  function getLang() {
    return typeof translationManager !== "undefined"
      ? translationManager.getCurrentLanguage()
      : "fr";
  }

  function tHero() {
    const lang = getLang();
    return siteData.hero[lang] || siteData.hero.fr;
  }

  async function loadSiteContent() {
    const res = await fetch(SITE_CONTENT_PATH);
    siteData = await res.json();
    return siteData;
  }

  function renderHero() {
    if (!siteData) return;
    const h = tHero();
    const elBadge = document.getElementById("hero-badge");
    const elRole = document.getElementById("hero-role");
    const elTagline = document.getElementById("hero-tagline");
    const elName = document.getElementById("hero-name");
    if (elBadge) elBadge.textContent = h.badge;
    if (elName) elName.textContent = h.nameLine;
    if (elRole) elRole.textContent = h.role;
    if (elTagline) elTagline.textContent = h.tagline;

    const cvPath = siteData.hero.cvPath || "./CV Imdad ADENON.pdf";
    const cvBtn = document.getElementById("hero-btn-cv");
    if (cvBtn) {
      cvBtn.href = cvPath;
      const sp = cvBtn.querySelector("span:first-child");
      if (sp) sp.textContent = h.ctaCv;
    }
    const projBtn = document.getElementById("hero-btn-projects");
    if (projBtn) projBtn.textContent = h.ctaProjects;

    const discuss = document.getElementById("hero-btn-discuss");
    if (discuss) discuss.textContent = h.ctaDiscuss;

    const wa = document.getElementById("hero-btn-whatsapp");
    const waUrl = siteData.hero.whatsappUrl;
    if (wa && waUrl) {
      wa.href = waUrl;
      wa.classList.remove("hidden");
      wa.querySelector("span") && (wa.querySelector("span").textContent = h.ctaWhatsapp);
    } else if (wa) wa.classList.add("hidden");

    const cal = document.getElementById("hero-btn-calendly");
    const calUrl = siteData.hero.calendlyUrl;
    if (cal) {
      if (calUrl) {
        cal.href = calUrl;
        cal.target = "_blank";
        cal.rel = "noopener noreferrer";
        cal.classList.remove("hidden");
        cal.querySelector("span") &&
          (cal.querySelector("span").textContent = h.ctaCalendly);
      } else {
        cal.classList.add("hidden");
      }
    }
  }

  function renderTrust() {
    const root = document.getElementById("trust-section");
    if (!root || !siteData.trust) return;
    const lang = getLang();
    const meta = siteData.trust[lang] || siteData.trust.fr;
    const items = siteData.trust.items || [];

    function trustMarqueeItem(it, opts) {
      const duplicate = opts && opts.duplicate;
      const dupAttr = duplicate ? ' tabindex="-1" aria-hidden="true"' : "";
      const dupClass = duplicate ? " trust-marquee__card--dup" : "";

      const logoSrc = (it.logo || "").trim();
      const logoBlock = logoSrc
        ? `<img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(it.name)}" class="trust-marquee__logo" loading="lazy" decoding="async" />`
        : `<div class="trust-marquee__logo-fallback tech-font" aria-hidden="true">${escapeHtml(initialsFromName(it.name))}</div>`;

      const inner = `
        <div class="trust-marquee__card-inner holographic flex items-center justify-center rounded-2xl border border-gray-700/40 shadow-lg shadow-black/20">
          <div class="trust-marquee__logo-wrap flex-shrink-0 flex items-center justify-center">
            ${logoBlock}
          </div>
        </div>`;

      if (it.url && String(it.url).trim()) {
        return `
        <a href="${escapeHtml(it.url)}" target="_blank" rel="noopener noreferrer" class="trust-marquee__card flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-2xl${dupClass}"${dupAttr}>
          ${inner}
        </a>`;
      }
      return `<div class="trust-marquee__card flex-shrink-0${dupClass}"${duplicate ? ' aria-hidden="true"' : ""}>${inner}</div>`;
    }

    if (!items.length) {
      root.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-8">
            <h2 class="text-3xl md:text-5xl font-bold mb-4 tech-font">
              <span class="gradient-text">${escapeHtml(meta.title)}</span>
            </h2>
            <p class="text-gray-400">${escapeHtml(meta.fallback)}</p>
          </div>
        </div>`;
      return;
    }

    const stripHtml =
      items.map((it) => trustMarqueeItem(it, { duplicate: false })).join("") +
      items.map((it) => trustMarqueeItem(it, { duplicate: true })).join("");

    const narrow =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(max-width: 639px)").matches;
    /* Plus rapide : durée réduite (secondes). Une seule bande flex = boucle sans couture visible. */
    const durationSec = Math.max(
      12,
      Math.round(items.length * 4.2 * (narrow ? 0.92 : 0.88))
    );

    root.innerHTML = `
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full min-w-0">
        <div class="text-center mb-8 sm:mb-10 md:mb-12 px-1">
          <h2 class="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4 tech-font leading-tight">
            <span class="gradient-text">${escapeHtml(meta.title)}</span>
          </h2>
          <p class="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">${escapeHtml(meta.subtitle)}</p>
        </div>
      </div>
      <div class="trust-marquee w-full min-w-0" role="region" aria-label="${escapeHtml(meta.title)}">
        <div class="trust-marquee__track" style="--trust-duration:${durationSec}s">
          <div class="trust-marquee__strip">${stripHtml}</div>
        </div>
      </div>`;

    if (typeof window.initScrollAnimations === "function") {
      requestAnimationFrame(() => window.initScrollAnimations());
    }
  }

  function renderSpecializations() {
    const root = document.getElementById("specializations-section");
    if (!root || !siteData.specializations) return;
    const lang = getLang();
    const title = siteData.specializations[lang]?.title || siteData.specializations.fr.title;
    const tags = siteData.specializations.tags || [];

    const chips = tags
      .map((tag) => {
        const label = tag[lang] || tag.fr;
        return `<span class="px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-blue-500/20 border border-blue-400/50 text-gray-200">${escapeHtml(label)}</span>`;
      })
      .join("");

    root.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-sm uppercase tracking-widest text-blue-300/80 mb-3 tech-font">${escapeHtml(title)}</p>
        <div class="flex flex-wrap justify-center gap-3">${chips}</div>
      </div>`;
  }

  function renderStarsRating(rating) {
    const r = Math.min(5, Math.max(0, Math.round(Number(rating) || 5)));
    let h = `<p class="flex gap-1 mb-4 justify-center sm:justify-start" aria-label="${r}/5">`;
    for (let i = 1; i <= 5; i += 1) {
      h += `<i class="fas fa-star text-lg sm:text-xl ${i <= r ? "text-amber-400" : "text-gray-600"}"></i>`;
    }
    h += "</p>";
    return h;
  }

  function initTestimonialsCarousel(slideCount) {
    const root = document.getElementById("testimonials-carousel");
    if (!root || slideCount < 1) return;

    const track = root.querySelector(".testimonials-carousel__track");
    const prev = root.querySelector(".testimonials-carousel__btn--prev");
    const next = root.querySelector(".testimonials-carousel__btn--next");
    const dotsWrap = root.querySelector(".testimonials-carousel__dots");
    if (!track || !prev || !next || !dotsWrap) return;

    let idx = 0;
    let timer = null;

    function go(i) {
      idx = (i + slideCount) % slideCount;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dotsWrap.querySelectorAll("[data-t-dot]").forEach((b, j) => {
        b.classList.toggle("testimonials-carousel__dot--active", j === idx);
        b.setAttribute("aria-current", j === idx ? "true" : "false");
      });
    }

    dotsWrap.innerHTML = Array.from({ length: slideCount }, (_, i) => {
      return `<button type="button" data-t-dot="${i}" class="testimonials-carousel__dot w-2.5 h-2.5 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors ${i === 0 ? "testimonials-carousel__dot--active" : ""}" aria-label="${i + 1} / ${slideCount}" aria-current="${i === 0 ? "true" : "false"}"></button>`;
    }).join("");

    dotsWrap.addEventListener("click", (e) => {
      const b = e.target.closest("[data-t-dot]");
      if (b) go(parseInt(b.getAttribute("data-t-dot"), 10));
    });
    prev.addEventListener("click", () => go(idx - 1));
    next.addEventListener("click", () => go(idx + 1));

    function startAuto() {
      if (slideCount < 2) return;
      clearInterval(timer);
      timer = setInterval(() => go(idx + 1), 6500);
    }
    root.addEventListener("mouseenter", () => clearInterval(timer));
    root.addEventListener("mouseleave", startAuto);
    root.addEventListener("focusin", () => clearInterval(timer));
    root.addEventListener("focusout", startAuto);
    startAuto();
  }

  function renderMethod() {
    const root = document.getElementById("method-section");
    if (!root || !siteData.method) return;
    const lang = getLang();
    const meta = siteData.method[lang] || siteData.method.fr;
    const steps = siteData.method.steps || [];

    const stepHtml = steps
      .map((step, i) => {
        const s = step[lang] || step.fr;
        const icon = step.icon || "fa-circle";
        return `
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
            <i class="fas ${escapeHtml(icon)}"></i>
          </div>
          <div>
            <p class="text-sm text-blue-300/80 mb-1">0${i + 1}</p>
            <h4 class="font-semibold text-white mb-1">${escapeHtml(s.title)}</h4>
            <p class="text-gray-400 text-sm leading-relaxed">${escapeHtml(s.desc)}</p>
          </div>
        </div>`;
      })
      .join("");

    root.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-5xl font-bold mb-4 tech-font">
            <span class="gradient-text">${escapeHtml(meta.title)}</span>
          </h2>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">${escapeHtml(meta.subtitle)}</p>
        </div>
        <div class="holographic rounded-3xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          ${stepHtml}
        </div>
      </div>`;
  }

  function renderServices() {
    const root = document.getElementById("services-section");
    if (!root || !siteData.services) return;
    const lang = getLang();
    const meta = siteData.services[lang] || siteData.services.fr;
    const items = siteData.services.items || [];

    const cards = items
      .map((sv) => {
        const s = sv[lang] || sv.fr;
        const icon = sv.icon || "fa-star";
        return `
        <div class="feature-panel holographic rounded-2xl p-6 border border-gray-700/50">
          <div class="w-12 h-12 mb-4 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <i class="fas ${escapeHtml(icon)} text-blue-300 text-xl"></i>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">${escapeHtml(s.title)}</h3>
          <p class="text-gray-400 text-sm leading-relaxed">${escapeHtml(s.desc)}</p>
        </div>`;
      })
      .join("");

    root.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-5xl font-bold mb-4 tech-font">
            <span class="gradient-text">${escapeHtml(meta.title)}</span>
          </h2>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">${escapeHtml(meta.subtitle)}</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">${cards}</div>
      </div>`;

    if (typeof window.initScrollAnimations === "function") {
      requestAnimationFrame(() => window.initScrollAnimations());
    }
  }

  function renderTestimonials() {
    const root = document.getElementById("testimonials-section");
    if (!root || !siteData.testimonials) return;
    const lang = getLang();
    const meta = siteData.testimonials[lang] || siteData.testimonials.fr;
    const items = siteData.testimonials.items || [];
    const prevLabel = lang === "en" ? "Previous testimonial" : "Témoignage précédent";
    const nextLabel = lang === "en" ? "Next testimonial" : "Témoignage suivant";

    const slides = items
      .map((it) => {
        const t = it[lang] || it.fr;
        const stars = renderStarsRating(it.rating != null ? it.rating : 5);
        return `
        <article class="testimonials-slide flex-shrink-0 w-full min-w-full px-1 sm:px-3 box-border">
          <div class="feature-panel holographic rounded-2xl p-6 sm:p-8 border border-purple-500/20 max-w-xl mx-auto">
            ${stars}
            <p class="text-gray-200 text-base sm:text-lg mb-6 leading-relaxed text-center sm:text-left">“${escapeHtml(t.quote)}”</p>
            <p class="font-semibold gradient-text text-center sm:text-left">${escapeHtml(t.author)}</p>
            <p class="text-sm text-gray-500 text-center sm:text-left">${escapeHtml(t.role)}</p>
          </div>
        </article>`;
      })
      .join("");

    root.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10 sm:mb-12">
          <h2 class="text-3xl md:text-5xl font-bold mb-4 tech-font">
            <span class="gradient-text">${escapeHtml(meta.title)}</span>
          </h2>
          <p class="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">${escapeHtml(meta.subtitle)}</p>
        </div>
        <div id="testimonials-carousel" class="testimonials-carousel relative max-w-3xl mx-auto pb-2">
          <button type="button" class="testimonials-carousel__btn testimonials-carousel__btn--prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gray-800/90 border border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white flex items-center justify-center -translate-x-0 sm:-translate-x-1 lg:-translate-x-4" aria-label="${escapeHtml(prevLabel)}">
            <i class="fas fa-chevron-left text-sm sm:text-base"></i>
          </button>
          <button type="button" class="testimonials-carousel__btn testimonials-carousel__btn--next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gray-800/90 border border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white flex items-center justify-center translate-x-0 sm:translate-x-1 lg:translate-x-4" aria-label="${escapeHtml(nextLabel)}">
            <i class="fas fa-chevron-right"></i>
          </button>
          <div class="overflow-hidden rounded-2xl mx-0 sm:mx-12">
            <div class="testimonials-carousel__track flex transition-transform duration-500 ease-out will-change-transform" style="transform:translateX(0)">
              ${slides}
            </div>
          </div>
          <div class="testimonials-carousel__dots flex flex-wrap justify-center gap-2 mt-8 min-h-[1.25rem]" role="tablist" aria-label="${escapeHtml(meta.title)}"></div>
        </div>
      </div>`;

    initTestimonialsCarousel(items.length);

    if (typeof window.initScrollAnimations === "function") {
      requestAnimationFrame(() => window.initScrollAnimations());
    }
  }

  function renderContactExtras() {
    if (!siteData.contactExtras) return;
    const lang = getLang();
    const c = siteData.contactExtras[lang] || siteData.contactExtras.fr;
    const priv = document.getElementById("contact-privacy");
    const bar = document.getElementById("contact-cta-bar");
    if (priv) priv.textContent = c.privacy;
    if (bar) bar.textContent = c.ctaBar;
  }

  function renderAll() {
    if (!siteData) return;
    renderHero();
    renderTrust();
    renderSpecializations();
    renderMethod();
    renderServices();
    renderTestimonials();
    renderContactExtras();
  }

  window.renderSiteContent = renderAll;
  window.loadSiteContent = loadSiteContent;
})();
