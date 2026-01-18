// projects-data.js - Gestionnaire de projets dynamique

class ProjectsManager {
  constructor() {
    this.projects = null;
    this.currentLang = "fr";
  }

  // Charger les projets depuis le fichier JSON
  async loadProjects() {
    try {
      const response = await fetch("./data/projects.json");
      this.projects = await response.json();
      return this.projects;
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error);
      return null;
    }
  }

  // Définir la langue actuelle
  setLanguage(lang) {
    this.currentLang = lang;
  }

  // Générer une carte de projet récent
  generateRecentProjectCard(project) {
    const trans = project.translations[this.currentLang];
    const statusText = project.status === "in-development" ? trans.status : "";

    return `
      <div class="feature-panel holographic p-8 rounded-2xl transition-all duration-700 hover:transform hover:scale-105">
        <div class="relative">
          <div class="absolute -left-2 -top-2 w-12 h-12 bg-blue-500 rounded-full opacity-20 blur-sm"></div>
          <div class="relative flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-cube text-xl"></i>
            </div>
            <h3 class="text-2xl font-bold gradient-text tech-font">${project.name}</h3>
          </div>
        </div>
        <p class="text-gray-300 mt-6 mb-6">${trans.description}</p>
        <div class="relative h-40 mt-6 rounded-xl overflow-hidden">
          <img class="w-full h-full object-cover" src="${project.image}" alt="${project.name}">
        </div>
        <div class="relative flex items-center mt-6 justify-between">
          <a target="_blank" href="${project.figmaLink}" 
             class="border border-blue-500 bg-blue-400 bg-opacity-20 rounded-full px-4 py-1 text-blue-400 font-medium flex items-center group">
            <span>Figma</span>
          </a>
          ${
            project.websiteLink
              ? `<a target="_blank" href="${project.websiteLink}" 
                class="gradient-text text-blue-40 font-medium flex items-center group">
               <span>Site web</span>
               <i class="fas fa-arrow-right ml-2 group-hover:ml-3 transition-all duration-300"></i>
             </a>`
              : `<span class="gradient-text text-blue-40 font-medium">${statusText}</span>`
          }
        </div>
      </div>
    `;
  }

  // Générer une carte de projet complet
  generateFullProjectCard(project) {
    const trans = project.translations[this.currentLang];
    const statusText = project.status === "in-development" ? trans.status : "";

    return `
      <div class="feature-panel holographic rounded-2xl overflow-hidden transition-all duration-700 hover:transform hover:scale-105">
        <div class="relative h-64">
          <img class="w-full h-full object-cover" src="${project.image}" alt="${project.name}">
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
          <div class="absolute bottom-0 left-0 p-6">
            <h3 class="text-2xl font-bold mb-1">${project.name}</h3>
            <span class="text-sm text-${project.categoryColor}-400">${trans.categoryLabel}</span>
          </div>
        </div>
        <div class="p-6">
          <p class="text-gray-300 mb-4">${trans.description}</p>
          <div class="relative flex items-center mt-6 justify-between">
            <a target="_blank" href="${project.figmaLink}" 
               class="border border-blue-500 bg-blue-400 bg-opacity-20 rounded-full px-2 py-1 text-blue-400 font-medium flex items-center group">
              <span>Figma</span>
            </a>
            ${
              project.websiteLink
                ? `<a target="_blank" href="${project.websiteLink}" 
                  class="gradient-text text-blue-40 font-medium flex items-center group">
                 <span>Site web</span>
                 <i class="fas fa-arrow-right ml-2 group-hover:ml-3 transition-all duration-300"></i>
               </a>`
                : `<span class="gradient-text text-blue-40 font-medium">${statusText}</span>`
            }
          </div>
        </div>
      </div>
    `;
  }

  // Afficher les projets récents
  renderRecentProjects() {
    const container = document.getElementById("recent-projects-container");
    if (!container || !this.projects) return;

    const html = this.projects.recentProjects
      .map((project) => this.generateRecentProjectCard(project))
      .join("");

    container.innerHTML = html;
  }

  // Afficher tous les projets
  renderAllProjects() {
    const container = document.getElementById("all-projects-container");
    if (!container || !this.projects) return;

    const html = this.projects.allProjects
      .map((project) => this.generateFullProjectCard(project))
      .join("");

    container.innerHTML = html;
  }

  // Mettre à jour tous les projets affichés
  updateProjects() {
    this.renderRecentProjects();
    this.renderAllProjects();

    // IMPORTANT : réinitialiser les animations après rerender
    if (typeof window.initScrollAnimations === "function") {
      requestAnimationFrame(() => {
        window.initScrollAnimations();
      });
    }
  }
}

// Export pour utilisation
const projectsManager = new ProjectsManager();
