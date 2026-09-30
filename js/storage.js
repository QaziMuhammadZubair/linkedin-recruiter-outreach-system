/**
 * LinkedIn Recruiter Outreach System - Storage & State Management
 */

const STORAGE_KEYS = {
  LEADS: 'lros_leads_v1',
  SETTINGS: 'lros_settings_v1',
  CANDIDATE: 'lros_candidate_v1',
  ACTIVITY: 'lros_activity_v1'
};

const DEFAULT_CANDIDATE = {
  name: 'Qazi Muhammad Zubair',
  headline: 'Software Engineer | Angular, TypeScript, JavaScript, .NET',
  experienceYears: 4,
  coreSkills: ['Angular', 'TypeScript', 'JavaScript', '.NET', 'C#', 'SQL Server', 'REST APIs'],
  achievements: [
    'Built and maintained production-grade Angular + .NET full-stack applications with high reliability',
    'Optimized RESTful API architectures and database queries improving response times by 35%',
    'Architected scalable component-driven UI systems in Angular and TypeScript'
  ],
  portfolioUrl: 'https://github.com/QaziMuhammadZubair',
  linkedinUrl: 'https://linkedin.com/in/qazimuhammadzubair'
};

const DEFAULT_SETTINGS = {
  defaultTone: 'value_first',
  geminiApiKey: '',
  openaiApiKey: '',
  aiProvider: 'built_in', // 'built_in' | 'gemini' | 'openai'
  theme: 'dark'
};

const SAMPLE_LEADS = [
  {
    id: 'lead_1',
    recruiterName: 'Sarah Jenkins',
    recruiterRole: 'Senior Technical Recruiter',
    company: 'Stripe',
    companyDomain: 'Fintech / Payments Infrastructure',
    targetRole: 'Senior Full Stack Engineer',
    opportunityContext: 'Recently posted on LinkedIn about scaling full-stack engineering teams.',
    priority: 'high',
    stage: 'connected',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    lastUpdated: new Date(Date.now() - 1 * 86400000).toISOString(),
    notes: 'Accepted connection. Follow-up 1 due.',
    sequences: {
      connectionNote: "Hi Sarah, saw Stripe's growth! I'm an Angular/TypeScript developer with 4 years of experience in Angular & .NET. I'd love to connect regarding the Senior Full Stack Engineer role.",
      followUp1: "Hi Sarah, thanks for connecting!\nI’m a Software Engineer with 4 years of experience in Angular, TypeScript, JavaScript, and .NET. I came across Stripe’s Senior Full Stack Engineer role and it looks relevant to my background.\nHere’s my GitHub: 🔗 https://github.com/QaziMuhammadZubair\nHappy to share my CV if you’re currently hiring for the role.",
      followUp2: "Hi Sarah, hope your week is going great! Just following up briefly regarding the Senior Full Stack Engineer opening at Stripe. Happy to share project walk-throughs if helpful!",
      inMail: "Subject: Full Stack Engineer Candidate for Stripe\n\nHi Sarah,\n\nI'm reaching out because I've been closely following Stripe's growth and see strong synergy with my background as an Angular, TypeScript, and .NET Full Stack Engineer.\n\nKey Highlights:\n• 4+ years building production-grade Angular + .NET full-stack applications\n• Optimized RESTful APIs and database queries improving response times by 35%\n• Core Tech: Angular, TypeScript, JavaScript, .NET, C#, SQL Server, REST APIs\n\nI would welcome a brief conversation to discuss how I can contribute to Stripe's engineering team.\n\nBest regards,\nQazi Muhammad Zubair"
    }
  },
  {
    id: 'lead_2',
    recruiterName: 'Marcus Vance',
    recruiterRole: 'Lead Talent Partner',
    company: 'Datadog',
    companyDomain: 'Cloud Monitoring & Observability',
    targetRole: 'Full Stack Engineer',
    opportunityContext: 'Hiring for web telemetry & dashboard platform.',
    priority: 'high',
    stage: 'interview',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    lastUpdated: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: 'Technical screening interview scheduled for Thursday 2 PM EST.',
    sequences: {
      connectionNote: "Hi Marcus, love Datadog's work in observability! I'm an Angular/TypeScript dev (4 yrs exp, Angular & .NET). Would love to connect regarding the Full Stack Engineer role!",
      followUp1: "Hi Marcus, thank you for connecting! Given Datadog's work on real-time dashboards, I thought you might find my high-performance Angular UI architecture projects interesting. Are you speaking with candidates this week?",
      followUp2: "Hi Marcus, checking in on my previous note. Eager to explore how my full-stack background can support Datadog's platform team.",
      inMail: "Subject: Full Stack Engineer Candidate for Datadog\n\nHi Marcus,\n\nI noticed Datadog's expansion in observability platforms. Over 4 years, I have specialized in architecting scalable Angular + .NET web architectures.\n\nLooking forward to speaking about the opening!"
    }
  },
  {
    id: 'lead_3',
    recruiterName: 'Elena Rostova',
    recruiterRole: 'Engineering Talent Acquisition',
    company: 'Vercel',
    companyDomain: 'Frontend Cloud & Developer Experience',
    targetRole: 'Frontend Platform Engineer',
    opportunityContext: 'Actively sourcing TypeScript & web performance specialists.',
    priority: 'medium',
    stage: 'followup1',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Sent connection note on Monday, accepted Tuesday. Sent Follow-up 1 with portfolio.',
    sequences: {
      connectionNote: "Hi Elena, admiring Vercel's innovations! I'm a TypeScript/Angular dev (4 yrs exp, .NET & modern web). I'd love to connect regarding the Frontend Platform Engineer role.",
      followUp1: "Hi Elena, thanks for connecting! I've been following Vercel's latest platform updates. My recent focus is on component optimization and TypeScript developer tooling. Open to a brief chat?",
      followUp2: "Hi Elena, quick follow-up to see if your engineering leads are reviewing profiles for Frontend Platform this sprint.",
      inMail: "Hi Elena,\n\nReaching out regarding Vercel's Frontend Platform openings. With deep experience in TypeScript, Angular, and performant web architecture, I'd love to discuss how I can contribute."
    }
  }
];

