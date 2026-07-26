const Project = require('../models/Project');
const ChatHistory = require('../models/ChatHistory');
const youtubeService = require('../services/youtubeService');
const geminiService = require('../services/geminiService');
const seedTemplates = require('../data/seedTemplates');

// Helper to look up pre-loaded seed templates by title keywords or url
const findSeedTemplate = (project) => {
  if (project.type === 'tech-guide') {
    const topicLower = (project.title || '').toLowerCase();
    return seedTemplates.find(t => 
      t.type === 'tech-guide' && 
      (t.title.toLowerCase().includes(topicLower) || topicLower.includes('antigravity'))
    );
  }

  // Evolved YouTube match
  const url = project.sourceUrl || '';
  const title = (project.title || '').toLowerCase();
  
  return seedTemplates.find(t => {
    if (t.type !== 'tutorial-refresh') return false;
    
    // Match by YouTube URL ID
    if (url && t.sourceUrl) {
      const id1 = youtubeService.getVideoId(url);
      const id2 = youtubeService.getVideoId(t.sourceUrl);
      if (id1 && id1 === id2) return true;
    }
    
    // Match by keywords in title
    return (
      (title.includes('firebase') && t.title.toLowerCase().includes('firebase')) ||
      (title.includes('router') && t.title.toLowerCase().includes('router'))
    );
  });
};

