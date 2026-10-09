const {
  listEvents,
  findEventById,
  createEvent: dbCreateEvent,
  updateEvent: dbUpdateEvent,
  deleteEvent: dbDeleteEvent,
  countEvents,
} = require('../services/db');

// @desc  Get all events
// @route GET /api/events
// @access Public
const getEvents = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const result = await listEvents({
      search,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all events for Admin
// @route GET /api/events/admin/all
// @access Private/Admin
const getAllEventsAdmin = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const result = await listEvents({
      search,
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

// @desc  Get single event
// @route GET /api/events/:id
// @access Public
const getEvent = async (req, res, next) => {
  try {
    const item = await findEventById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Tadbir topilmadi.' });
    }
    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Create event
// @route POST /api/events
// @access Private/Admin
const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location, branchId } = req.body;
    let image = req.body.image || '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const created = await dbCreateEvent({
      title,
      description,
      date,
      location,
      image,
      branchId: branchId || null,
    });

    res.status(201).json({
      success: true,
      message: 'Tadbir muvaffaqiyatli yaratildi.',
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Update event
// @route PUT /api/events/:id
// @access Private/Admin
const updateEvent = async (req, res, next) => {
  try {
    const existing = await findEventById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Tadbir topilmadi.' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updated = await dbUpdateEvent(req.params.id, updateData);
    res.json({
      success: true,
      message: 'Tadbir muvaffaqiyatli yangilandi.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete event
// @route DELETE /api/events/:id
// @access Private/Admin
const deleteEvent = async (req, res, next) => {
  try {
    const existing = await findEventById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Tadbir topilmadi.' });
    }

    await dbDeleteEvent(req.params.id);
    res.json({
      success: true,
      message: 'Tadbir muvaffaqiyatli o\'chirildi.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get event count
// @route GET /api/events/count
// @access Private/Admin
const getEventCount = async (req, res, next) => {
  try {
    const count = await countEvents();
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getAllEventsAdmin,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventCount,
};
