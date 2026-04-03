// projects-manager-dev.js - Profil Développeur (projets + études de cas optionnelles)

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

class ProjectsManager {
  constructor(projectsPath = "./data/projects-dev.json") {
    this.projectsPath = projectsPath;
    this.projects = null;
    this.recentProjects = [];
    this.allProjects = [];
    this.currentLang = "fr";
  }

  async loadProjects() {
    try {
      const response = await fetch(this.projectsPath);
      const data = await response.json();
      this.recentProjects = data.recentProjects || [];
      this.allProjects = data.allProjects || [];
      this.projects = data;
      return this.projects;
    } catch (error) {
      console.error("Erreur chargement projets:", error);
      return null;
    }
  }

  setLanguage(lang) {
    this.currentLang = lang;
  }

  findProjectById(id) {
    if (!id) return null;
    const r = this.recentProjects.find((p) => p.id === id);
    if (r) return r;
    return this.allProjects.find((p) => p.id === id) || null;
  }

  getCaseStudyLabels() {
    return this.currentLang === "en"
      ? {
          context: "Context",
          problem: "Problem",
          solution: "Solution",
          design: "Development & stack",
          results: "Results",
        }
      : {
          context: "Contexte",
          problem: "Problème",
          solution: "Solution",
          design: "Développement & stack",
          results: "Résultats",
        };
  }

  caseStudyOpenLabel() {
    return this.currentLang === "en" ? "Case study" : "Étude de cas";
  }

  buildCaseStudyModalBody(project) {
    if (!project.caseStudy) return "";
    const lang = this.currentLang;
    const cs = project.caseStudy[lang] || project.caseStudy.fr;
    const L = this.getCaseStudyLabels();
    const row = (label, text) =>
      text
        ? `<div class="case-study-row">
          <p class="text-xs uppercase tracking-wide text-blue-300/90 mb-1">${escapeHtml(label)}</p>
          <p class="text-gray-300 leading-relaxed">${escapeHtml(text)}</p>
        </div>`
        : "";

    return `
      <h2 id="case-study-modal-title" class="text-xl sm:text-2xl font-bold gradient-text-dev tech-font mb-6 pr-10">${escapeHtml(project.name)}</h2>
      <div class="space-y-4 text-left text-sm sm:text-base">
        ${row(L.context, cs.context)}
        ${row(L.problem, cs.problem)}
        ${row(L.solution, cs.solution)}
        ${row(L.design, cs.design)}
        ${
          cs.results
            ? `<div class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 mt-2">
            <p class="text-xs uppercase tracking-wide text-emerald-300/90 mb-1">${escapeHtml(L.results)}</p>
            <p class="text-gray-200 leading-relaxed">${escapeHtml(cs.results)}</p>
          </div>`
            : ""
        }
      </div>`;
  }

  openCaseStudyModal(projectId) {
    const modal = document.getElementById("case-study-modal");
    const body = document.getElementById("case-study-modal-body");
    if (!modal || !body) return;
    const project = this.findProjectById(projectId);
    if (!project || !project.caseStudy) return;
    body.innerHTML = this.buildCaseStudyModalBody(project);
    if (typeof modal.showModal === "function") modal.showModal();
  }

