const ChatHistory = require('../models/ChatHistory');
const Project = require('../models/Project');
const geminiService = require('../services/geminiService');

// Smart contextual mentor response fallback when Gemini API key is missing or rate-limited
const generateMentorFallback = (project, userMessage) => {
  const msg = userMessage.toLowerCase();

  // 1. If user asks about deprecated dependencies or stack
  if (msg.includes('deprecat') || msg.includes('version') || msg.includes('dependency') || msg.includes('dependencies') || msg.includes('outdated')) {
    if (project.overview && project.overview.originalStack && project.overview.originalStack.length > 0) {
      let reply = `Here are the key deprecated dependencies in **${project.title}**:\n\n`;
      project.overview.originalStack.forEach((item, idx) => {
        reply += `${idx + 1}. **\`${item.name}\` (${item.version || 'v1.x'})**\n`;
        reply += `   * Status: **${item.status || 'deprecated'}**\n`;
        reply += `   * Migration Difficulty: **${item.migrationDifficulty || 'medium'}**\n\n`;
      });
      if (project.overview.currentStack && project.overview.currentStack.length > 0) {
        reply += `\n**Modern Upgraded Equivalents:**\n`;
        project.overview.currentStack.forEach(item => {
          reply += `- **\`${item.name}\`** (\`${item.version}\`)\n`;
        });
      }
      return reply;
    }
  }

  // 2. If user asks about recommendations or architecture
  if (msg.includes('recommend') || msg.includes('instead') || msg.includes('architecture') || msg.includes('use') || msg.includes('why')) {
    if (project.overview && project.overview.recommendations && project.overview.recommendations.length > 0) {
      let reply = `Here are the key architectural recommendations for **${project.title}**:\n\n`;
      project.overview.recommendations.forEach((rec, idx) => {
        reply += `${idx + 1}. **Instead of:** \`${rec.instead}\`\n`;
        reply += `   * **Use:** \`${rec.use}\`\n`;
        reply += `   * **Reason:** ${rec.reason}\n\n`;
      });
      return reply;
    }
  }

  // 3. Fallback matching pre-scripted patterns or general guide
  if (project.title.toLowerCase().includes('firebase')) {
    return "In modular Firebase v9+, import statements must reference specific folders rather than loading the entire namespace. For example, use `import { getAuth } from 'firebase/auth';` instead of `import firebase from 'firebase/app';`.";
  }

  if (project.title.toLowerCase().includes('router')) {
    return "In React Router v6, `<Switch>` was replaced by `<Routes>`. All `<Route>` components must be children of `<Routes>`, and use `element={<Component />}` syntax.";
  }

  return `Hello! As your AI Mentor for **${project.title}**, I'm here to guide you through modernizing this stack. You can ask about deprecated dependencies, code diffs, or step-by-step setup instructions. What specific part are you working on right now?`;
};

const getChatHistory = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Verify project exists and belongs to user
    const project = await Project.findOne({ _id: projectId, user: req.user.id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    let chat = await ChatHistory.findOne({ project: projectId, user: req.user.id });
    
    // Create new chat log document if not exists
    if (!chat) {
      chat = new ChatHistory({
        user: req.user.id,
        project: projectId,
        messages: []
      });
      await chat.save();
    }

    res.status(200).json({ messages: chat.messages });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;

    const project = await Project.findOne({ _id: projectId, user: req.user.id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    let chat = await ChatHistory.findOne({ project: projectId, user: req.user.id });
    if (!chat) {
      chat = new ChatHistory({
        user: req.user.id,
        project: projectId,
        messages: []
      });
    }

    // Push user message
    const hasCode = content.includes('```');
    chat.messages.push({
      role: 'user',
      content,
      hasCode,
      timestamp: new Date()
    });

    await chat.save();

    let reply = '';
    const apiKeyConfigured = !!(process.env.GEMINI_CHAT_API_KEY || process.env.GEMINI_API_KEY);

    if (apiKeyConfigured) {
      try {
        // Build context for Gemini
        const projectContext = {
          title: project.title,
          type: project.type,
          overview: project.overview,
          steps: project.steps
        };

        reply = await geminiService.chatWithMentor(projectContext, chat.messages, content);
      } catch (aiErr) {
        console.error('Gemini chat service failed, activating smart mentor fallback:', aiErr.message);
        reply = generateMentorFallback(project, content);
      }
    } else {
      reply = generateMentorFallback(project, content);
    }

    // Push AI reply
    chat.messages.push({
      role: 'assistant',
      content: reply,
      hasCode: reply.includes('```'),
      timestamp: new Date()
    });

    await chat.save();

    res.status(200).json({
      message: 'Message processed',
      reply: chat.messages[chat.messages.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

const clearChatHistory = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const chat = await ChatHistory.findOne({ project: projectId, user: req.user.id });
    
    if (chat) {
      chat.messages = [];
      await chat.save();
    }

    res.status(200).json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChatHistory,
  sendMessage,
  clearChatHistory
};
