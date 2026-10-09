const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    titleRu: { type: String, trim: true },
    titleEn: { type: String, trim: true },
    category: {
      type: String,
      enum: ['hackathon', 'olympiad', 'seminar', 'conference', 'workshop', 'open-day', 'competition', 'other'],
      default: 'other',
    },
    coverImage: { type: String, default: '' },
    date: { type: Date, required: true },
    endDate: { type: Date },
    time: { type: String, default: '10:00' },
    location: { type: String, trim: true },
    locationDetail: { type: String, trim: true },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    shortDescription: { type: String, trim: true },
    shortDescriptionRu: { type: String, trim: true },
    shortDescriptionEn: { type: String, trim: true },
    content: { type: String },
    contentRu: { type: String },
    contentEn: { type: String },
    registrationLink: { type: String },
    maxParticipants: { type: Number },
    published: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    organizer: { type: String, default: 'NIS AI School' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

eventSchema.virtual('isPast').get(function () {
  return this.date < new Date();
});

eventSchema.index({ title: 'text', location: 'text' });
eventSchema.index({ date: 1, published: 1 });

module.exports = mongoose.model('Event', eventSchema);
