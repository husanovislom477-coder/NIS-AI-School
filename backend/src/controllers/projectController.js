const {
  listProjects,
  findProjectById,
  createProject: dbCreateProject,
  updateProject: dbUpdateProject,
  deleteProject: dbDeleteProject,
  countProjects,
} = require('../services/db');

// @desc  Get all projects / startups (multilingual)
// @route GET /api/projects
// @access Public
const getProjects = async (req, res, next) => {
  try {
    const { search = '', category = '', branchId = '', page = 1, limit = 20 } = req.query;
    const language = req.language || 'en';
    const result = await listProjects({
      search,
      category,
      branchId,
      language,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    res.json({
      success: true,
      language,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single project (multilingual)
// @route GET /api/projects/:id
// @access Public
const getProject = async (req, res, next) => {
  try {
    const language = req.language || 'en';
    const project = await findProjectById(req.params.id, language);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Loyiha topilmadi.' });
    }
    res.json({
      success: true,
      language,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Create project with translations
// @route POST /api/projects
// @access Private/Admin
const createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      studentName,
      studentPhoto,
      projectUrl,
      branchId,
      category,
    } = req.body;

    let projectImage = req.body.projectImage || req.body.image || '';
    if (req.file) {
      projectImage = `/uploads/${req.file.filename}`;
    }

    let translations = req.body.translations;
    if (typeof translations === 'string') {
      try {
        translations = JSON.parse(translations);
      } catch (_) {}
    }

    const created = await dbCreateProject({
      title,
      description,
      studentName: studentName || 'O\'quvchilar jamoasi',
      studentPhoto: studentPhoto || '',
      projectImage,
      projectUrl: projectUrl || '',
      branchId: branchId || null,
      category: category || 'AI & Machine Learning',
      translations,
    });

    res.status(201).json({
      success: true,
      message: 'Loyiha muvaffaqiyatli yaratildi.',
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Update project with translations
// @route PUT /api/projects/:id
// @access Private/Admin
const updateProject = async (req, res, next) => {
  try {
    const existing = await findProjectById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Loyiha topilmadi.' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.projectImage = `/uploads/${req.file.filename}`;
    }

    if (typeof updateData.translations === 'string') {
      try {
        updateData.translations = JSON.parse(updateData.translations);
      } catch (_) {}
    }

    const updated = await dbUpdateProject(req.params.id, updateData);

    res.json({
      success: true,
      message: 'Loyiha muvaffaqiyatli yangilandi.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete project
// @route DELETE /api/projects/:id
// @access Private/Admin
const deleteProject = async (req, res, next) => {
  try {
    const existing = await findProjectById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Loyiha topilmadi.' });
    }

    await dbDeleteProject(req.params.id);

    res.json({
      success: true,
      message: 'Loyiha muvaffaqiyatli o‘chirildi.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get project count
// @route GET /api/projects/count
// @access Private/Admin
const getProjectCount = async (req, res, next) => {
  try {
    const count = await countProjects();
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectCount,
};
