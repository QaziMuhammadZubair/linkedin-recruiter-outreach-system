/**
 * LinkedIn Recruiter Outreach System - AI Personalization Engine
 * Supports offline smart heuristic engine + direct Gemini / OpenAI API integration
 * Supports strict 200-character limit (LinkedIn Free Account) and 300-char limit (LinkedIn Premium)
 */

class AIEngine {
  /**
   * Main entry point to generate a 4-step sequence
   */
  static async generateSequence(recruiterData, candidateData, tone = 'value_first', charLimit = 200) {
    const settings = window.StorageManager ? window.StorageManager.getSettings() : {};
    
    // Check if user has configured external API and wants to use it
    if (settings.aiProvider === 'gemini' && settings.geminiApiKey) {
      try {
        return await this.generateWithGemini(recruiterData, candidateData, tone, charLimit, settings.geminiApiKey);
      } catch (err) {
        console.warn('Gemini API call failed, falling back to smart built-in engine:', err);
      }
    } else if (settings.aiProvider === 'openai' && settings.openaiApiKey) {
      try {
        return await this.generateWithOpenAI(recruiterData, candidateData, tone, charLimit, settings.openaiApiKey);
      } catch (err) {
        console.warn('OpenAI API call failed, falling back to smart built-in engine:', err);
      }
    }

    // Default: High-Converting Built-in Heuristic Engine
    return this.generateBuiltIn(recruiterData, candidateData, tone, charLimit);
  }

