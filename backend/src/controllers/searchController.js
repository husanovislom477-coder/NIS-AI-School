const {
  listBranches,
  listTeachers,
  listResults,
  listProjects,
  listNews,
  listEvents,
} = require('../services/db');

// @desc  Global search across public entities
// @route GET /api/search
// @access Public
const globalSearch = async (req, res, next) => {
  try {
    const { q = '', limit = 10 } = req.query;
    const query = q.trim();
    const language = req.language || 'en';

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        query,
        language,
        total: 0,
        results: {
          branches: [],
          teachers: [],
          students: [],
          projects: [],
          news: [],
          events: [],
        },
      });
    }

    const itemLimit = parseInt(limit, 10) || 10;

    const [branchesRes, teachersRes, studentsRes, projectsRes, newsRes, eventsRes] = await Promise.all([
      listBranches({ search: query, language, limit: itemLimit }),
      listTeachers({ search: query, language, limit: itemLimit }),
      listResults({ search: query, language, limit: itemLimit }),
      listProjects({ search: query, language, limit: itemLimit }),
      listNews({ search: query, language, limit: itemLimit }),
      listEvents({ search: query, limit: itemLimit }),
    ]);

    const branches = branchesRes?.data || [];
    const teachers = teachersRes?.data || [];
    const students = studentsRes?.data || [];
    const projects = projectsRes?.data || [];
    const news = newsRes?.data || [];
    const events = eventsRes?.data || [];

    const total =
      branches.length +
      teachers.length +
      students.length +
      projects.length +
      news.length +
      events.length;

    res.json({
      success: true,
      query,
      language,
      total,
      results: {
        branches,
        teachers,
        students,
        projects,
        news,
        events,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { globalSearch };
