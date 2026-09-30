/**
 * LinkedIn Recruiter Outreach System - Kanban Pipeline Controller
 */

class KanbanController {
  constructor() {
    this.stages = [
      { id: 'discovered', label: 'Discovered', indicator: 'indicator-discovered' },
      { id: 'sent', label: 'Connection Sent', indicator: 'indicator-sent' },
      { id: 'connected', label: 'Connected', indicator: 'indicator-connected' },
      { id: 'followup1', label: 'Follow-Up 1', indicator: 'indicator-followup1' },
      { id: 'followup2', label: 'Follow-Up 2', indicator: 'indicator-followup2' },
      { id: 'interview', label: 'Interviewing', indicator: 'indicator-interview' },
      { id: 'offer', label: 'Offer / Closed', indicator: 'indicator-offer' }
    ];
    this.draggedLeadId = null;
    this.init();
  }

  init() {
    this.container = document.getElementById('kanban-board');
    if (this.container) {
      this.render();
      this.bindDragEvents();
    }
  }

  render() {
    if (!this.container) return;
    const leads = window.StorageManager.getLeads();

    this.container.innerHTML = this.stages.map(stage => {
      const stageLeads = leads.filter(l => (l.stage || 'discovered') === stage.id);
      
      const cardsHTML = stageLeads.length === 0
        ? `<div class="column-empty">No leads in this stage</div>`
        : stageLeads.map(lead => this.createCardHTML(lead)).join('');

      return `
        <div class="kanban-column" data-stage="${stage.id}">
          <div class="kanban-column-header">
            <div class="column-title-group">
              <div class="column-indicator ${stage.indicator}"></div>
              <span class="column-title">${stage.label}</span>
            </div>
            <span class="column-count">${stageLeads.length}</span>
          </div>
          <div class="kanban-cards-list" data-stage="${stage.id}">
            ${cardsHTML}
          </div>
        </div>
      `;
    }).join('');

    this.attachCardEventListeners();
  }

  createCardHTML(lead) {
    const priorityClass = `priority-${lead.priority || 'normal'}`;
    const dateFormatted = new Date(lead.lastUpdated || lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    return `
      <div class="kanban-card" draggable="true" data-id="${lead.id}">
        <div class="card-top-row">
          <span class="card-company-badge">${this.escapeHTML(lead.company)}</span>
          <span class="card-priority-dot ${priorityClass}" title="Priority: ${lead.priority}"></span>
        </div>
        <div class="card-recruiter-name">${this.escapeHTML(lead.recruiterName)}</div>
        <div class="card-recruiter-role">${this.escapeHTML(lead.recruiterRole || 'Technical Recruiter')}</div>
        <div class="card-target-role">
          <span>🎯</span>
          <span>${this.escapeHTML(lead.targetRole || 'Software Engineer')}</span>
        </div>
        <div class="card-footer">
          <div class="card-date-badge">
            <span>🕒</span>
            <span>${dateFormatted}</span>
          </div>
          <div class="card-actions-quick">
            <button class="btn-card-action btn-copy-stage-msg" data-id="${lead.id}" title="Copy Next Touchpoint Message">
              📋
            </button>
            <button class="btn-card-action btn-advance-stage" data-id="${lead.id}" title="Advance to Next Stage">
              ➔
            </button>
            <button class="btn-card-action btn-open-lead-modal" data-id="${lead.id}" title="View Details">
              👁️
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindDragEvents() {
    this.container.addEventListener('dragstart', (e) => {
      const card = e.target.closest('.kanban-card');
      if (card) {
        this.draggedLeadId = card.dataset.id;
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.draggedLeadId);
      }
    });

    this.container.addEventListener('dragend', (e) => {
      const card = e.target.closest('.kanban-card');
      if (card) {
        card.classList.remove('dragging');
      }
      document.querySelectorAll('.kanban-cards-list').forEach(col => col.classList.remove('drag-over'));
      this.draggedLeadId = null;
    });

    this.container.addEventListener('dragover', (e) => {
      e.preventDefault();
      const list = e.target.closest('.kanban-cards-list');
      if (list) {
        list.classList.add('drag-over');
      }
    });

    this.container.addEventListener('dragleave', (e) => {
      const list = e.target.closest('.kanban-cards-list');
      if (list && !list.contains(e.relatedTarget)) {
        list.classList.remove('drag-over');
      }
    });

    this.container.addEventListener('drop', (e) => {
      e.preventDefault();
      const list = e.target.closest('.kanban-cards-list');
      if (list && this.draggedLeadId) {
        list.classList.remove('drag-over');
        const newStage = list.dataset.stage;
        window.StorageManager.updateLeadStage(this.draggedLeadId, newStage);
        this.render();
        if (window.LeadsController) window.LeadsController.render();
        if (window.AnalyticsController) window.AnalyticsController.render();
        window.App.showToast(`Updated lead stage to ${newStage.toUpperCase()}`, 'success');
      }
    });
  }

  attachCardEventListeners() {
    // Quick copy touchpoint message
    this.container.querySelectorAll('.btn-copy-stage-msg').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const leadId = btn.dataset.id;
        this.copyStageMessage(leadId);
      });
    });

    // Advance stage
    this.container.querySelectorAll('.btn-advance-stage').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const leadId = btn.dataset.id;
        this.advanceStage(leadId);
      });
    });

    // View lead details
    this.container.querySelectorAll('.btn-open-lead-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const leadId = btn.dataset.id;
        window.LeadsController.openLeadModal(leadId);
      });
    });
  }

  advanceStage(leadId) {
    const leads = window.StorageManager.getLeads();
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const stageIds = this.stages.map(s => s.id);
    const currentIndex = stageIds.indexOf(lead.stage || 'discovered');
    if (currentIndex < stageIds.length - 1) {
      const nextStage = stageIds[currentIndex + 1];
      window.StorageManager.updateLeadStage(leadId, nextStage);
      this.render();
      if (window.LeadsController) window.LeadsController.render();
      if (window.AnalyticsController) window.AnalyticsController.render();
      window.App.showToast(`Advanced ${lead.recruiterName} to ${nextStage}`, 'success');
    } else {
      window.App.showToast(`${lead.recruiterName} is already at the final stage!`, 'warning');
    }
  }

  async copyStageMessage(leadId) {
    const leads = window.StorageManager.getLeads();
    const lead = leads.find(l => l.id === leadId);
    if (!lead || !lead.sequences) {
      window.App.showToast('No sequence found for this lead.', 'warning');
      return;
    }

    let msg = '';
    let stageName = '';
    switch (lead.stage) {
      case 'discovered':
      case 'sent':
        msg = lead.sequences.connectionNote;
        stageName = 'Connection Note';
        break;
      case 'connected':
      case 'followup1':
        msg = lead.sequences.followUp1;
        stageName = 'Follow-Up 1 (Value Drop)';
        break;
      case 'followup2':
        msg = lead.sequences.followUp2;
        stageName = 'Follow-Up 2 (Check-in)';
        break;
      case 'interview':
      case 'offer':
      default:
        msg = lead.sequences.inMail;
        stageName = 'InMail / Full Pitch';
        break;
    }

    if (!msg) msg = lead.sequences.connectionNote || 'No message';

    try {
      await navigator.clipboard.writeText(msg);
      window.App.showToast(`Copied ${stageName} for ${lead.recruiterName}!`, 'success');
    } catch (e) {
      window.App.showToast('Unable to copy to clipboard', 'warning');
    }
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}

window.KanbanController = KanbanController;
