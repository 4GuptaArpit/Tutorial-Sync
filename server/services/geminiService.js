const { GoogleGenerativeAI } = require('@google/generative-ai');

// Central AI Service orchestrating Gemini API requests
const geminiService = {
  /**
   * Helper to get configured Gemini model.
   * @param {string} systemInstruction - System prompt configuration
   * @param {boolean} isJson - Should output JSON
   * @returns {any} - Configured model instance
   */
  getModel(systemInstruction = '', isJson = true, apiKeyOverride = null) {
    const apiKey = apiKeyOverride || process.env.GEMINI_TUTORIAL_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured on the server.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const config = {
      model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
      systemInstruction: systemInstruction || undefined
    };

    if (isJson) {
      config.generationConfig = {
        responseMimeType: 'application/json'
      };
    }

    return genAI.getGenerativeModel(config);
  },

  /**
   * Verifies if a given Gemini API key is valid.
   * @param {string} key - API Key to test
   * @returns {Promise<boolean>}
   */
  async validateApiKey(key) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-flash-latest' });
      await model.generateContent('ping');
      return true;
    } catch (error) {
      console.error('Gemini Key validation failed:', error.message);
      return false;
    }
  },

  /**
   * Analyze an outdated tutorial title/stack and generate modern blueprints.
   */
  async analyzeTutorial(title, techStack = []) {
    const systemPrompt = `You are a senior full-stack engineer and educator. Your task is to analyze a programming tutorial topic and write an updated migration blueprint.
You MUST output a strict JSON object matching this schema:
{
  "overview": {
    "originalStack": [{"name": "package-name", "version": "v1.x", "status": "deprecated", "migrationDifficulty": "easy|medium|hard"}],
    "currentStack": [{"name": "package-name", "version": "v2.x", "docUrl": "https://..."}],
    "recommendations": [{"instead": "what was used before", "use": "what to use now", "reason": "why this is better"}]
  },
  "diffs": [
    {"fileName": "fileConfig.js", "oldCode": "old syntax code string", "newCode": "new syntax code string", "explanation": "explanation of code shift"}
  ],
  "steps": [
    {"order": 1, "title": "step name", "description": "what to do in this step", "commands": ["npm install ..."], "codeBlocks": [{"fileName": "App.js", "code": "code sample", "language": "javascript"}], "docLinks": [{"title": "docs title", "url": "https://..."}]}
  ],
  "resources": [
    {"title": "doc title", "url": "https://...", "type": "documentation"}
  ]
}

RELEVANCE & GUARDRAIL:
If the video title or topic is completely UNRELATED to software development, programming, computer science, DevOps, databases, IT, or developer tools (e.g., cooking recipes, music videos, sports, or random non-tech text):
- Set "overview.originalStack": [{"name": "Non-Technical Content Detected", "version": "N/A", "status": "deprecated", "migrationDifficulty": "easy"}]
- Set "overview.currentStack": [{"name": "Software Engineering & Tech Focus", "version": "Required", "docUrl": "https://developer.mozilla.org"}]
- Set "overview.recommendations": [{"instead": "Non-technical topic/video", "use": "Software Development Tutorials or Tech Tools", "reason": "TutorialSync is built specifically to analyze software engineering tutorials, APIs, coding frameworks, and developer tools."}]
- Set "diffs": [{"fileName": "Notice.md", "oldCode": "// Non-technical topic or video URL provided", "newCode": "// Please enter a programming tutorial or tech stack topic", "explanation": "TutorialSync specializes in modernizing developer tutorials and technology guides."}]
- Set "steps": [{"order": 1, "title": "Try Searching for a Tech Framework or Coding Tutorial", "description": "Enter a developer topic (e.g. 'React 19', 'Next.js App Router', 'Docker Setup') or paste a YouTube coding tutorial link.", "commands": [], "codeBlocks": [], "docLinks": []}]

Ensure all code blocks are practical and syntactically correct. All string values MUST be valid JSON string literals with properly escaped control characters and quotes.`;

    const userPrompt = `Analyze this tutorial topic: "${title}". Detected tech keywords: [${techStack.join(', ')}]. Identify what dependencies/APIs are deprecated today and generate a modernized comparison, split-code diff, and step-by-step setup guides.`;

    try {
      const tutorialApiKey = process.env.GEMINI_TUTORIAL_API_KEY || process.env.GEMINI_API_KEY;
      const model = this.getModel(systemPrompt, true, tutorialApiKey);
      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const parsed = safeJsonParse(response.text());
      return normalizeAnalysisResult(parsed);
    } catch (error) {
      console.error('Error in geminiService.analyzeTutorial:', error);
      if (error.message && (error.message.includes('429') || error.message.includes('Quota exceeded') || error.message.includes('Too Many Requests'))) {
        throw new Error('Gemini API Rate Limit Reached (Free Tier request quota reached). Please wait 30 seconds and click "Try Again".');
      }
      throw new Error(`AI Analysis failed: ${error.message}`);
    }
  },

  /**
   * Generate an in-depth developer guide for a topic (e.g., Google Antigravity 2.0).
   */
  async generateTechGuide(topic) {
    const systemPrompt = `You are an expert developer relations engineer. Your task is to generate a comprehensive, highly clear documentation guide for the requested framework, SDK, or developer tool.
You MUST output a strict JSON object matching this schema:
{
  "overview": {
    "originalStack": [{"name": "package-or-feature", "version": "legacy/v1", "status": "deprecated", "migrationDifficulty": "medium"}],
    "currentStack": [{"name": "tool-or-sdk", "version": "latest", "docUrl": "https://..."}],
    "recommendations": [{"instead": "incorrect usage/older alternative", "use": "modern recommended pattern", "reason": "benefits of this model/setup"}]
  },
  "diffs": [
    {"fileName": "setup.js", "oldCode": "// old/incorrect setup", "newCode": "// modern best practice setup", "explanation": "explanation of configuration"}
  ],
  "steps": [
    {"order": 1, "title": "Configure Workspace", "description": "instructions for the step", "commands": ["npm i sdk-name"], "codeBlocks": [{"fileName": "main.js", "code": "code block here", "language": "javascript"}], "docLinks": [{"title": "Official Setup", "url": "https://..."}]}
  ],
  "resources": [
    {"title": "Documentation", "url": "https://...", "type": "documentation"}
  ]
}

RELEVANCE & GUARDRAIL:
If the requested topic is completely UNRELATED to software development, programming, computer science, DevOps, databases, IT, or developer tools (e.g., cooking recipes, music videos, sports, or random non-tech text):
- Set "overview.originalStack": [{"name": "Non-Technical Topic Detected", "version": "N/A", "status": "deprecated", "migrationDifficulty": "easy"}]
- Set "overview.currentStack": [{"name": "Software Engineering & Tech Focus", "version": "Required", "docUrl": "https://developer.mozilla.org"}]
- Set "overview.recommendations": [{"instead": "Non-technical topic", "use": "Software Development Topics or Frameworks", "reason": "TutorialSync is built specifically to analyze software engineering tutorials, APIs, coding frameworks, and developer tools."}]
- Set "diffs": [{"fileName": "Notice.md", "oldCode": "// Non-technical topic provided", "newCode": "// Please enter a programming framework or developer topic", "explanation": "TutorialSync specializes in modernizing developer tutorials and technology guides."}]
- Set "steps": [{"order": 1, "title": "Try Searching for a Developer Tool or Framework", "description": "Enter a tech topic (e.g. 'React 19', 'Next.js 15', 'Docker Compose', 'Google Antigravity 2.0') or paste a YouTube coding tutorial link.", "commands": [], "codeBlocks": [], "docLinks": []}]

Focus on giving clear guidance on which model to choose, how to use it effectively, how to implement skills/capabilities, and common pitfalls. All string values MUST be valid JSON string literals with properly escaped control characters and quotes.`;

    const userPrompt = `Generate a complete modern developer guide for "${topic}". Include installation commands, setup diffs, and step-by-step instructions.`;

    try {
      const tutorialApiKey = process.env.GEMINI_TUTORIAL_API_KEY || process.env.GEMINI_API_KEY;
      const model = this.getModel(systemPrompt, true, tutorialApiKey);
      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const parsed = safeJsonParse(response.text());
      return normalizeAnalysisResult(parsed);
    } catch (error) {
      console.error('Error in geminiService.generateTechGuide:', error);
      if (error.message && (error.message.includes('429') || error.message.includes('Quota exceeded') || error.message.includes('Too Many Requests'))) {
        throw new Error('Gemini API Rate Limit Reached (Free Tier request quota reached). Please wait 30 seconds and click "Try Again".');
      }
      throw new Error(`AI Guide Generation failed: ${error.message}`);
    }
  },

  /**
   * Emulate a senior developer mentor guiding the user through a project.
   */
  async chatWithMentor(projectContext, chatHistory = [], userMessage) {
    const systemPrompt = `You are an expert full-stack engineer acting as a supportive, patient coding mentor/tutor.
You are guiding the user through a project:
Project Title: "${projectContext.title}"
Project Type: "${projectContext.type}"

Context of the tutorial codebase (Overview & Steps):
${JSON.stringify(projectContext.overview)}
Steps:
${JSON.stringify(projectContext.steps.map(s => ({ order: s.order, title: s.title, description: s.description })))}

CRITICAL RULES:
1. Keep the user focused on the tutorial roadmap.
2. If the user asks a question that drifts into unrelated topics, or is proposing an outdated/incorrect architecture, gently correct them and direct them back to the steps.
3. If they paste a code snippet, review it for errors and provide refactored code matching the current stack.
4. If they paste a terminal error, identify what it means (e.g. missing import, wrong package version) and explain how to fix it.
5. Speak in an encouraging, mentoring tone. Be clear and concise. Do NOT give long philosophical answers; focus on practical fixes.
6. If the user asks a completely non-technical question (e.g. recipes, movies, casual chat), politely remind them: "I am your AI Coding Mentor for TutorialSync! Let's stay focused on your software implementation and technical roadmap."`;

    const history = [];
    let expectedRole = 'user';

    for (const msg of chatHistory) {
      if (!msg.content || msg.content.includes('I am currently receiving high demand')) continue;

      const role = msg.role === 'assistant' ? 'model' : 'user';
      if (role === expectedRole) {
        history.push({
          role,
          parts: [{ text: msg.content }]
        });
        expectedRole = role === 'user' ? 'model' : 'user';
      }
    }

    if (history.length > 0 && history[history.length - 1].role === 'user') {
      history.pop();
    }

    try {
      const chatApiKey = process.env.GEMINI_CHAT_API_KEY || process.env.GEMINI_API_KEY;
      const model = this.getModel(systemPrompt, false, chatApiKey);
      const chat = model.startChat({ history });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error in geminiService.chatWithMentor:', error.message);
      if (error.message && (error.message.includes('429') || error.message.includes('Quota exceeded'))) {
        return "I am currently receiving high demand and hit a brief API rate limit. Please wait 5 seconds and send your question again!";
      }
      throw new Error(`AI Chat error: ${error.message}`);
    }
  }
};

