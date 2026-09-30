/**
 * LinkedIn Recruiter Outreach System - Settings & Candidate Profile Controller
 */

class SettingsController {
  constructor() {
    this.init();
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.loadData();
  }

  cacheDOM() {
    this.formCandidate = document.getElementById('candidate-profile-form');
    this.inputName = document.getElementById('candidate-name');
    this.inputHeadline = document.getElementById('candidate-headline');
    this.inputYears = document.getElementById('candidate-years');
    this.inputSkills = document.getElementById('candidate-skills');
    this.inputAchievements = document.getElementById('candidate-achievements');
    this.inputPortfolio = document.getElementById('candidate-portfolio');
    this.inputLinkedIn = document.getElementById('candidate-linkedin');

    this.formSettings = document.getElementById('ai-settings-form');
    this.selectProvider = document.getElementById('ai-provider-select');
    this.inputGeminiKey = document.getElementById('gemini-api-key');
    this.inputOpenAIKey = document.getElementById('openai-api-key');
    this.selectDefaultTone = document.getElementById('default-tone-select');

    this.btnResetSample = document.getElementById('btn-reset-sample-data');
  }

  bindEvents() {
    if (this.formCandidate) {
      this.formCandidate.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveCandidate();
      });
    }

    if (this.formSettings) {
      this.formSettings.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSettings();
      });
    }

    if (this.btnResetSample) {
      this.btnResetSample.addEventListener('click', () => {
        if (confirm('Reset to default sample candidate and recruiter leads?')) {
          window.StorageManager.resetToSampleData();
          this.loadData();
          if (window.KanbanController) window.KanbanController.render();
          if (window.LeadsController) window.LeadsController.render();
          if (window.AnalyticsController) window.AnalyticsController.render();
          window.App.showToast('Sample dataset restored!', 'success');
        }
      });
    }
  }

  loadData() {
    const candidate = window.StorageManager.getCandidate();
    if (candidate) {
      if (this.inputName) this.inputName.value = candidate.name || '';
      if (this.inputHeadline) this.inputHeadline.value = candidate.headline || '';
      if (this.inputYears) this.inputYears.value = candidate.experienceYears || 5;
      if (this.inputSkills) this.inputSkills.value = (candidate.coreSkills || []).join(', ');
      if (this.inputAchievements) this.inputAchievements.value = (candidate.achievements || []).join('\n');
      if (this.inputPortfolio) this.inputPortfolio.value = candidate.portfolioUrl || '';
      if (this.inputLinkedIn) this.inputLinkedIn.value = candidate.linkedinUrl || '';

      // Update Quick Profile in Sidebar
      const sidebarName = document.getElementById('sidebar-user-name');
      const sidebarHeadline = document.getElementById('sidebar-user-headline');
      if (sidebarName) sidebarName.textContent = candidate.name || 'Candidate';
      if (sidebarHeadline) sidebarHeadline.textContent = candidate.headline || 'Software Engineer';
    }

    const settings = window.StorageManager.getSettings();
    if (settings) {
      if (this.selectProvider) this.selectProvider.value = settings.aiProvider || 'built_in';
      if (this.inputGeminiKey) this.inputGeminiKey.value = settings.geminiApiKey || '';
      if (this.inputOpenAIKey) this.inputOpenAIKey.value = settings.openaiApiKey || '';
      if (this.selectDefaultTone) this.selectDefaultTone.value = settings.defaultTone || 'value_first';
    }
  }

  saveCandidate() {
    const skills = this.inputSkills.value.split(',').map(s => s.trim()).filter(Boolean);
    const achievements = this.inputAchievements.value.split('\n').map(a => a.trim()).filter(Boolean);

    const candidate = {
      name: this.inputName.value.trim() || 'Candidate',
      headline: this.inputHeadline.value.trim(),
      experienceYears: parseInt(this.inputYears.value, 10) || 5,
      coreSkills: skills,
      achievements: achievements,
      portfolioUrl: this.inputPortfolio.value.trim(),
      linkedinUrl: this.inputLinkedIn.value.trim()
    };

    window.StorageManager.saveCandidate(candidate);
    this.loadData();
    window.App.showToast('Candidate profile updated!', 'success');
  }

  saveSettings() {
    const settings = {
      aiProvider: this.selectProvider.value,
      geminiApiKey: this.inputGeminiKey.value.trim(),
      openaiApiKey: this.inputOpenAIKey.value.trim(),
      defaultTone: this.selectDefaultTone.value
    };

    window.StorageManager.saveSettings(settings);
    window.App.showToast('AI Provider & Settings saved!', 'success');
  }
}

window.SettingsController = SettingsController;
