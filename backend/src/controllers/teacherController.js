const {
  listTeachers,
  findTeacherById,
  createTeacher: dbCreateTeacher,
  updateTeacher: dbUpdateTeacher,
  deleteTeacher: dbDeleteTeacher,
  countTeachers,
} = require('../services/db');

// @desc  Get all teachers (multilingual)
// @route GET /api/teachers
// @access Public
const getTeachers = async (req, res, next) => {
  try {
    const { search = '', branchId = '', page = 1, limit = 12 } = req.query;
    const language = req.language || 'en';
    const result = await listTeachers({
      search,
      branchId,
      language,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 12,
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

// @desc  Get single teacher (multilingual)
// @route GET /api/teachers/:id
// @access Public
const getTeacher = async (req, res, next) => {
  try {
    const language = req.language || 'en';
    const teacher = await findTeacherById(req.params.id, language);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'O\'qituvchi topilmadi.' });
    }
    const achievementsArr = Array.isArray(teacher.achievements)
      ? teacher.achievements
      : teacher.achievements
      ? [teacher.achievements]
      : [];

    const certificatesArr = Array.isArray(teacher.certificates)
      ? teacher.certificates
      : teacher.certificates
      ? [teacher.certificates]
      : [];

    res.json({
      success: true,
      language,
      data: {
        ...teacher,
        biography: teacher.bio || teacher.biography,
        fullName: `${teacher.firstName} ${teacher.lastName}`.trim(),
        achievements: achievementsArr,
        certificates: certificatesArr,
        education: teacher.degree || teacher.education || 'Oliy',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Create teacher with translations
// @route POST /api/teachers
// @access Private/Admin
const createTeacher = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      middleName,
      bio,
      subject,
      university,
      degree,
      IELTSScore,
      SATScore,
      HSKScore,
      certificates,
      achievements,
      branchId,
    } = req.body;

    let photo = req.body.photo || '';
    if (req.file) {
      photo = `/uploads/${req.file.filename}`;
    }

    let translations = req.body.translations;
    if (typeof translations === 'string') {
      try {
        translations = JSON.parse(translations);
      } catch (_) {}
    }

    const teacher = await dbCreateTeacher({
      firstName,
      lastName,
      middleName,
      photo,
      bio,
      subject: subject || 'Computer Science / AI',
      university: university || '',
      degree: degree || '',
      IELTSScore: IELTSScore || '',
      SATScore: SATScore || '',
      HSKScore: HSKScore || '',
      certificates: Array.isArray(certificates) ? certificates.join(', ') : certificates || '',
      achievements: Array.isArray(achievements) ? achievements.join(', ') : achievements || '',
      branchId: branchId || null,
      translations,
    });

    res.status(201).json({
      success: true,
      message: 'O‘qituvchi muvaffaqiyatli yaratildi.',
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Update teacher with translations
// @route PUT /api/teachers/:id
// @access Private/Admin
const updateTeacher = async (req, res, next) => {
  try {
    const existing = await findTeacherById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'O\'qituvchi topilmadi.' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    if (Array.isArray(updateData.certificates)) {
      updateData.certificates = updateData.certificates.join(', ');
    }
    if (Array.isArray(updateData.achievements)) {
      updateData.achievements = updateData.achievements.join(', ');
    }

    if (typeof updateData.translations === 'string') {
      try {
        updateData.translations = JSON.parse(updateData.translations);
      } catch (_) {}
    }

    const updated = await dbUpdateTeacher(req.params.id, updateData);

    res.json({
      success: true,
      message: 'O‘qituvchi ma‘lumotlari muvaffaqiyatli yangilandi.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete teacher
// @route DELETE /api/teachers/:id
// @access Private/Admin
const deleteTeacher = async (req, res, next) => {
  try {
    const existing = await findTeacherById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'O\'qituvchi topilmadi.' });
    }

    await dbDeleteTeacher(req.params.id);

    res.json({
      success: true,
      message: 'O‘qituvchi muvaffaqiyatli o‘chirildi.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get teacher count
// @route GET /api/teachers/count
// @access Private/Admin
const getTeacherCount = async (req, res, next) => {
  try {
    const count = await countTeachers();
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherCount,
};
