/**
 * LinkedIn Recruiter Outreach System - Master App Entry & Router
 */

class App {
  static init() {
    this.bindNavigation();
    this.bindGlobalActions();
    this.initControllers();
    this.checkInitialTheme();
  }

  static bindNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const panels = document.querySelectorAll('.view-panel');
    const headerTitle = document.getElementById('header-title-text');
    const headerSubtitle = document.getElementById('header-subtitle-text');

    const titles = {
      generator: {
        title: 'Outreach Studio',
        subtitle: 'Craft hyper-personalized 4-step outreach sequences tailored to recruiters & target roles'
      },
      kanban: {
        title: 'CRM Pipeline Board',
        subtitle: 'Track your recruiter outreach stages from discovery to interview offers'
      },
      leads: {
        title: 'Recruiter Directory',
        subtitle: 'Manage all recruiter contacts, stage histories, interview notes, and CSV backups'
      },
      analytics: {
        title: 'Outreach Analytics',
        subtitle: 'Response rates, connection conversion funnel, and campaign performance'
      },
      settings: {
        title: 'Candidate Profile & AI Settings',
        subtitle: 'Configure your resume metrics, tech stack, tone preferences, and LLM API keys'
      }
    };

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        panels.forEach(p => {
          if (p.id === `view-${view}`) {
            p.classList.add('active');
          } else {
            p.classList.remove('active');
          }
        });

        if (titles[view]) {
          if (headerTitle) headerTitle.textContent = titles[view].title;
          if (headerSubtitle) headerSubtitle.textContent = titles[view].subtitle;
        }

        // Trigger view specific refreshes
        if (view === 'kanban' && window.KanbanController) window.KanbanController.render();
        if (view === 'leads' && window.LeadsController) window.LeadsController.render();
        if (view === 'analytics' && window.AnalyticsController) window.AnalyticsController.render();
      });
    });
  }

  static bindGlobalActions() {
    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const isLight = document.body.getAttribute('data-theme') === 'light';
        const newTheme = isLight ? 'dark' : 'light';
        document.body.setAttribute('data-theme', newTheme);
        themeBtn.innerHTML = newTheme === 'light' ? '🌙' : '☀️';
        localStorage.setItem('lros_theme', newTheme);
        App.showToast(`Switched to ${newTheme} theme`, 'info');
      });
    }
  }

  static checkInitialTheme() {
    const savedTheme = localStorage.getItem('lros_theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.innerHTML = savedTheme === 'light' ? '🌙' : '☀️';
    }
  }

  static initControllers() {
    window.GeneratorController = new GeneratorController();
    window.KanbanController = new KanbanController();
    window.LeadsController = new LeadsController();
    window.AnalyticsController = new AnalyticsController();
    window.SettingsController = new SettingsController();
  }

  static showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '⚠️';
    if (type === 'warning') icon = '⚡';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    // Trigger enter animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }
}

window.App = App;

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
