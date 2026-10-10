const {
  listResults,
  findResultById,
  createResult: dbCreateResult,
  updateResult: dbUpdateResult,
  deleteResult: dbDeleteResult,
  countResults,
  logActivity,
} = require('../services/db');

const formatStudent = (r) => {
  if (!r) return null;
  const parts = (r.studentName || '').split(' ');
  const achType = r.achievementType || r.examType || 'Academic';
  const scoreVal = r.award || r.score || '';
  return {
    ...r,
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
    photo: r.studentPhoto || '',
    studentPhoto: r.studentPhoto || '',
    examType: achType,
    achievementType: achType,
    score: scoreVal,
    award: scoreVal,
    category: r.category || 'Academic Award',
    title: r.title || r.description || `${achType} — ${scoreVal}`,
    certificatePhoto: r.certificatePhoto || '',
    published: r.published !== false,
    results: [
      {
        type: achType,
        score: scoreVal,
        year: r.year || 2026,
      },
    ],
  };
};

// @desc  Get all students / achievements (multilingual)
// @route GET /api/students & GET /api/results & GET /api/achievements
// @access Public
const getStudents = async (req, res, next) => {
  try {
    const { search = '', branchId = '', examType = '', category = '', published = '', page = 1, limit = 12 } = req.query;
    const language = req.language || 'en';
    const result = await listResults({
      search,
      branchId,
      examType,
      category,
      published,
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

// @desc  Get single student / achievement (multilingual)
// @route GET /api/students/:id & GET /api/results/:id & GET /api/achievements/:id
// @access Public
const getStudent = async (req, res, next) => {
  try {
    const language = req.language || 'en';
    const item = await findResultById(req.params.id, language);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Yutuq topilmadi.' });
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

// @desc  Create student achievement with translations
// @route POST /api/students & POST /api/results & POST /api/achievements
// @access Private/Admin
const createStudent = async (req, res, next) => {
  try {
    const {
      studentName,
      firstName,
      lastName,
      examType,
      achievementType,
      score,
      award,
      category,
      title,
      branchId,
      year,
      description,
      published,
    } = req.body;

    let fullName = studentName;
    if (!fullName && (firstName || lastName)) {
      fullName = `${firstName || ''} ${lastName || ''}`.trim();
    }

    let detectedExam = achievementType || examType || 'IELTS';
    let detectedScore = award || score;
    if (req.body.results) {
      try {
        const parsed = typeof req.body.results === 'string' ? JSON.parse(req.body.results) : req.body.results;
        if (Array.isArray(parsed) && parsed.length > 0) {
          detectedExam = parsed[0].type || detectedExam;
          detectedScore = parsed[0].score || detectedScore;
        }
      } catch (_) {}
    }

    let studentPhoto = req.body.studentPhoto || req.body.photo || '';
    let certificatePhoto = req.body.certificatePhoto || '';

    if (req.files) {
      if (req.files.photo && req.files.photo[0]) {
        studentPhoto = `/uploads/${req.files.photo[0].filename}`;
      }
      if (req.files.certificatePhoto && req.files.certificatePhoto[0]) {
        certificatePhoto = `/uploads/${req.files.certificatePhoto[0].filename}`;
      }
    } else if (req.file) {
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
      certificatePhoto,
      examType: detectedExam,
      achievementType: detectedExam,
      score: String(detectedScore || ''),
      award: String(detectedScore || ''),
      category: category || 'Academic Award',
      title: title || '',
      branchId: branchId || null,
      year: year ? parseInt(year) : 2026,
      description: description || '',
      published: published !== undefined ? (published === true || published === 'true') : true,
      translations,
    });

    await logActivity({
      userId: req.user?.id,
      userName: `${req.user?.firstName || 'Admin'} ${req.user?.lastName || ''}`.trim(),
      action: 'CREATE_ACHIEVEMENT',
      entity: 'Achievement',
      details: `Created achievement: ${fullName} (${detectedExam} - ${detectedScore})`,
    });

    res.status(201).json({
      success: true,
      message: 'Yutuq muvaffaqiyatli saqlandi.',
      data: formatStudent(item),
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Update student achievement with translations
// @route PUT /api/students/:id & PUT /api/results/:id & PUT /api/achievements/:id
// @access Private/Admin
const updateStudent = async (req, res, next) => {
  try {
    const existing = await findResultById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Yutuq topilmadi.' });
    }

    const updateData = { ...req.body };
    if (req.files) {
      if (req.files.photo && req.files.photo[0]) {
        updateData.studentPhoto = `/uploads/${req.files.photo[0].filename}`;
      }
      if (req.files.certificatePhoto && req.files.certificatePhoto[0]) {
        updateData.certificatePhoto = `/uploads/${req.files.certificatePhoto[0].filename}`;
      }
    } else if (req.file) {
      updateData.studentPhoto = `/uploads/${req.file.filename}`;
    }

    if (updateData.firstName || updateData.lastName) {
      updateData.studentName = `${updateData.firstName || ''} ${updateData.lastName || ''}`.trim();
    }
    if (updateData.year) updateData.year = parseInt(updateData.year);
    if (updateData.published !== undefined) {
      updateData.published = updateData.published === true || updateData.published === 'true';
    }

    if (typeof updateData.translations === 'string') {
      try {
        updateData.translations = JSON.parse(updateData.translations);
      } catch (_) {}
    }

    const updated = await dbUpdateResult(req.params.id, updateData);

    await logActivity({
      userId: req.user?.id,
      userName: `${req.user?.firstName || 'Admin'} ${req.user?.lastName || ''}`.trim(),
      action: 'UPDATE_ACHIEVEMENT',
      entity: 'Achievement',
      details: `Updated achievement: ${updated.studentName} (${updated.examType})`,
    });

    res.json({
      success: true,
      message: 'Yutuq muvaffaqiyatli yangilandi.',
      data: formatStudent(updated),
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete student achievement
// @route DELETE /api/students/:id & DELETE /api/results/:id & DELETE /api/achievements/:id
// @access Private/Admin
const deleteStudent = async (req, res, next) => {
  try {
    const existing = await findResultById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Yutuq topilmadi.' });
    }

    await dbDeleteResult(req.params.id);

    await logActivity({
      userId: req.user?.id,
      userName: `${req.user?.firstName || 'Admin'} ${req.user?.lastName || ''}`.trim(),
      action: 'DELETE_ACHIEVEMENT',
      entity: 'Achievement',
      details: `Deleted achievement: ${existing.studentName} (${existing.examType})`,
    });

    res.json({
      success: true,
      message: 'Yutuq muvaffaqiyatli o‘chirildi.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get achievements count
// @route GET /api/students/count & GET /api/results/count & GET /api/achievements/count
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
  // Aliases for Achievements
  getAchievements: getStudents,
  getAchievement: getStudent,
  createAchievement: createStudent,
  updateAchievement: updateStudent,
  deleteAchievement: deleteStudent,
  getAchievementCount: getStudentCount,
};