  initCaseStudyModal() {
    if (this._caseStudyModalBound) return;
    this._caseStudyModalBound = true;

    const modal = document.getElementById("case-study-modal");
    const closeBtn = document.getElementById("case-study-modal-close");
    if (!modal) return;

    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-case-study-open]");
      if (!t) return;
      e.preventDefault();
      const id = t.getAttribute("data-case-study-open");
      if (id && window.projectsManager) window.projectsManager.openCaseStudyModal(id);
    });

    closeBtn?.addEventListener("click", () => modal.close());
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.close();
    });
  }

  generateRecentProjectCard(project) {
    const trans = project.translations[this.currentLang];
    const statusText = project.status === "in-development" ? trans.status : "";
    const hasCs = !!(
      project.caseStudy &&
      (project.caseStudy.fr || project.caseStudy.en)
    );
    const csLabel = this.caseStudyOpenLabel();

    const csDesktop = hasCs
      ? `<button type="button" data-case-study-open="${escapeHtml(project.id)}"
        class="hidden md:flex absolute inset-0 z-10 items-center justify-center bg-black/0 hover:bg-black/55 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
        aria-label="${escapeHtml(csLabel)}">
        <span class="text-white text-sm font-medium px-4 py-2 rounded-full border border-white/25 bg-black/50 backdrop-blur-sm pointer-events-none">${escapeHtml(csLabel)}</span>
      </button>`
      : "";
    const csMobile = hasCs
      ? `<div class="mt-3 flex justify-center md:hidden">
        <button type="button" data-case-study-open="${escapeHtml(project.id)}"
          class="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 rounded-full px-4 py-2 transition-colors">
          <i class="fas fa-book-open"></i>${escapeHtml(csLabel)}
        </button>
      </div>`
      : "";

    const demoHref = project.demoLink || "#";
    const demoDisabled = !project.demoLink;
    const demoLabel = this.currentLang === "en" ? "View project" : "Voir le projet";

    return `
      <div class="feature-panel holographic p-8 rounded-2xl transition-all duration-700 hover:transform hover:scale-105">
        <div class="relative">
          <div class="absolute -left-2 -top-2 w-12 h-12 bg-blue-500 rounded-full opacity-20 blur-sm"></div>
          <div class="relative flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-cube text-xl"></i>
            </div>
            <h3 class="text-2xl font-bold gradient-text-dev tech-font">${project.name}</h3>
          </div>
        </div>
        <p class="text-gray-300 mt-6 mb-6">${trans.description}</p>
        <div class="relative h-40 mt-6 rounded-xl overflow-hidden group">
          <img class="w-full h-full object-cover transition duration-500 group-hover:scale-[1.02]" src="${project.image}" alt="${escapeHtml(project.name)} — aperçu projet" loading="lazy" decoding="async">
          ${csDesktop}
        </div>
        ${csMobile}
        <div class="relative flex items-center mt-6 justify-between flex-wrap gap-2">
          <a target="_blank" rel="noopener noreferrer" href="${demoHref}"
             class="border border-blue-500 bg-blue-400 bg-opacity-20 rounded-full px-4 py-1 text-blue-400 font-medium flex items-center group ${demoDisabled ? "pointer-events-none opacity-50" : ""}">
            <span>${escapeHtml(demoLabel)}</span>
          </a>
          ${
            project.githubLink
              ? `<a target="_blank" rel="noopener noreferrer" href="${project.githubLink}"
                class="gradient-text-dev text-blue-40 font-medium flex items-center group">
               <span>Code</span>
               <i class="fas fa-arrow-right ml-2 group-hover:ml-3 transition-all duration-300"></i>
             </a>`
              : `<span class="gradient-text-dev text-blue-40 font-medium">${statusText}</span>`
          }
        </div>
      </div>
    `;
  }

  generateFullProjectCard(project) {
    const trans = project.translations[this.currentLang];
    const statusText = project.status === "in-development" ? trans.status : "";
    const technologies =
      project.technologies || trans.technologies || [];
    const hasCs = !!(
      project.caseStudy &&
      (project.caseStudy.fr || project.caseStudy.en)
    );
    const csLabel = this.caseStudyOpenLabel();

    const csBtnDesktop = hasCs
      ? `<button type="button" data-case-study-open="${escapeHtml(project.id)}"
        class="hidden md:flex absolute inset-0 z-10 items-center justify-center bg-black/0 hover:bg-black/55 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
        aria-label="${escapeHtml(csLabel)}">
        <span class="text-white text-sm font-medium px-4 py-2 rounded-full border border-white/25 bg-black/50 backdrop-blur-sm pointer-events-none">${escapeHtml(csLabel)}</span>
      </button>`
      : "";
    const csBtnMobile = hasCs
      ? `<div class="mt-3 flex justify-center md:hidden">
        <button type="button" data-case-study-open="${escapeHtml(project.id)}"
          class="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 rounded-full px-4 py-2 transition-colors">
          <i class="fas fa-book-open"></i>${escapeHtml(csLabel)}
        </button>
      </div>`
      : "";

    const demoHref = project.demoLink || "#";
    const demoDisabled = !project.demoLink;
    const viewLabel = this.currentLang === "en" ? "View" : "Voir";

    return `
      <div class="feature-panel holographic rounded-2xl overflow-hidden transition-all duration-700 hover:transform hover:scale-105">
        <div class="relative h-64 group">
          <img class="w-full h-full object-cover transition duration-500 group-hover:scale-[1.02]" src="${project.image}" alt="${escapeHtml(project.name)} — aperçu projet" loading="lazy" decoding="async">
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none"></div>
          <div class="absolute bottom-0 left-0 p-6 pointer-events-none">
            <h3 class="text-2xl font-bold mb-1">${project.name}</h3>
            <span class="text-sm text-violet-400">${trans.categoryLabel}</span>
          </div>
          ${csBtnDesktop}
        </div>
        ${csBtnMobile}
        <div class="p-6">
          <p class="text-gray-300 mb-4">${trans.description}</p>
          ${
            technologies.length > 0
              ? `<div class="flex flex-wrap gap-2 mb-4">
            ${technologies.map((tech) => `<span class="text-xs bg-violet-500/20 border border-violet-500/50 px-2 py-1 rounded">${escapeHtml(tech)}</span>`).join("")}
          </div>`
              : ""
          }
          <div class="relative flex items-center mt-6 justify-between flex-wrap gap-2">
            <a target="_blank" rel="noopener noreferrer" href="${demoHref}"
               class="border border-blue-500 bg-blue-400 bg-opacity-20 rounded-full px-2 py-1 text-blue-400 font-medium flex items-center group ${demoDisabled ? "pointer-events-none opacity-50" : ""}">
              <span>${escapeHtml(viewLabel)}</span>
            </a>
            ${
              project.githubLink
                ? `<a target="_blank" rel="noopener noreferrer" href="${project.githubLink}"
                  class="gradient-text-dev text-blue-40 font-medium flex items-center group">
                 <span>Code</span>
                 <i class="fas fa-arrow-right ml-2 group-hover:ml-3 transition-all duration-300"></i>
               </a>`
                : `<span class="gradient-text-dev text-blue-40 font-medium">${statusText}</span>`
            }
          </div>
        </div>
      </div>
    `;
  }

  getRecentProjects() {
    if (!this.recentProjects || this.recentProjects.length === 0) return [];
    return this.recentProjects.slice(0, 3);
  }

  getAllProjects() {
    return this.allProjects || [];
  }

  renderRecentProjects() {
    const container = document.getElementById("recent-projects-container");
    if (!container) return;

    const recentProjects = this.getRecentProjects();
    if (recentProjects.length === 0) {
      container.innerHTML =
        '<p class="text-center text-gray-400">Aucun projet disponible</p>';
      return;
    }

    container.innerHTML = recentProjects
      .map((project) => this.generateRecentProjectCard(project))
      .join("");
  }

  renderAllProjects() {
    const container = document.getElementById("all-projects-container");
    if (!container) return;

    const allProjects = this.getAllProjects();
    if (allProjects.length === 0) {
      container.innerHTML =
        '<p class="text-center text-gray-400">Aucun projet disponible</p>';
      return;
    }

    container.innerHTML = allProjects
      .map((project) => this.generateFullProjectCard(project))
      .join("");
  }

  updateProjects() {
    this.renderRecentProjects();
    this.renderAllProjects();
    this.initCaseStudyModal();

    if (typeof window.initScrollAnimations === "function") {
      requestAnimationFrame(() => window.initScrollAnimations());
    }
  }
}

const projectsManager = new ProjectsManager("./data/projects-dev.json");
