const fs = require('fs');
const path = require('path');
const {
  countBranches,
  countTeachers,
  countResults,
  countProjects,
  countNews,
  countEvents,
  countUsers,
  countApplications,
  listUsers,
  updateUser: dbUpdateUser,
  deleteUser: dbDeleteUser,
  findUserById,
  logActivity,
  listActivities,
  getSettings: dbGetSettings,
  updateSettings: dbUpdateSettings,
  listBranches,
  listTeachers,
  listResults,
  listNews,
} = require('../services/db');

// @desc  Get real dashboard stats
// @route GET /api/admin/stats
// @access Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      branches,
      teachers,
      students,
      projects,
      totalNews,
      totalEvents,
      users,
      totalApps,
      newApps,
      reviewingApps,
      acceptedApps,
      rejectedApps,
      branchesRes,
      teachersRes,
      resultsRes,
      newsRes,
    ] = await Promise.all([
      countBranches(),
      countTeachers(),
      countResults(),
      countProjects(),
      countNews(),
      countEvents(),
      countUsers(),
      countApplications(),
      countApplications({ status: 'NEW' }),
      countApplications({ status: 'REVIEWING' }),
      countApplications({ status: 'ACCEPTED' }),
      countApplications({ status: 'REJECTED' }),
      listBranches({ limit: 20 }).catch(() => ({ data: [] })),
      listTeachers({ limit: 100 }).catch(() => ({ data: [] })),
      listResults({ limit: 100 }).catch(() => ({ data: [] })),
      listNews({ limit: 50 }).catch(() => ({ data: [] })),
    ]);

    const allBranches = branchesRes?.data || [];
    const allTeachers = teachersRes?.data || [];
    const allResults = resultsRes?.data || [];
    const allNews = newsRes?.data || [];

    // Compute real branch breakdown from actual database relations
    const branchBreakdown = allBranches.map((b) => {
      const bId = String(b.id || b._id);
      const branchTeachers = allTeachers.filter(
        (t) => String(t.branchId?.id || t.branchId?._id || t.branchId) === bId
      ).length;
      const branchResults = allResults.filter(
        (r) => String(r.branchId?.id || r.branchId?._id || r.branchId) === bId
      ).length;

      return {
        id: b.id,
        name: b.name,
        address: b.address,
        workingHours: b.workingHours,
        teacherCount: branchTeachers,
        achievementCount: branchResults,
      };
    });

    // Compute content awaiting approval / publication
    const draftNewsCount = allNews.filter((n) => n.published === false).length;
    const pendingAchievementsCount = allResults.filter((r) => r.published === false).length;

    // Check missing translations across primary languages (uz, en, ru)
    let missingTranslationsCount = 0;
    const requiredLangs = ['uz', 'en', 'ru'];

    const checkTranslations = (item) => {
      const existingLangs = new Set();
      if (Array.isArray(item.translations)) {
        item.translations.forEach((tr) => {
          const c = (tr.languageCode || tr.lang || '').toLowerCase();
          if (c) existingLangs.add(c);
        });
      }
      return requiredLangs.some((l) => !existingLangs.has(l));
    };

    allBranches.forEach((b) => { if (checkTranslations(b)) missingTranslationsCount++; });
    allTeachers.forEach((t) => { if (checkTranslations(t)) missingTranslationsCount++; });
    allNews.forEach((n) => { if (checkTranslations(n)) missingTranslationsCount++; });

    res.json({
      success: true,
      data: {
        branches,
        teachers,
        students,
        achievements: students,
        projects,
        news: {
          total: totalNews,
          published: totalNews - draftNewsCount,
          drafts: draftNewsCount,
        },
        events: {
          total: totalEvents,
          published: totalEvents,
        },
        users,
        applications: {
          total: totalApps,
          pending: newApps,
          new: newApps,
          reviewing: reviewingApps,
          accepted: acceptedApps,
          rejected: rejectedApps,
        },
        pendingApproval: {
          total: newApps + draftNewsCount + pendingAchievementsCount,
          applications: newApps,
          newsDrafts: draftNewsCount,
          achievementsDrafts: pendingAchievementsCount,
        },
        translationIndicators: {
          itemsNeedingTranslation: missingTranslationsCount,
          requiredLanguages: requiredLangs,
        },
        branchBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all users for Admin
// @route GET /api/admin/users
// @access Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const result = await listUsers({
      search,
      role,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Update user role or active status
// @route PUT /api/admin/users/:id
// @access Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive, firstName, lastName, phone } = req.body;
    const existing = await findUserById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi.' });
    }

    const updateData = {};
    if (role) updateData.role = role.toUpperCase();
    if (isActive !== undefined) updateData.isActive = isActive === true || isActive === 'true';
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;

    const updated = await dbUpdateUser(req.params.id, updateData);

    await logActivity({
      userId: req.user?.id,
      userName: `${req.user?.firstName || 'Admin'} ${req.user?.lastName || ''}`.trim(),
      action: 'UPDATE_USER',
      entity: 'User',
      details: `Updated user: ${existing.email} (Role: ${updateData.role || existing.role}, Active: ${updateData.isActive ?? existing.isActive})`,
    });

    res.json({
      success: true,
      message: 'Foydalanuvchi muvaffaqiyatli yangilandi.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete user
// @route DELETE /api/admin/users/:id
// @access Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id || req.params.id === req.user._id) {
      return res.status(400).json({ success: false, message: 'O\'z hisobingizni o\'chira olmaysiz.' });
    }

    const existing = await findUserById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi.' });
    }

    await dbDeleteUser(req.params.id);

    await logActivity({
      userId: req.user?.id,
      userName: `${req.user?.firstName || 'Admin'} ${req.user?.lastName || ''}`.trim(),
      action: 'DELETE_USER',
      entity: 'User',
      details: `Deleted user: ${existing.email} (${existing.firstName} ${existing.lastName})`,
    });

    res.json({
      success: true,
      message: 'Foydalanuvchi muvaffaqiyatli o\'chirildi.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get activity logs
// @route GET /api/admin/activities
// @access Private/Admin
const getActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, action = '', search = '' } = req.query;
    const result = await listActivities({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 30,
      action,
      search,
    });
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get system settings
// @route GET /api/admin/settings
// @access Private/Admin
const getSettings = async (req, res, next) => {
  try {
    const settings = await dbGetSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Update system settings
// @route PUT /api/admin/settings
// @access Private/Admin
const updateSettings = async (req, res, next) => {
  try {
    const updated = await dbUpdateSettings(req.body);

    await logActivity({
      userId: req.user?.id,
      userName: `${req.user?.firstName || 'Admin'} ${req.user?.lastName || ''}`.trim(),
      action: 'UPDATE_SETTINGS',
      entity: 'Settings',
      details: `Updated school settings & parameters`,
    });

    res.json({
      success: true,
      message: 'Sozlamalar muvaffaqiyatli yangilandi.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get media files from uploads directory
// @route GET /api/admin/media
// @access Private/Admin
const getMedia = async (req, res, next) => {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const files = fs.readdirSync(uploadsDir);
    const mediaList = files
      .filter((file) => !file.startsWith('.'))
      .map((filename) => {
        const filePath = path.join(uploadsDir, filename);
        let stat = { size: 0, mtime: new Date() };
        try {
          stat = fs.statSync(filePath);
        } catch (_) {}

        const ext = path.extname(filename).toLowerCase();
        let type = 'other';
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
          type = 'image';
        } else if (['.mp4', '.webm', '.ogg', '.mov'].includes(ext)) {
          type = 'video';
        } else if (['.pdf', '.doc', '.docx'].includes(ext)) {
          type = 'document';
        }

        return {
          id: filename,
          filename,
          url: `/uploads/${filename}`,
          size: stat.size,
          sizeFormatted: `${(stat.size / 1024).toFixed(1)} KB`,
          type,
          extension: ext,
          createdAt: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      total: mediaList.length,
      data: mediaList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Upload new media file
// @route POST /api/admin/media/upload
// @access Private/Admin
const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Fayl tanlanmadi.' });
    }

    const filename = req.file.filename;
    const url = `/uploads/${filename}`;

    await logActivity({
      userId: req.user?.id,
      userName: `${req.user?.firstName || 'Admin'} ${req.user?.lastName || ''}`.trim(),
      action: 'UPLOAD_MEDIA',
      entity: 'Media',
      details: `Uploaded file: ${filename} (${req.file.size} bytes)`,
    });

    res.status(201).json({
      success: true,
      message: 'Fayl muvaffaqiyatli yuklandi.',
      data: {
        filename,
        url,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete media file
// @route DELETE /api/admin/media/:filename
// @access Private/Admin
const deleteMedia = async (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(process.cwd(), 'uploads', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await logActivity({
      userId: req.user?.id,
      userName: `${req.user?.firstName || 'Admin'} ${req.user?.lastName || ''}`.trim(),
      action: 'DELETE_MEDIA',
      entity: 'Media',
      details: `Deleted file: ${filename}`,
    });

    res.json({
      success: true,
      message: 'Fayl muvaffaqiyatli o‘chirildi.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getActivities,
  getSettings,
  updateSettings,
  getMedia,
  uploadMedia,
  deleteMedia,
};