  /**
   * Smart Built-in Heuristic Generator
   */
  static generateBuiltIn(recruiter, candidate, tone = 'value_first', charLimit = 200) {
    const firstName = recruiter.name ? recruiter.name.split(' ')[0] : 'there';
    const company = recruiter.company || 'your team';
    let role = recruiter.targetRole || 'Senior Full Stack Engineer';
    // Clean role if it doesn't end with "role"
    const roleClean = role.replace(/\s+role$/i, '');
    
    const skills = candidate.coreSkills || ['Angular', 'TypeScript', '.NET', 'C#'];
    const topSkill = skills[0] || 'Angular';
    const secSkill = skills[1] || 'TypeScript';
    const thirdSkill = skills[2] || '.NET';
    const yearsExp = candidate.experienceYears || 4;

    const skillPair1 = `${topSkill}/${secSkill}`;
    const skillPair2 = `${topSkill} & ${thirdSkill}`;

    let rawAch = (candidate.achievements && candidate.achievements[0]) || 'built production-grade full-stack apps';

    let connectionNote = '';
    let followUp1 = '';
    let followUp2 = '';
    let inMail = '';

    // ==========================================
    // STEP 1: CONNECTION NOTE (STRICT LIMIT)
    // ==========================================
    if (charLimit <= 200) {
      // ULTRA-PUNCHY 200-CHAR TEMPLATES FOR FREE LINKEDIN ACCOUNTS
      if (tone === 'value_first') {
        // High-converting template requested by user (175 chars)
        connectionNote = `Hi ${firstName}, saw ${company}'s growth! I'm an ${skillPair1} developer with ${yearsExp} years of experience in ${skillPair2}. I'd love to connect regarding the ${roleClean} role.`;
      } else if (tone === 'metric_driven') {
        connectionNote = `Hi ${firstName}, admire ${company}'s engineering! As an ${skillPair1} dev (${yearsExp} yrs exp, ${skillPair2}), I'd love to connect regarding your ${roleClean} openings.`;
      } else if (tone === 'conversational') {
        connectionNote = `Hi ${firstName}, came across ${company}'s growth in this space! As an ${skillPair1} developer with ${yearsExp} yrs experience, I'd love to connect and follow your team's updates.`;
      } else {
        // Mission & Culture
        connectionNote = `Hi ${firstName}, inspired by ${company}'s engineering craft. As an ${skillPair1} developer (${yearsExp} yrs exp, ${skillPair2}), I'd love to connect regarding ${roleClean} roles.`;
      }
    } else {
      // 300-CHAR TEMPLATES FOR LINKEDIN PREMIUM
      if (tone === 'value_first') {
        connectionNote = `Hi ${firstName}, saw ${company}'s growth! I'm an ${skillPair1} developer with ${yearsExp} years of experience, currently working with ${skillPair2}. As someone who ${rawAch.toLowerCase().slice(0, 60)}, I'd love to connect regarding the ${roleClean} role.`;
      } else if (tone === 'metric_driven') {
        connectionNote = `Hi ${firstName}, admire ${company}'s scale. I'm an ${skillPair1} dev with ${yearsExp} yrs experience in ${skillPair2} (${rawAch.slice(0, 65)}). Would love to connect regarding ${roleClean} opportunities!`;
      } else if (tone === 'conversational') {
        connectionNote = `Hi ${firstName}, came across your profile while exploring ${company}'s work in the space. As an ${skillPair1} developer with ${yearsExp} years of experience, I'd love to connect and follow your team's updates!`;
      } else {
        connectionNote = `Hi ${firstName}, inspired by ${company}'s mission. As an ${skillPair1} developer with ${yearsExp} years of experience in ${skillPair2}, I'd love to connect and keep in touch regarding ${roleClean} roles.`;
      }
    }

    // Strictly enforce charLimit boundary
    connectionNote = this.enforceLimit(connectionNote, charLimit);

    // ==========================================
    // STEP 2: FOLLOW-UP 1 (Value / Portfolio drop)
    // ==========================================
    const topSkillsList = (candidate.coreSkills && candidate.coreSkills.length > 0)
      ? candidate.coreSkills.slice(0, 4).join(', ')
      : 'Angular, TypeScript, JavaScript, and .NET';

    followUp1 = `Hi ${firstName}, thanks for connecting!
I’m a Software Engineer with ${yearsExp} years of experience in ${topSkillsList}. I came across ${company}’s ${roleClean} role and it looks relevant to my background.
Here’s my GitHub: 🔗 ${candidate.portfolioUrl || 'https://github.com/QaziMuhammadZubair'}
Happy to share my CV if you’re currently hiring for the role.`;

    // ==========================================
    // STEP 3: FOLLOW-UP 2 (Gentle Check-in)
    // ==========================================
    followUp2 = `Hi ${firstName}, hope your week is off to a strong start!

Just following up on my previous note regarding the ${roleClean} opening at ${company}. Happy to provide any additional details, code repositories, or work samples that might help your engineering team.

Either way, glad to be in your network!`;

    // ==========================================
    // STEP 4: FULL INMAIL / EMAIL PITCH
    // ==========================================
    inMail = `Subject: Senior Full Stack Engineer Candidate for ${company}

Hi ${firstName},

I'm reaching out because I've been closely following ${company}'s growth and see tremendous synergy with my background as an ${skillPair1} and ${thirdSkill} Full Stack Engineer.

A few key highlights I bring:
• ${yearsExp}+ years of experience building and maintaining production-grade ${topSkill} + ${thirdSkill} full-stack applications
• ${(candidate.achievements && candidate.achievements[1]) || 'Optimized RESTful API architectures and database queries improving response times by 35%'}
• Core Tech: ${(candidate.coreSkills || ['Angular', 'TypeScript', '.NET', 'C#', 'SQL', 'Azure']).join(', ')}

I would welcome a brief conversation to learn more about the team's engineering roadmap and discuss how I could make an immediate contribution to ${company}.

Portfolio: ${candidate.portfolioUrl || 'Available on request'}
LinkedIn: ${candidate.linkedinUrl || 'Available on profile'}

Best regards,
${candidate.name || 'Candidate'}`;

    return {
      connectionNote,
      followUp1,
      followUp2,
      inMail,
      generatedAt: new Date().toISOString(),
      tone,
      charLimit
    };
  }