/**
 * Safely parses JSON responses from Gemini, stripping markdown fences
 * and sanitizing unescaped control characters (newlines, tabs, etc.) inside strings.
 */
function safeJsonParse(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty or invalid response received from AI model.');
  }

  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('Standard JSON.parse failed, repairing control characters in response...', err.message);
  }

  try {
    let inString = false;
    let isEscaped = false;
    let repaired = '';

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      const code = char.charCodeAt(0);

      if (char === '"' && !isEscaped) {
        inString = !inString;
        repaired += char;
      } else if (inString) {
        if (char === '\n') {
          repaired += '\\n';
        } else if (char === '\r') {
          repaired += '\\r';
        } else if (char === '\t') {
          repaired += '\\t';
        } else if (code < 32) {
          repaired += '\\u' + code.toString(16).padStart(4, '0');
        } else {
          repaired += char;
        }
      } else {
        repaired += char;
      }

      if (char === '\\' && !isEscaped) {
        isEscaped = true;
      } else {
        isEscaped = false;
      }
    }

    return JSON.parse(repaired);
  } catch (repairErr) {
    console.error('Repaired JSON parse failed:', repairErr.message);
    throw new Error(`AI JSON response parse failed: ${repairErr.message}`);
  }
}

/**
 * Normalizes raw Gemini JSON outputs to guarantee valid schema structures for Mongoose models.
 */