class StorageManager {
  static getCandidate() {
    const data = localStorage.getItem(STORAGE_KEYS.CANDIDATE);
    if (!data) {
      this.saveCandidate(DEFAULT_CANDIDATE);
      return DEFAULT_CANDIDATE;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_CANDIDATE;
    }
  }

  static saveCandidate(candidate) {
    localStorage.setItem(STORAGE_KEYS.CANDIDATE, JSON.stringify(candidate));
  }

  static getSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      this.saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  static getLeads() {
    const data = localStorage.getItem(STORAGE_KEYS.LEADS);
    if (!data) {
      this.saveLeads(SAMPLE_LEADS);
      return SAMPLE_LEADS;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return SAMPLE_LEADS;
    }
  }

  static saveLeads(leads) {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  }

  static addLead(lead) {
    const leads = this.getLeads();
    const newLead = {
      id: lead.id || `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      priority: lead.priority || 'medium',
      stage: lead.stage || 'discovered',
      notes: lead.notes || 'Added from Outreach Studio',
      ...lead
    };
    leads.unshift(newLead);
    this.saveLeads(leads);
    this.addActivity(`Added recruiter lead: ${newLead.recruiterName} (${newLead.company})`);
    return newLead;
  }

  static updateLead(updatedLead) {
    const leads = this.getLeads();
    const index = leads.findIndex(l => l.id === updatedLead.id);
    if (index !== -1) {
      leads[index] = {
        ...leads[index],
        ...updatedLead,
        lastUpdated: new Date().toISOString()
      };
      this.saveLeads(leads);
      return leads[index];
    }
    return null;
  }

  static updateLeadStage(leadId, newStage) {
    const leads = this.getLeads();
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      const oldStage = lead.stage;
      lead.stage = newStage;
      lead.lastUpdated = new Date().toISOString();
      this.saveLeads(leads);
      this.addActivity(`Moved ${lead.recruiterName} from [${oldStage}] to [${newStage}]`);
      return lead;
    }
    return null;
  }

  static deleteLead(leadId) {
    let leads = this.getLeads();
    const lead = leads.find(l => l.id === leadId);
    leads = leads.filter(l => l.id !== leadId);
    this.saveLeads(leads);
    if (lead) {
      this.addActivity(`Removed lead: ${lead.recruiterName}`);
    }
  }

  static getActivities() {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    if (!data) return [];
    try { return JSON.parse(data); } catch (e) { return []; }
  }

  static addActivity(text) {
    const activities = this.getActivities();
    activities.unshift({
      id: `act_${Date.now()}`,
      text,
      timestamp: new Date().toISOString()
    });
    if (activities.length > 50) activities.pop();
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activities));
  }

  static resetToSampleData() {
    this.saveCandidate(DEFAULT_CANDIDATE);
    this.saveSettings(DEFAULT_SETTINGS);
    this.saveLeads(SAMPLE_LEADS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY);
    this.addActivity('Loaded fresh Angular & .NET sample dataset');
  }

  static exportLeadsCSV() {
    const leads = this.getLeads();
    const headers = ['Recruiter Name', 'Role', 'Company', 'Domain', 'Target Role', 'Stage', 'Priority', 'Last Updated', 'Notes'];
    const rows = leads.map(l => [
      `"${(l.recruiterName || '').replace(/"/g, '""')}"`,
      `"${(l.recruiterRole || '').replace(/"/g, '""')}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      `"${(l.companyDomain || '').replace(/"/g, '""')}"`,
      `"${(l.targetRole || '').replace(/"/g, '""')}"`,
      `"${(l.stage || '').replace(/"/g, '""')}"`,
      `"${(l.priority || '').replace(/"/g, '""')}"`,
      `"${new Date(l.lastUpdated || l.createdAt).toLocaleDateString()}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `linkedin_outreach_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static exportJSON() {
    const data = {
      candidate: this.getCandidate(),
      settings: this.getSettings(),
      leads: this.getLeads(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `linkedin_outreach_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

window.StorageManager = StorageManager;
