const {
  listResults,
  findResultById,
  createResult: dbCreateResult,
  updateResult: dbUpdateResult,
  deleteResult: dbDeleteResult,
  countResults,
} = require('../services/db');

const formatStudent = (r) => {
  if (!r) return null;
  const parts = (r.studentName || '').split(' ');
  return {
    ...r,
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
    photo: r.studentPhoto || '',
    studentPhoto: r.studentPhoto || '',
    results: [
      {
        type: r.examType || 'IELTS',
        score: r.score || '',
        year: r.year || 2026,
      },
    ],
  };
};

// @desc  Get all students / results (multilingual)
// @route GET /api/students & GET /api/results
// @access Public
const getStudents = async (req, res, next) => {
  try {
    const { search = '', branchId = '', examType = '', page = 1, limit = 12 } = req.query;
    const language = req.language || 'en';
    const result = await listResults({
      search,
      branchId,
      examType,
      language,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 12,
    });

    res.json({
      success: true,
      language,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.data.map(formatStudent),
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single student / result (multilingual)
// @route GET /api/students/:id & GET /api/results/:id
// @access Public
const getStudent = async (req, res, next) => {
  try {
    const language = req.language || 'en';
    const item = await findResultById(req.params.id, language);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Natija topilmadi.' });
    }
    res.json({
      success: true,
      language,
      data: formatStudent(item),
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Create student result with translations
// @route POST /api/students & POST /api/results
// @access Private/Admin
const createStudent = async (req, res, next) => {
  try {
    const {
      studentName,
      firstName,
      lastName,
      examType,
      score,
      branchId,
      year,
      description,
    } = req.body;

    let fullName = studentName;
    if (!fullName && (firstName || lastName)) {
      fullName = `${firstName || ''} ${lastName || ''}`.trim();
    }

    let detectedExam = examType || 'IELTS';
    let detectedScore = score;
    if (req.body.results) {
      try {
        const parsed = typeof req.body.results === 'string' ? JSON.parse(req.body.results) : req.body.results;
        if (Array.isArray(parsed) && parsed.length > 0) {
          detectedExam = parsed[0].type || 'IELTS';
          detectedScore = parsed[0].score || score;
        }
      } catch (_) {}
    }

    let studentPhoto = req.body.studentPhoto || req.body.photo || '';
    if (req.file) {
      studentPhoto = `/uploads/${req.file.filename}`;
    }

    let translations = req.body.translations;
    if (typeof translations === 'string') {
      try {
        translations = JSON.parse(translations);
      } catch (_) {}
    }

    const item = await dbCreateResult({
      studentName: fullName || 'Talaba',
      studentPhoto,
      examType: detectedExam,
      score: String(detectedScore || ''),
      branchId: branchId || null,
      year: year ? parseInt(year) : 2026,
      description: description || '',
      translations,
    });

    res.status(201).json({
      success: true,
      message: 'O‘quvchi natijasi muvaffaqiyatli yaratildi.',
      data: formatStudent(item),
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Update student result with translations
// @route PUT /api/students/:id & PUT /api/results/:id
// @access Private/Admin
const updateStudent = async (req, res, next) => {
  try {
    const existing = await findResultById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Natija topilmadi.' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.studentPhoto = `/uploads/${req.file.filename}`;
    }
    if (updateData.firstName || updateData.lastName) {
      updateData.studentName = `${updateData.firstName || ''} ${updateData.lastName || ''}`.trim();
    }
    if (updateData.year) updateData.year = parseInt(updateData.year);

    if (typeof updateData.translations === 'string') {
      try {
        updateData.translations = JSON.parse(updateData.translations);
      } catch (_) {}
    }

    const updated = await dbUpdateResult(req.params.id, updateData);

    res.json({
      success: true,
      message: 'O‘quvchi natijasi muvaffaqiyatli yangilandi.',
      data: formatStudent(updated),
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete student result
// @route DELETE /api/students/:id & DELETE /api/results/:id
// @access Private/Admin
const deleteStudent = async (req, res, next) => {
  try {
    const existing = await findResultById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Natija topilmadi.' });
    }

    await dbDeleteResult(req.params.id);

    res.json({
      success: true,
      message: 'O‘quvchi natijasi muvaffaqiyatli o‘chirildi.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get student results count
// @route GET /api/students/count & GET /api/results/count
// @access Private/Admin
const getStudentCount = async (req, res, next) => {
  try {
    const count = await countResults();
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentCount,
};