function normalizeAnalysisResult(raw) {
  if (!raw || typeof raw !== 'object') {
    raw = {};
  }

  const overview = raw.overview || {};
  
  let originalStack = [];
  if (Array.isArray(overview.originalStack)) {
    originalStack = overview.originalStack.map(item => {
      if (typeof item === 'string') {
        return {
          name: item,
          version: 'legacy',
          status: 'deprecated',
          migrationDifficulty: 'medium'
        };
      }
      if (item && typeof item === 'object') {
        const validStatuses = ['deprecated', 'updated', 'current'];
        const validDiffs = ['easy', 'medium', 'hard'];
        return {
          name: String(item.name || item.title || 'Outdated Dependency'),
          version: String(item.version || 'v1.x'),
          status: validStatuses.includes(item.status) ? item.status : 'deprecated',
          migrationDifficulty: validDiffs.includes(item.migrationDifficulty) ? item.migrationDifficulty : 'medium'
        };
      }
      return null;
    }).filter(Boolean);
  }

  let currentStack = [];
  if (Array.isArray(overview.currentStack)) {
    currentStack = overview.currentStack.map(item => {
      if (typeof item === 'string') {
        return {
          name: item,
          version: 'latest',
          docUrl: ''
        };
      }
      if (item && typeof item === 'object') {
        return {
          name: String(item.name || item.title || 'Modern Dependency'),
          version: String(item.version || 'latest'),
          docUrl: String(item.docUrl || item.url || '')
        };
      }
      return null;
    }).filter(Boolean);
  }

  let recommendations = [];
  if (Array.isArray(overview.recommendations)) {
    recommendations = overview.recommendations.map(item => {
      if (typeof item === 'string') {
        return {
          instead: 'Legacy Pattern',
          use: item,
          reason: 'Modern best practice recommendation'
        };
      }
      if (item && typeof item === 'object') {
        return {
          instead: String(item.instead || 'Outdated Pattern'),
          use: String(item.use || 'Modern Pattern'),
          reason: String(item.reason || 'Improved efficiency and performance')
        };
      }
      return null;
    }).filter(Boolean);
  }

  let diffs = [];
  if (Array.isArray(raw.diffs)) {
    diffs = raw.diffs.map(item => {
      if (item && typeof item === 'object') {
        return {
          fileName: String(item.fileName || 'config.js'),
          oldCode: String(item.oldCode || '// Old implementation'),
          newCode: String(item.newCode || '// Modern implementation'),
          explanation: String(item.explanation || 'Updated to modern syntax')
        };
      }
      return null;
    }).filter(Boolean);
  }

  let steps = [];
  if (Array.isArray(raw.steps)) {
    steps = raw.steps.map((item, idx) => {
      if (item && typeof item === 'object') {
        const commands = Array.isArray(item.commands)
          ? item.commands.map(c => String(c))
          : typeof item.commands === 'string' ? [item.commands] : [];

        const codeBlocks = Array.isArray(item.codeBlocks)
          ? item.codeBlocks.map(cb => ({
              fileName: String(cb.fileName || 'index.js'),
              code: String(cb.code || ''),
              language: String(cb.language || 'javascript')
            }))
          : [];

        const docLinks = Array.isArray(item.docLinks)
          ? item.docLinks.map(dl => ({
              title: String(dl.title || 'Documentation'),
              url: String(dl.url || 'https://docs.example.com')
            }))
          : [];

        return {
          order: typeof item.order === 'number' ? item.order : idx + 1,
          title: String(item.title || `Step ${idx + 1}`),
          description: String(item.description || 'Follow instructions'),
          commands,
          codeBlocks,
          docLinks,
          completed: false
        };
      }
      return null;
    }).filter(Boolean);
  }

  let resources = [];
  if (Array.isArray(raw.resources)) {
    const validResourceTypes = ['documentation', 'github', 'article', 'video'];
    resources = raw.resources.map(item => {
      if (typeof item === 'string') {
        return {
          title: item,
          url: 'https://docs.example.com',
          type: 'documentation'
        };
      }
      if (item && typeof item === 'object') {
        return {
          title: String(item.title || 'Resource Link'),
          url: String(item.url || 'https://docs.example.com'),
          type: validResourceTypes.includes(item.type) ? item.type : 'documentation'
        };
      }
      return null;
    }).filter(Boolean);
  }

  return {
    overview: {
      originalStack,
      currentStack,
      recommendations
    },
    diffs,
    steps,
    resources
  };
}

module.exports = geminiService;
