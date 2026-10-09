const {
  listBranches,
  findBranchById,
  createBranch: dbCreateBranch,
  updateBranch: dbUpdateBranch,
  deleteBranch: dbDeleteBranch,
  countBranches,
  listTeachers,
  listResults,
} = require('../services/db');

// @desc  Get all branches (multilingual)
// @route GET /api/branches
// @access Public
const getBranches = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const language = req.language || 'en';
    const result = await listBranches({
      search,
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

// @desc  Get single branch with related data (multilingual)
// @route GET /api/branches/:id
// @access Public
const getBranch = async (req, res, next) => {
  try {
    const language = req.language || 'en';
    const branch = await findBranchById(req.params.id, language);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Filial topilmadi.' });
    }

    const [teachersResult, resultsResult] = await Promise.all([
      listTeachers({ branchId: branch.id, language, limit: 10 }),
      listResults({ branchId: branch.id, language, limit: 10 }),
    ]);

    res.json({
      success: true,
      language,
      data: {
        branch,
        ...branch,
        coverImage: branch.image || branch.coverImage,
        location: branch.address || branch.location,
        teachers: teachersResult.data,
        students: resultsResult.data,
        results: resultsResult.data,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Create branch with translations
// @route POST /api/branches
// @access Private/Admin
const createBranch = async (req, res, next) => {
  try {
    const { name, description, address, phone, latitude, longitude, video, workingHours } = req.body;

    let imageUrl = req.body.image || '';
    let imagesArr = [];

    if (req.files && req.files.length > 0) {
      imagesArr = req.files.map((f) => `/uploads/${f.filename}`);
      if (!imageUrl) imageUrl = imagesArr[0];
    } else if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      imagesArr = [imageUrl];
    }

    let translations = req.body.translations;
    if (typeof translations === 'string') {
      try {
        translations = JSON.parse(translations);
      } catch (_) {}
    }

    const branch = await dbCreateBranch({
      name,
      description,
      address,
      phone,
      latitude: latitude ? parseFloat(latitude) : 0,
      longitude: longitude ? parseFloat(longitude) : 0,
      image: imageUrl,
      images: JSON.stringify(imagesArr),
      video,
      workingHours,
      translations,
    });

    res.status(201).json({
      success: true,
      message: 'Filial muvaffaqiyatli yaratildi.',
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Update branch with translations
// @route PUT /api/branches/:id
// @access Private/Admin
const updateBranch = async (req, res, next) => {
  try {
    const existing = await findBranchById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Filial topilmadi.' });
    }

    const updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `/uploads/${f.filename}`);
      updateData.images = JSON.stringify(newImages);
      updateData.image = newImages[0];
    } else if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    if (updateData.latitude) updateData.latitude = parseFloat(updateData.latitude);
    if (updateData.longitude) updateData.longitude = parseFloat(updateData.longitude);

    if (typeof updateData.translations === 'string') {
      try {
        updateData.translations = JSON.parse(updateData.translations);
      } catch (_) {}
    }

    const updated = await dbUpdateBranch(req.params.id, updateData);

    res.json({
      success: true,
      message: 'Filial muvaffaqiyatli yangilandi.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete branch
// @route DELETE /api/branches/:id
// @access Private/Admin
const deleteBranch = async (req, res, next) => {
  try {
    const existing = await findBranchById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Filial topilmadi.' });
    }

    await dbDeleteBranch(req.params.id);

    res.json({
      success: true,
      message: 'Filial muvaffaqiyatli o\'chirildi.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get branch count
// @route GET /api/branches/count
// @access Private/Admin
const getBranchCount = async (req, res, next) => {
  try {
    const count = await countBranches();
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchCount,
};
