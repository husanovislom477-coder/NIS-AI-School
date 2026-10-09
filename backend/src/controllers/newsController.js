const {
  listNews,
  findNewsBySlugOrId,
  createNews: dbCreateNews,
  updateNews: dbUpdateNews,
  deleteNews: dbDeleteNews,
  countNews,
} = require('../services/db');

const formatNews = (n) => {
  if (!n) return null;
  return {
    ...n,
    image: n.coverImage || '',
    summary: n.shortDescription || '',
    shortDescription: n.shortDescription || '',
  };
};

// @desc  Get published news (multilingual)
// @route GET /api/news
// @access Public
const getNews = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const language = req.language || 'en';
    const result = await listNews({
      search,
      language,
      publishedOnly: true,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });

    res.json({
      success: true,
      language,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.data.map(formatNews),
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all news for Admin (multilingual)
// @route GET /api/news/admin/all
// @access Private/Admin
const getAllNewsAdmin = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const language = req.language || 'en';
    const result = await listNews({
      search,
      language,
      publishedOnly: false,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });

    res.json({
      success: true,
      language,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.data.map(formatNews),
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single news by slug or id (multilingual)
// @route GET /api/news/:id
// @access Public
const getNewsItem = async (req, res, next) => {
  try {
    const language = req.language || 'en';
    const item = await findNewsBySlugOrId(req.params.id, language);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Yangilik topilmadi.' });
    }
    res.json({
      success: true,
      language,
      data: formatNews(item),
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Create news with translations
// @route POST /api/news
// @access Private/Admin
const createNews = async (req, res, next) => {
  try {
    const { title, slug, shortDescription, summary, content, author, published } = req.body;

    let coverImage = req.body.coverImage || req.body.image || '';
    if (req.file) {
      coverImage = `/uploads/${req.file.filename}`;
    }

    let translations = req.body.translations;
    if (typeof translations === 'string') {
      try {
        translations = JSON.parse(translations);
      } catch (_) {}
    }

    const created = await dbCreateNews({
      title,
      slug,
      shortDescription: shortDescription || summary || '',
      content: content || '',
      coverImage,
      author: author || 'NIS AI School',
      published: published !== 'false' && published !== false,
      translations,
    });

    res.status(201).json({
      success: true,
      message: 'Yangilik muvaffaqiyatli yaratildi.',
      data: formatNews(created),
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Update news with translations
// @route PUT /api/news/:id
// @access Private/Admin
const updateNews = async (req, res, next) => {
  try {
    const existing = await findNewsBySlugOrId(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Yangilik topilmadi.' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.coverImage = `/uploads/${req.file.filename}`;
    }
    if (updateData.summary && !updateData.shortDescription) {
      updateData.shortDescription = updateData.summary;
    }
    if (updateData.published !== undefined) {
      updateData.published = updateData.published !== 'false' && updateData.published !== false;
    }

    if (typeof updateData.translations === 'string') {
      try {
        updateData.translations = JSON.parse(updateData.translations);
      } catch (_) {}
    }

    const updated = await dbUpdateNews(existing.id, updateData);

    res.json({
      success: true,
      message: 'Yangilik muvaffaqiyatli yangilandi.',
      data: formatNews(updated),
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete news
// @route DELETE /api/news/:id
// @access Private/Admin
const deleteNews = async (req, res, next) => {
  try {
    const existing = await findNewsBySlugOrId(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Yangilik topilmadi.' });
    }

    await dbDeleteNews(existing.id);

    res.json({
      success: true,
      message: 'Yangilik muvaffaqiyatli o‘chirildi.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get news count
// @route GET /api/news/count
// @access Private/Admin
const getNewsCount = async (req, res, next) => {
  try {
    const count = await countNews();
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNews,
  getAllNewsAdmin,
  getNewsItem,
  createNews,
  updateNews,
  deleteNews,
  getNewsCount,
};
