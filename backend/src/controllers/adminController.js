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
    ]);

    res.json({
      success: true,
      data: {
        branches,
        teachers,
        students,
        projects,
        news: {
          total: totalNews,
          published: totalNews,
          drafts: 0,
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
        },
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
    res.json({
      success: true,
      message: 'Foydalanuvchi muvaffaqiyatli o\'chirildi.',
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
};
