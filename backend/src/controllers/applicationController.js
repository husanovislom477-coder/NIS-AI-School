const {
  listApplications,
  findApplicationById,
  createApplication: dbCreateApplication,
  updateApplicationStatus: dbUpdateApplicationStatus,
  deleteApplication: dbDeleteApplication,
  countApplications,
} = require('../services/db');

// @desc  Submit new school application
// @route POST /api/applications
// @access Public / Authenticated
const submitApplication = async (req, res, next) => {
  try {
    const {
      fullName,
      applicantName,
      name,
      email,
      phone,
      branchId,
      campus,
      selectedProgram,
      program,
      direction,
      message,
      motivation,
      notes,
    } = req.body;

    const applicantFullName = fullName || applicantName || name || '';
    const applicantEmail = (email || '').toLowerCase().trim();
    const applicantPhone = phone || '';

    if (!applicantFullName || !applicantEmail || !applicantPhone) {
      return res.status(400).json({
        success: false,
        message: 'To\'liq ism-sharif, email va telefon raqami kiritilishi shart.',
      });
    }

    const prog = selectedProgram || program || direction || 'AI & Data Science';
    const textMessage = message || motivation || notes || '';
    const targetBranch = branchId || campus || null;

    // Duplicate check: check if an application from this email with same program was created recently
    const recent = await listApplications({
      search: applicantEmail,
      limit: 5,
    });
    const duplicate = recent.data.find(
      (a) =>
        (a.email || '').toLowerCase() === applicantEmail &&
        a.selectedProgram === prog &&
        Date.now() - new Date(a.createdAt).getTime() < 5 * 60 * 1000 // 5 minutes
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: 'Siz allaqachon so\'nggi 5 daqiqa ichida ushbu yo\'nalishga ariza yuborgansiz. Iltimos, kuting.',
      });
    }

    const applicationNumber = `#NIS-${Math.floor(100000 + Math.random() * 900000)}`;

    const application = await dbCreateApplication({
      userId: req.user ? req.user.id : null,
      fullName: applicantFullName,
      email: applicantEmail,
      phone: applicantPhone,
      branchId: targetBranch,
      selectedProgram: prog,
      message: textMessage,
      status: 'NEW',
    });

    res.status(201).json({
      success: true,
      message: 'Arizangiz muvaffaqiyatli qabul qilindi! Qabul komissiyasi tez orada siz bilan bog\'lanadi.',
      applicationNumber,
      data: {
        ...application,
        applicationNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get user's own applications
// @route GET /api/applications/my
// @access Private
const getMyApplications = async (req, res, next) => {
  try {
    const result = await listApplications({
      userId: req.user.id,
      limit: 20,
    });
    res.json({
      success: true,
      total: result.total,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single application
// @route GET /api/applications/:id
// @access Private
const getApplicationById = async (req, res, next) => {
  try {
    const application = await findApplicationById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Ariza topilmadi.' });
    }

    // Only owner or admin can view
    const role = (req.user?.role || '').toUpperCase();
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && application.userId !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'Ruxsat berilmagan.' });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all applications for Admin
// @route GET /api/applications/admin/all
// @access Private/Admin
const getAllApplicationsAdmin = async (req, res, next) => {
  try {
    const { search = '', status = '', branchId = '', page = 1, limit = 20 } = req.query;
    const result = await listApplications({
      search,
      status,
      branchId,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });

    res.json({
      success: true,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Update application status
// @route PATCH /api/applications/admin/:id/status
// @access Private/Admin
const updateApplicationStatus = async (req, res, next) => {
  try {
    let { status, internalNotes, note } = req.body;
    if (status) {
      status = (status || '').toUpperCase();
      if (status === 'PENDING') status = 'NEW';
      if (status === 'APPROVED') status = 'ACCEPTED';

      const validStatuses = ['NEW', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'CONTACTED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status NEW, REVIEWING, ACCEPTED yoki REJECTED bo\'lishi shart.',
        });
      }
    }

    const existing = await findApplicationById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Ariza topilmadi.' });
    }

    const adminName = `${req.user?.firstName || 'Admin'} ${req.user?.lastName || ''}`.trim();
    const updated = await dbUpdateApplicationStatus(req.params.id, status || existing.status, {
      internalNotes: internalNotes !== undefined ? internalNotes : note,
      adminName,
      by: adminName,
    });

    res.json({
      success: true,
      message: 'Ariza ma\'lumotlari muvaffaqiyatli yangilandi.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete application
// @route DELETE /api/applications/:id
// @access Private/Admin
const deleteApplication = async (req, res, next) => {
  try {
    const existing = await findApplicationById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Ariza topilmadi.' });
    }

    await dbDeleteApplication(req.params.id);
    res.json({
      success: true,
      message: 'Ariza muvaffaqiyatli o\'chirildi.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitApplication,
  getMyApplications,
  getApplicationById,
  getAllApplicationsAdmin,
  updateApplicationStatus,
  deleteApplication,
};