const getProjects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const total = await Project.countDocuments({ user: req.user.id });
    const projects = await Project.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      projects,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ project });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { type, title, sourceUrl, topic } = req.body;

    let projectTitle = title;
    let computedSourceUrl = sourceUrl;
    let techTags = [];

    // Auto-fetch YouTube details if URL is provided
    if (type === 'tutorial-refresh' && sourceUrl) {
      const meta = await youtubeService.getVideoMetadata(sourceUrl);
      projectTitle = meta.title;
      computedSourceUrl = `https://www.youtube.com/watch?v=${meta.videoId}`;
      techTags = youtubeService.extractTechStack(`${meta.title} ${meta.description || ''}`);
    }

    const project = new Project({
      user: req.user.id,
      type,
      title: projectTitle || topic || 'Untitled Project',
      sourceUrl: computedSourceUrl,
      topic,
      status: 'pending'
    });

    await project.save();

    res.status(201).json({
      message: 'Project workspace created successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

const analyzeProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Return immediately if already completed or analysis is currently in progress
    if (project.status === 'complete') {
      return res.status(200).json({ message: 'Project is already complete', project });
    }

    const apiKeyConfigured = !!(process.env.GEMINI_TUTORIAL_API_KEY || process.env.GEMINI_API_KEY);
    const seed = findSeedTemplate(project);

    // Fallback/Demo Mode triggers if key is missing OR if matching seed is requested
    if (!apiKeyConfigured || (!project.sourceUrl && seed)) {
      if (seed) {
        const updatedProject = await Project.findByIdAndUpdate(
          project._id,
          {
            $set: {
              title: seed.title,
              overview: seed.overview,
              diffs: seed.diffs,
              steps: seed.steps,
              resources: seed.resources,
              status: 'complete',
              errorMessage: undefined
            }
          },
          { new: true }
        );

        return res.status(200).json({
          message: 'Project loaded successfully via pre-loaded template',
          project: updatedProject
        });
      } else if (!apiKeyConfigured) {
        const errMsg = 'Gemini API key is missing. Please configure GEMINI_API_KEY in the server .env configuration to analyze custom topics.';
        const updatedProject = await Project.findByIdAndUpdate(
          project._id,
          { $set: { status: 'error', errorMessage: errMsg } },
          { new: true }
        );
        return res.status(400).json({
          message: errMsg,
          project: updatedProject
        });
      }
    }

    // Set status to analyzing atomically
    await Project.updateOne({ _id: project._id }, { $set: { status: 'analyzing' } });

    // Perform real AI analysis using Gemini Service
    try {
      let analysisResult;
      if (project.type === 'tutorial-refresh') {
        let techStack = [];
        if (project.sourceUrl) {
          const meta = await youtubeService.getVideoMetadata(project.sourceUrl);
          techStack = youtubeService.extractTechStack(meta.title);
        }
        analysisResult = await geminiService.analyzeTutorial(project.title, techStack);
      } else {
        analysisResult = await geminiService.generateTechGuide(project.topic || project.title);
      }

      // Update fields atomically
      const updatedProject = await Project.findByIdAndUpdate(
        project._id,
        {
          $set: {
            overview: analysisResult.overview,
            diffs: analysisResult.diffs,
            steps: analysisResult.steps,
            resources: analysisResult.resources,
            status: 'complete',
            errorMessage: undefined
          }
        },
        { new: true }
      );

      res.status(200).json({
        message: 'AI Analysis completed successfully',
        project: updatedProject
      });
    } catch (aiErr) {
      console.error('AI Service Error:', aiErr);
      const errMsg = aiErr.message || 'Gemini API encountered an error processing this request.';
      const updatedProject = await Project.findByIdAndUpdate(
        project._id,
        { $set: { status: 'error', errorMessage: errMsg } },
        { new: true }
      );

      res.status(500).json({
        message: 'AI Analysis failed',
        error: errMsg,
        project: updatedProject
      });
    }
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { steps } = req.body;
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only update steps completion status
    if (steps && Array.isArray(steps)) {
      steps.forEach(update => {
        const step = project.steps.id(update._id);
        if (step) {
          step.completed = !!update.completed;
        }
      });
    }

    await project.save();
    res.status(200).json({ message: 'Project steps updated', project });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Cascade delete associated chat logs
    await ChatHistory.deleteOne({ project: project._id, user: req.user.id });

    res.status(200).json({ message: 'Project and chat history deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const exportProjectMarkdown = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project || project.status !== 'complete') {
      return res.status(404).json({ message: 'Project not found or analysis is incomplete' });
    }

    // Build markdown string
    let md = `# Modernized Guide: ${project.title}\n\n`;
    if (project.sourceUrl) {
      md += `*Based on YouTube Tutorial: [Link](${project.sourceUrl})*\n\n`;
    }
    
    md += `## 📋 Technology Stack Overview\n\n`;
    md += `### Deprecated Stack / Version Gaps\n`;
    project.overview.originalStack.forEach(dep => {
      md += `- **${dep.name}** (${dep.version}) - Status: \`${dep.status}\`, Upgrade difficulty: \`${dep.migrationDifficulty}\`\n`;
    });
    
    md += `\n### Upgraded Modern Stack\n`;
    project.overview.currentStack.forEach(dep => {
      md += `- **${dep.name}** (${dep.version}) ${dep.docUrl ? ` - [Official Docs](${dep.docUrl})` : ''}\n`;
    });

    md += `\n### Architectural Key Shift Diffs\n`;
    project.overview.recommendations.forEach(rec => {
      md += `* **Instead of**: \`${rec.instead}\`\n  **Use**: \`${rec.use}\`\n  **Reason**: ${rec.reason}\n\n`;
    });

    if (project.diffs && project.diffs.length > 0) {
      md += `\n## 🔄 Side-by-Side Diffs & Migrations\n\n`;
      project.diffs.forEach(diff => {
        md += `### File: \`${diff.fileName}\`\n`;
        md += `**Old Outdated Code:**\n\`\`\`javascript\n${diff.oldCode}\n\`\`\`\n\n`;
        md += `**Modern Upgraded Code:**\n\`\`\`javascript\n${diff.newCode}\n\`\`\`\n\n`;
        md += `**Explanation:** ${diff.explanation}\n\n---\n\n`;
      });
    }

    md += `\n## 🛠️ Step-by-Step Modernization Instructions\n\n`;
    project.steps.forEach(step => {
      md += `### Step ${step.order}: ${step.title} ${step.completed ? '✅' : '⬜'}\n`;
      md += `${step.description}\n\n`;
      if (step.commands && step.commands.length > 0) {
        md += `**Terminal Commands:**\n`;
        step.commands.forEach(cmd => {
          md += `\`\`\`bash\n${cmd}\n\`\`\`\n`;
        });
        md += `\n`;
      }
      if (step.codeBlocks && step.codeBlocks.length > 0) {
        step.codeBlocks.forEach(cb => {
          md += `**File: \`${cb.fileName}\`**\n\`\`\`${cb.language || 'javascript'}\n${cb.code}\n\`\`\`\n\n`;
        });
      }
    });

    md += `\n## 🔗 Useful Documentation Resources\n\n`;
    project.resources.forEach(r => {
      md += `- [${r.title}](${r.url}) - Type: \`${r.type}\`\n`;
    });

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename=tutorialsync-${project._id}.md`);
    return res.status(200).send(md);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  analyzeProject,
  updateProject,
  deleteProject,
  exportProjectMarkdown
};