  /**
   * Helper to ensure connection note never exceeds char limit
   */
  static enforceLimit(text, maxLimit = 200) {
    if (!text || text.length <= maxLimit) return text;
    // Trim gracefully to last full word before maxLimit - 3 and append '...'
    let trimmed = text.slice(0, maxLimit - 3);
    const lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace > maxLimit - 40) {
      trimmed = trimmed.slice(0, lastSpace);
    }
    return trimmed + '...';
  }

  /**
   * Ultra-shorten tool: auto-condenses any user text to fit strict 200 chars
   */
  static autoCondenseTo200(text, firstName = 'there', company = 'your team', role = 'open roles') {
    if (text.length <= 200) return text;

    let condensed = text
      .replace(/I would love to connect/gi, "I'd love to connect")
      .replace(/I would welcome/gi, "I'd welcome")
      .replace(/full-stack application/gi, "full-stack apps")
      .replace(/production-grade/gi, "production")
      .replace(/relevant to your/gi, "for your")
      .replace(/openings/gi, "roles")
      .replace(/opportunities/gi, "roles")
      .replace(/experienced with/gi, "skilled in")
      .replace(/\s+/g, ' ')
      .trim();

    if (condensed.length <= 200) return condensed;

    return this.enforceLimit(condensed, 200);
  }

  /**
   * Optional Gemini API Generator with dynamic charLimit constraint
   */
  static async generateWithGemini(recruiter, candidate, tone, charLimit, apiKey) {
    const prompt = `You are an expert executive tech recruiter and cold outreach specialist.
Generate a high-converting 4-touch LinkedIn outreach sequence for a job seeker reaching out to a recruiter.

CANDIDATE: ${candidate.name} (${candidate.headline}), Skills: ${(candidate.coreSkills || []).join(', ')}, Achievements: ${(candidate.achievements || []).join('; ')}
RECRUITER: ${recruiter.name} (${recruiter.role} at ${recruiter.company}), Target Role: ${recruiter.targetRole}
TONE: ${tone}

CRITICAL RULES:
1. "connectionNote" MUST BE STRICTLY UNDER ${charLimit} CHARACTERS (LinkedIn Free limit is 200 chars).
Example format: "Hi Sarah, saw Stripe's growth! I'm an Angular/TypeScript developer with 4 years of experience in Angular & .NET. I'd love to connect regarding the Senior Full Stack Engineer role."
2. "followUp1" MUST follow format: "Hi Sarah, thanks for connecting!\nI’m a Software Engineer with 4 years of experience in Angular, TypeScript, JavaScript, and .NET. I came across Stripe’s Senior Full Stack Engineer role and it looks relevant to my background.\nHere’s my GitHub: 🔗 https://github.com/QaziMuhammadZubair\nHappy to share my CV if you’re currently hiring for the role."
3. Return valid JSON only with keys: connectionNote, followUp1, followUp2, inMail.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) throw new Error(`Gemini API error ${response.status}`);
    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(text);
    return {
      connectionNote: this.enforceLimit(parsed.connectionNote, charLimit),
      followUp1: parsed.followUp1,
      followUp2: parsed.followUp2,
      inMail: parsed.inMail,
      generatedAt: new Date().toISOString(),
      tone,
      charLimit
    };
  }

  /**
   * Optional OpenAI API Generator with dynamic charLimit constraint
   */
  static async generateWithOpenAI(recruiter, candidate, tone, charLimit, apiKey) {
    const prompt = `Generate a high-converting 4-touch LinkedIn outreach sequence.
Candidate: ${candidate.name} (${candidate.headline}), Skills: ${(candidate.coreSkills || []).join(', ')}, Achievements: ${(candidate.achievements || []).join('; ')}
Recruiter: ${recruiter.name} (${recruiter.role} at ${recruiter.company}), Target Role: ${recruiter.targetRole}
Tone: ${tone}

Rule: "connectionNote" MUST BE STRICTLY UNDER ${charLimit} CHARACTERS (Example: "Hi Sarah, saw Stripe's growth! I'm an Angular/TypeScript developer with 4 years of experience in Angular & .NET. I'd love to connect regarding the Senior Full Stack Engineer role."). "followUp1" MUST include GitHub link: "https://github.com/QaziMuhammadZubair". Return JSON with keys: connectionNote, followUp1, followUp2, inMail.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an outreach copywriter. Output JSON only.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) throw new Error(`OpenAI API error ${response.status}`);
    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return {
      connectionNote: this.enforceLimit(parsed.connectionNote, charLimit),
      followUp1: parsed.followUp1,
      followUp2: parsed.followUp2,
      inMail: parsed.inMail,
      generatedAt: new Date().toISOString(),
      tone,
      charLimit
    };
  }
}

window.AIEngine = AIEngine;
