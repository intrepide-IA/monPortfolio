// projects-manager-dev.js - Gestionnaire de projets pour le profil Développeur Frontend

class ProjectsManager {
  constructor(projectsPath = "./data/projects-dev.json") {
    this.projectsPath = projectsPath;
    this.projects = null;
    this.currentLang = "fr";
  }

  async loadProjects() {
    try {
      const response = await fetch(this.projectsPath);
      const data = await response.json();
      // Les projets sont structurés avec recentProjects et allProjects comme clés
      this.recentProjects = data.recentProjects || [];
      this.allProjects = data.allProjects || [];
      this.projects = [...this.recentProjects, ...this.allProjects];
      return this.projects;
    } catch (error) {
      console.error("Erreur chargement projets:", error);
      return null;
    }
  }

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
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-cube text-xl"></i>
            </div>
            <h3 class="text-2xl font-bold gradient-text-dev tech-font">${project.name}</h3>
          </div>
        </div>
        <p class="text-gray-300 mt-6 mb-6">${trans.description}</p>
        <div class="relative h-40 mt-6 rounded-xl overflow-hidden">
          <img class="w-full h-full object-cover" src="${project.image}" alt="${project.name}">
        </div>
        <div class="relative flex items-center mt-6 justify-between">
          <a target="_blank" href="${project.demoLink}" 
             class="border border-blue-500 bg-blue-400 bg-opacity-20 rounded-full px-4 py-1 text-blue-400 font-medium flex items-center group">
            <span>Voir le projet</span>
          </a>
          ${
            project.githubLink
              ? `<a target="_blank" href="${project.githubLink}" 
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

  // Générer une carte de projet complet
  generateFullProjectCard(project) {
    const trans = project.translations[this.currentLang];
    const statusText = project.status === "in-development" ? trans.status : "";
    const technologies = project.technologies || [];

    return `
      <div class="feature-panel holographic rounded-2xl overflow-hidden transition-all duration-700 hover:transform hover:scale-105">
        <div class="relative h-64">
          <img class="w-full h-full object-cover" src="${project.image}" alt="${project.name}">
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
          <div class="absolute bottom-0 left-0 p-6">
            <h3 class="text-2xl font-bold mb-1">${project.name}</h3>
            <span class="text-sm text-violet-400">${trans.categoryLabel}</span>
          </div>
        </div>
        <div class="p-6">
          <p class="text-gray-300 mb-4">${trans.description}</p>
          ${
            technologies.length > 0
              ? `<div class="flex flex-wrap gap-2 mb-4">
            ${technologies.map((tech) => `<span class="text-xs bg-violet-500/20 border border-violet-500/50 px-2 py-1 rounded">${tech}</span>`).join("")}
          </div>`
              : ""
          }
          <div class="relative flex items-center mt-6 justify-between">
            <a target="_blank" href="${project.demoLink}" 
               class="border border-blue-500 bg-blue-400 bg-opacity-20 rounded-full px-2 py-1 text-blue-400 font-medium flex items-center group">
              <span>Voir</span>
            </a>
            ${
              project.githubLink
                ? `<a target="_blank" href="${project.githubLink}" 
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

  // Obtenir les 3 derniers projets
  getRecentProjects() {
    if (!this.recentProjects || this.recentProjects.length === 0) {
      return [];
    }
    return this.recentProjects.slice(0, 3);
  }

  // Obtenir tous les projets
  getAllProjects() {
    return this.allProjects || [];
  }

  // Rendre les projets récents
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

  // Rendre tous les projets
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

  // Mettre à jour les projets (rafraîchir l'affichage)
  updateProjects() {
    this.renderRecentProjects();
    this.renderAllProjects();
  }
}

// Instantier le gestionnaire de projets
const projectsManager = new ProjectsManager("./data/projects-dev.json");
