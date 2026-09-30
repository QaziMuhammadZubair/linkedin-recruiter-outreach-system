/**
 * LinkedIn Recruiter Outreach System - Leads Management Controller
 */

class LeadsController {
  constructor() {
    this.currentFilterStage = 'all';
    this.searchQuery = '';
    this.activeModalLead = null;
    this.activeModalTab = 'details';
    this.init();
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.render();
  }

  cacheDOM() {
    this.tableBody = document.getElementById('leads-table-body');
    this.searchInput = document.getElementById('leads-search-input');
    this.stageFilter = document.getElementById('leads-stage-filter');
    this.btnExportCSV = document.getElementById('btn-export-csv');
    this.btnExportJSON = document.getElementById('btn-export-json');
    this.modal = document.getElementById('lead-detail-modal');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
  }

  bindEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    if (this.stageFilter) {
      this.stageFilter.addEventListener('change', (e) => {
        this.currentFilterStage = e.target.value;
        this.render();
      });
    }

    if (this.btnExportCSV) {
      this.btnExportCSV.addEventListener('click', () => {
        window.StorageManager.exportLeadsCSV();
        window.App.showToast('Exported leads to CSV!', 'success');
      });
    }

    if (this.btnExportJSON) {
      this.btnExportJSON.addEventListener('click', () => {
        window.StorageManager.exportJSON();
        window.App.showToast('Exported full backup to JSON!', 'success');
      });
    }

    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', () => this.closeModal());
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }
  }

  render() {
    if (!this.tableBody) return;
    const leads = window.StorageManager.getLeads();

    const filtered = leads.filter(l => {
      const matchStage = this.currentFilterStage === 'all' || l.stage === this.currentFilterStage;
      const matchSearch = !this.searchQuery || 
        (l.recruiterName && l.recruiterName.toLowerCase().includes(this.searchQuery)) ||
        (l.company && l.company.toLowerCase().includes(this.searchQuery)) ||
        (l.targetRole && l.targetRole.toLowerCase().includes(this.searchQuery));
      return matchStage && matchSearch;
    });

    if (filtered.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding: 2.5rem; color: var(--text-muted);">
            No recruiter leads match the search criteria.
          </td>
        </tr>
      `;
      return;
    }

    this.tableBody.innerHTML = filtered.map(lead => {
      const updatedDate = new Date(lead.lastUpdated || lead.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });

      const priorityBadge = lead.priority === 'high' 
        ? '<span class="badge badge-rose">High</span>'
        : lead.priority === 'medium'
        ? '<span class="badge badge-amber">Medium</span>'
        : '<span class="badge badge-primary">Normal</span>';

      return `
        <tr data-id="${lead.id}">
          <td>
            <div class="lead-name-cell">
              <span class="lead-name-primary">${this.escapeHTML(lead.recruiterName)}</span>
              <span class="lead-name-role">${this.escapeHTML(lead.recruiterRole || 'Recruiter')}</span>
            </div>
          </td>
          <td>
            <strong>${this.escapeHTML(lead.company)}</strong>
            <div style="font-size:0.75rem; color:var(--text-muted);">${this.escapeHTML(lead.companyDomain || '')}</div>
          </td>
          <td>${this.escapeHTML(lead.targetRole || 'Software Engineer')}</td>
          <td>
            <select class="lead-stage-select" data-id="${lead.id}">
              <option value="discovered" ${lead.stage === 'discovered' ? 'selected' : ''}>Discovered</option>
              <option value="sent" ${lead.stage === 'sent' ? 'selected' : ''}>Connection Sent</option>
              <option value="connected" ${lead.stage === 'connected' ? 'selected' : ''}>Connected</option>
              <option value="followup1" ${lead.stage === 'followup1' ? 'selected' : ''}>Follow-Up 1</option>
              <option value="followup2" ${lead.stage === 'followup2' ? 'selected' : ''}>Follow-Up 2</option>
              <option value="interview" ${lead.stage === 'interview' ? 'selected' : ''}>Interview</option>
              <option value="offer" ${lead.stage === 'offer' ? 'selected' : ''}>Offer / Closed</option>
            </select>
          </td>
          <td>${priorityBadge}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn-secondary btn-sm btn-table-view" data-id="${lead.id}">View / Sequences</button>
              <button class="btn btn-danger btn-sm btn-table-delete" data-id="${lead.id}">✕</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.attachTableEvents();
  }

  attachTableEvents() {
    this.tableBody.querySelectorAll('.lead-stage-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const leadId = sel.dataset.id;
        const newStage = e.target.value;
        window.StorageManager.updateLeadStage(leadId, newStage);
        if (window.KanbanController) window.KanbanController.render();
        if (window.AnalyticsController) window.AnalyticsController.render();
        window.App.showToast(`Lead stage updated to ${newStage.toUpperCase()}`, 'success');
      });
    });

    this.tableBody.querySelectorAll('.btn-table-view').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openLeadModal(btn.dataset.id);
      });
    });

    this.tableBody.querySelectorAll('.btn-table-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const leadId = btn.dataset.id;
        if (confirm('Are you sure you want to remove this lead?')) {
          window.StorageManager.deleteLead(leadId);
          this.render();
          if (window.KanbanController) window.KanbanController.render();
          if (window.AnalyticsController) window.AnalyticsController.render();
          window.App.showToast('Lead removed', 'warning');
        }
      });
    });
  }

  openLeadModal(leadId) {
    const leads = window.StorageManager.getLeads();
    this.activeModalLead = leads.find(l => l.id === leadId);
    if (!this.activeModalLead) return;

    const modalTitle = document.getElementById('modal-lead-title');
    const modalContent = document.getElementById('modal-lead-body');

    if (modalTitle) {
      modalTitle.textContent = `${this.activeModalLead.recruiterName} (${this.activeModalLead.company})`;
    }

    this.renderModalContent();
    if (this.modal) this.modal.classList.add('active');
  }

  renderModalContent() {
    const modalContent = document.getElementById('modal-lead-body');
    if (!modalContent || !this.activeModalLead) return;

    const lead = this.activeModalLead;
    const seq = lead.sequences || {};

    modalContent.innerHTML = `
      <div class="lead-detail-tabs">
        <button class="lead-tab-btn ${this.activeModalTab === 'details' ? 'active' : ''}" data-tab="details">Overview & Notes</button>
        <button class="lead-tab-btn ${this.activeModalTab === 'sequences' ? 'active' : ''}" data-tab="sequences">Generated Sequences</button>
      </div>

      <div id="modal-tab-content">
        ${this.activeModalTab === 'details' ? `
          <div class="form-group">
            <label class="form-label">Recruiter & Target Role</label>
            <p style="color:var(--text-primary); font-weight:600;">${this.escapeHTML(lead.recruiterName)} • ${this.escapeHTML(lead.recruiterRole)}</p>
            <p style="color:var(--accent-cyan); font-size:0.85rem;">Company: ${this.escapeHTML(lead.company)} | Target Role: ${this.escapeHTML(lead.targetRole)}</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">Opportunity Context / Post Snippet</label>
            <p style="font-size:0.85rem; color:var(--text-secondary); background:rgba(0,0,0,0.25); padding:0.6rem; border-radius:var(--radius-sm);">
              ${this.escapeHTML(lead.opportunityContext || 'No additional post snippet provided.')}
            </p>
          </div>

          <div class="form-group">
            <label class="form-label">Outreach Notes & Activity</label>
            <textarea id="modal-lead-notes" class="form-textarea" rows="3">${this.escapeHTML(lead.notes || '')}</textarea>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem;">
            <button id="btn-save-modal-notes" class="btn btn-primary btn-sm">Save Notes</button>
            <button id="btn-open-linkedin-lead" class="btn btn-secondary btn-sm">🔗 Search on LinkedIn</button>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:1.25rem;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                <strong style="font-size:0.85rem; color:var(--accent-cyan);">1. Connection Note (Max 300 Chars)</strong>
                <button class="btn btn-secondary btn-sm btn-modal-copy" data-text="${this.escapeAttr(seq.connectionNote || '')}">📋 Copy</button>
              </div>
              <textarea class="form-textarea" readonly rows="2" style="font-size:0.85rem;">${this.escapeHTML(seq.connectionNote || 'No connection note generated')}</textarea>
            </div>

            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                <strong style="font-size:0.85rem; color:var(--accent-emerald);">2. Follow-Up 1 (Value Drop)</strong>
                <button class="btn btn-secondary btn-sm btn-modal-copy" data-text="${this.escapeAttr(seq.followUp1 || '')}">📋 Copy</button>
              </div>
              <textarea class="form-textarea" readonly rows="4" style="font-size:0.85rem;">${this.escapeHTML(seq.followUp1 || 'No follow up 1 generated')}</textarea>
            </div>

            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                <strong style="font-size:0.85rem; color:var(--accent-amber);">3. Follow-Up 2 (Gentle Nudge)</strong>
                <button class="btn btn-secondary btn-sm btn-modal-copy" data-text="${this.escapeAttr(seq.followUp2 || '')}">📋 Copy</button>
              </div>
              <textarea class="form-textarea" readonly rows="3" style="font-size:0.85rem;">${this.escapeHTML(seq.followUp2 || 'No follow up 2 generated')}</textarea>
            </div>

            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                <strong style="font-size:0.85rem; color:var(--accent-purple);">4. Full InMail / Pitch</strong>
                <button class="btn btn-secondary btn-sm btn-modal-copy" data-text="${this.escapeAttr(seq.inMail || '')}">📋 Copy</button>
              </div>
              <textarea class="form-textarea" readonly rows="5" style="font-size:0.85rem;">${this.escapeHTML(seq.inMail || 'No InMail generated')}</textarea>
            </div>
          </div>
        `}
      </div>
    `;

    // Bind tab clicks inside modal
    modalContent.querySelectorAll('.lead-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeModalTab = btn.dataset.tab;
        this.renderModalContent();
      });
    });

    // Save notes
    const btnSaveNotes = document.getElementById('btn-save-modal-notes');
    if (btnSaveNotes) {
      btnSaveNotes.addEventListener('click', () => {
        const notes = document.getElementById('modal-lead-notes').value;
        this.activeModalLead.notes = notes;
        window.StorageManager.updateLead(this.activeModalLead);
        this.render();
        if (window.KanbanController) window.KanbanController.render();
        window.App.showToast('Notes updated successfully!', 'success');
      });
    }

    // Modal Copy Buttons
    modalContent.querySelectorAll('.btn-modal-copy').forEach(btn => {
      btn.addEventListener('click', async () => {
        const text = btn.dataset.text;
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = '✓ Copied!';
          window.App.showToast('Message copied to clipboard!', 'success');
          setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
        } catch (e) {
          window.App.showToast('Failed to copy', 'warning');
        }
      });
    });

    // Open LinkedIn button in modal
    const btnLinkedIn = document.getElementById('btn-open-linkedin-lead');
    if (btnLinkedIn) {
      btnLinkedIn.addEventListener('click', () => {
        const query = `${lead.recruiterName} ${lead.company} recruiter`;
        window.open(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`, '_blank');
      });
    }
  }

  closeModal() {
    if (this.modal) this.modal.classList.remove('active');
    this.activeModalLead = null;
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  escapeAttr(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}

window.LeadsController = LeadsController;
