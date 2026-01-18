class ProjectsManager {
  constructor(projectsPath = './data/projects-designer.json') {
    this.projectsPath = projectsPath;
    this.projects = null;
    this.currentLang = 'fr';
  }

  async loadProjects() {
    try {
      const response = await fetch(this.projectsPath);
      this.projects = await response.json();
      return this.projects;
    } catch (error) {
      console.error('Erreur chargement projets:', error);
      return null;
    }
  }

  setLanguage(lang) {
    this.currentLang = lang;
  }

  updateProjects() {
    this.renderRecentProjects();
    this.renderAllProjects();
  }
}
