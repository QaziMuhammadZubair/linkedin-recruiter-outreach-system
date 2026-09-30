/**
 * LinkedIn Recruiter Outreach System - Generator Studio Controller
 * Supports LinkedIn Free (200 Chars) and LinkedIn Premium (300 Chars) Modes
 */

class GeneratorController {
  constructor() {
    this.currentSequence = null;
    this.activeTab = 'connectionNote';
    this.selectedTone = 'value_first';
    this.currentCharLimit = 200; // Default to LinkedIn Free Tier (Strict 200 Chars)
    this.init();
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.loadInitialPresets();
  }

  cacheDOM() {
    this.form = document.getElementById('generator-form');
    this.recruiterNameInput = document.getElementById('recruiter-name');
    this.recruiterRoleInput = document.getElementById('recruiter-role');
    this.companyInput = document.getElementById('recruiter-company');
    this.companyDomainInput = document.getElementById('recruiter-domain');
    this.targetRoleInput = document.getElementById('target-role');
    this.contextInput = document.getElementById('opportunity-context');
    this.priorityInput = document.getElementById('lead-priority');
    this.tierSelect = document.getElementById('account-tier-select');

    this.toneChips = document.querySelectorAll('.tone-chip');
    this.generateBtn = document.getElementById('btn-generate-sequence');
    
    // Output DOM
    this.seqTabs = document.querySelectorAll('.seq-tab-btn');
    this.messageOutput = document.getElementById('sequence-message-output');
    this.charBadge = document.getElementById('char-count-badge');
    this.charFill = document.getElementById('char-bar-fill');
    this.charLimitText = document.getElementById('char-limit-indicator');
    this.outputTimingTag = document.getElementById('output-timing-tag');
    
    this.btnCopy = document.getElementById('btn-copy-message');
    this.btnSavePipeline = document.getElementById('btn-save-to-pipeline');
    this.btnOpenLinkedIn = document.getElementById('btn-open-linkedin');
    this.btnAutoShorten = document.getElementById('btn-auto-shorten');
  }

