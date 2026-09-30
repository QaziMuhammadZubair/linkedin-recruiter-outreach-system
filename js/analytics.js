/**
 * LinkedIn Recruiter Outreach System - Analytics & Metrics Controller
 */

class AnalyticsController {
  constructor() {
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const leads = window.StorageManager.getLeads();
    const totalLeads = leads.length;
    
    const sentCount = leads.filter(l => l.stage !== 'discovered').length;
    const connectedCount = leads.filter(l => ['connected', 'followup1', 'followup2', 'interview', 'offer'].includes(l.stage)).length;
    const interviewCount = leads.filter(l => ['interview', 'offer'].includes(l.stage)).length;
    const offerCount = leads.filter(l => l.stage === 'offer').length;

    // Rates
    const connectionRate = sentCount > 0 ? Math.round((connectedCount / sentCount) * 100) : 0;
    const interviewRate = connectedCount > 0 ? Math.round((interviewCount / connectedCount) * 100) : 0;

    // Update DOM Metrics
    this.updateText('stat-total-leads', totalLeads);
    this.updateText('stat-sent-count', sentCount);
    this.updateText('stat-connected-rate', `${connectionRate}%`);
    this.updateText('stat-interview-count', interviewCount);

    // Update Funnel Bars
    this.renderFunnel(totalLeads, sentCount, connectedCount, interviewCount, offerCount);
  }

  renderFunnel(total, sent, connected, interview, offer) {
    const calcPct = (val) => total > 0 ? Math.max(8, Math.round((val / total) * 100)) : 0;

    const stages = [
      { id: 'funnel-discovered', count: total, pct: 100, label: '1. Sourced / Discovered' },
      { id: 'funnel-sent', count: sent, pct: calcPct(sent), label: '2. Connection Requests Sent' },
      { id: 'funnel-connected', count: connected, pct: calcPct(connected), label: '3. Connected & Accepted' },
      { id: 'funnel-interview', count: interview, pct: calcPct(interview), label: '4. Interviews Scheduled' },
      { id: 'funnel-offer', count: offer, pct: calcPct(offer), label: '5. Offers / Final Stages' }
    ];

    stages.forEach(s => {
      const bar = document.getElementById(s.id);
      const countEl = document.getElementById(`${s.id}-count`);
      if (bar) {
        bar.style.width = `${s.pct}%`;
      }
      if (countEl) {
        countEl.textContent = `${s.count} leads (${s.pct}%)`;
      }
    });
  }

  updateText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }
}

window.AnalyticsController = AnalyticsController;