  bindEvents() {
    // Account Tier Change (Free 200 vs Premium 300)
    if (this.tierSelect) {
      this.tierSelect.addEventListener('change', (e) => {
        this.currentCharLimit = parseInt(e.target.value, 10) || 200;
        this.updateCharacterCount();
        if (this.currentSequence) {
          this.generate();
        }
      });
    }

    // Tone chip selection
    this.toneChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.toneChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selectedTone = chip.dataset.tone;
        if (this.currentSequence) {
          this.generate();
        }
      });
    });

    // Form submit / generate click
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.generate();
      });
    }

    // Sequence tabs
    this.seqTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.seqTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeTab = tab.dataset.step;
        this.renderActiveTabMessage();
      });
    });

    // Message edit -> recalculate character counts live
    if (this.messageOutput) {
      this.messageOutput.addEventListener('input', () => {
        if (this.currentSequence) {
          this.currentSequence[this.activeTab] = this.messageOutput.value;
        }
        this.updateCharacterCount();
      });
    }

    // Auto-Shorten / Fit 200 Chars button
    if (this.btnAutoShorten) {
      this.btnAutoShorten.addEventListener('click', () => this.autoShortenMessage());
    }

    // Copy to clipboard
    if (this.btnCopy) {
      this.btnCopy.addEventListener('click', () => this.copyToClipboard());
    }

    // Save to CRM Pipeline
    if (this.btnSavePipeline) {
      this.btnSavePipeline.addEventListener('click', () => this.saveToPipeline());
    }

    // Open LinkedIn search
    if (this.btnOpenLinkedIn) {
      this.btnOpenLinkedIn.addEventListener('click', () => this.openLinkedIn());
    }

    // Quick Fill Presets
    document.querySelectorAll('.quick-fill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        this.applyPreset(preset);
      });
    });
  }

  applyPreset(presetKey) {
    const presets = {
      stripe: {
        name: 'Sarah Jenkins',
        role: 'Senior Technical Recruiter',
        company: 'Stripe',
        domain: 'Fintech & Infrastructure',
        targetRole: 'Senior Full Stack Engineer',
        context: 'Posted about scaling payment infrastructure and full-stack engineering teams.'
      },
      datadog: {
        name: 'Marcus Vance',
        role: 'Lead Talent Partner - AI',
        company: 'Datadog',
        domain: 'Cloud Observability',
        targetRole: 'AI Systems Engineer',
        context: 'Actively sourcing LLM telemetry and observability platform engineers.'
      },
      vercel: {
        name: 'Elena Rostova',
        role: 'Engineering Talent Acquisition',
        company: 'Vercel',
        domain: 'Developer Experience & Edge',
        targetRole: 'Frontend Platform Engineer',
        context: 'Looking for specialists in Next.js performance and Web Vitals optimization.'
      }
    };

    const data = presets[presetKey];
    if (!data) return;

    this.recruiterNameInput.value = data.name;
    this.recruiterRoleInput.value = data.role;
    this.companyInput.value = data.company;
    this.companyDomainInput.value = data.domain;
    this.targetRoleInput.value = data.targetRole;
    this.contextInput.value = data.context;

    window.App.showToast(`Applied preset for ${data.company}`, 'success');
    this.generate();
  }

  loadInitialPresets() {
    this.applyPreset('stripe');
  }

  async generate() {
    const recruiterData = {
      name: this.recruiterNameInput.value.trim() || 'Recruiter',
      role: this.recruiterRoleInput.value.trim() || 'Technical Recruiter',
      company: this.companyInput.value.trim() || 'Target Company',
      domain: this.companyDomainInput.value.trim() || 'Technology',
      targetRole: this.targetRoleInput.value.trim() || 'Software Engineer',
      context: this.contextInput.value.trim()
    };

    const candidateData = window.StorageManager.getCandidate();

    // Visual loading state
    const outputContainer = document.querySelector('.sequence-output-container');
    if (outputContainer) outputContainer.classList.add('ai-generating');

    try {
      this.currentSequence = await window.AIEngine.generateSequence(
        recruiterData, 
        candidateData, 
        this.selectedTone, 
        this.currentCharLimit
      );
      this.renderActiveTabMessage();
      window.App.showToast(`Sequence generated (strictly under ${this.currentCharLimit} chars)!`, 'success');
    } catch (err) {
      console.error(err);
      this.currentSequence = window.AIEngine.generateBuiltIn(
        recruiterData, 
        candidateData, 
        this.selectedTone, 
        this.currentCharLimit
      );
      this.renderActiveTabMessage();
    } finally {
      if (outputContainer) outputContainer.classList.remove('ai-generating');
    }
  }

  renderActiveTabMessage() {
    if (!this.currentSequence) return;

    const timings = {
      connectionNote: `Touchpoint 1 • Send with Connection Request (Max ${this.currentCharLimit} Chars)`,
      followUp1: 'Touchpoint 2 • Send 2-3 Days After Connection Accepted',
      followUp2: 'Touchpoint 3 • Send 5-7 Days After Follow-Up 1',
      inMail: 'Touchpoint 4 • For Open InMail or Direct Email Pitch'
    };

    if (this.outputTimingTag) {
      this.outputTimingTag.textContent = timings[this.activeTab] || '';
    }

    const text = this.currentSequence[this.activeTab] || '';
    if (this.messageOutput) {
      this.messageOutput.value = text;
    }

    this.updateCharacterCount();
  }

  updateCharacterCount() {
    const text = this.messageOutput ? this.messageOutput.value : '';
    const length = text.length;

    if (this.activeTab === 'connectionNote') {
      const max = this.currentCharLimit;
      const pct = Math.min(100, Math.round((length / max) * 100));
      
      this.charBadge.textContent = `${length} / ${max} chars`;
      this.charFill.style.width = `${pct}%`;

      this.charBadge.classList.remove('safe', 'warning', 'danger');
      if (length <= max - 25) {
        this.charBadge.classList.add('safe');
        this.charFill.style.backgroundColor = 'var(--accent-emerald)';
      } else if (length <= max) {
        this.charBadge.classList.add('warning');
        this.charFill.style.backgroundColor = 'var(--accent-amber)';
      } else {
        this.charBadge.classList.add('danger');
        this.charFill.style.backgroundColor = 'var(--accent-rose)';
      }

      if (this.charLimitText) {
        if (length > max) {
          const over = length - max;
          this.charLimitText.textContent = `⚠️ Over LinkedIn limit by ${over} chars! (${length}/${max}) Click "Auto-Fit" to condense.`;
          this.charLimitText.style.color = 'var(--accent-rose)';
          if (this.btnAutoShorten) this.btnAutoShorten.style.display = 'inline-flex';
        } else {
          this.charLimitText.textContent = `✓ Strict LinkedIn ${max} char limit enforced (${max - length} chars remaining)`;
          this.charLimitText.style.color = 'var(--accent-emerald)';
          if (this.btnAutoShorten) this.btnAutoShorten.style.display = 'none';
        }
      }
    } else {
      // General follow-up character stats
      this.charBadge.textContent = `${length} chars (${text.trim().split(/\s+/).filter(Boolean).length} words)`;
      this.charFill.style.width = '100%';
      this.charFill.style.backgroundColor = 'var(--accent-cyan)';
      this.charBadge.className = 'char-counter-badge safe';
      if (this.charLimitText) {
        this.charLimitText.textContent = 'Ideal length: 75-125 words for maximum mobile response rate.';
        this.charLimitText.style.color = 'var(--text-muted)';
      }
      if (this.btnAutoShorten) this.btnAutoShorten.style.display = 'none';
    }
  }

  autoShortenMessage() {
    const text = this.messageOutput ? this.messageOutput.value : '';
    if (!text) return;

    const condensed = window.AIEngine.autoCondenseTo200(
      text, 
      this.recruiterNameInput.value.trim().split(' ')[0] || 'there',
      this.companyInput.value.trim() || 'your team',
      this.targetRoleInput.value.trim() || 'open roles'
    );

    this.messageOutput.value = condensed;
    if (this.currentSequence) {
      this.currentSequence[this.activeTab] = condensed;
    }
    this.updateCharacterCount();
    window.App.showToast(`Auto-condensed to ${condensed.length} chars (fits ${this.currentCharLimit} limit)!`, 'success');
  }

  async copyToClipboard() {
    const text = this.messageOutput ? this.messageOutput.value : '';
    if (!text) return;

    if (this.activeTab === 'connectionNote' && text.length > this.currentCharLimit) {
      window.App.showToast(`Warning: Note is ${text.length}/${this.currentCharLimit} chars. Auto-fitting first!`, 'warning');
      this.autoShortenMessage();
    }

    const finalText = this.messageOutput.value;

    try {
      await navigator.clipboard.writeText(finalText);
      this.btnCopy.classList.add('copied');
      this.btnCopy.innerHTML = '<span>✓ Copied to Clipboard!</span>';
      window.App.showToast(`Copied! (${finalText.length}/${this.currentCharLimit} chars) Paste directly into LinkedIn.`, 'success');

      setTimeout(() => {
        this.btnCopy.classList.remove('copied');
        this.btnCopy.innerHTML = '<span class="icon">📋</span><span>Copy Message</span>';
      }, 2000);
    } catch (e) {
      this.messageOutput.select();
      document.execCommand('copy');
      window.App.showToast('Copied message to clipboard!', 'success');
    }
  }

  saveToPipeline() {
    const name = this.recruiterNameInput.value.trim();
    const company = this.companyInput.value.trim();
    if (!name || !company) {
      window.App.showToast('Please provide recruiter name and company first', 'warning');
      return;
    }

    const leadData = {
      recruiterName: name,
      recruiterRole: this.recruiterRoleInput.value.trim() || 'Recruiter',
      company: company,
      companyDomain: this.companyDomainInput.value.trim(),
      targetRole: this.targetRoleInput.value.trim() || 'Software Engineer',
      opportunityContext: this.contextInput.value.trim(),
      priority: this.priorityInput ? this.priorityInput.value : 'medium',
      stage: 'discovered',
      notes: `Generated ${this.selectedTone} sequence (${this.currentCharLimit} char limit). Ready to send connection note.`,
      sequences: this.currentSequence || {}
    };

    window.StorageManager.addLead(leadData);
    window.App.showToast(`Saved ${name} (${company}) to Kanban Pipeline!`, 'success');
    
    if (window.KanbanController) window.KanbanController.render();
    if (window.LeadsController) window.LeadsController.render();
    if (window.AnalyticsController) window.AnalyticsController.render();
  }

  openLinkedIn() {
    const name = this.recruiterNameInput.value.trim();
    const company = this.companyInput.value.trim();
    let query = `${name} ${company} recruiter`.trim();
    const url = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  }
}

window.GeneratorController = GeneratorController;
