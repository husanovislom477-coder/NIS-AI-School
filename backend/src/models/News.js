const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    titleRu: { type: String, trim: true },
    titleEn: { type: String, trim: true },
    shortDescription: { type: String, trim: true },
    shortDescriptionRu: { type: String, trim: true },
    shortDescriptionEn: { type: String, trim: true },
    content: { type: String },
    contentRu: { type: String },
    contentEn: { type: String },
    coverImage: { type: String, default: '' },
    category: {
      type: String,
      enum: ['general', 'academic', 'olympiad', 'research', 'event', 'achievement', 'announcement'],
      default: 'general',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    authorName: { type: String, default: 'NIS AI School' },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
    tags: [{ type: String }],
    featured: { type: Boolean, default: false },
    slug: { type: String, unique: true, sparse: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Auto-set publishedAt when published
newsSchema.pre('save', function (next) {
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  // Auto-generate slug
  if (this.isModified('title') && !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-') +
      '-' +
      Date.now();
  }
  next();
});

newsSchema.index({ title: 'text', shortDescription: 'text', content: 'text' });
newsSchema.index({ published: 1, publishedAt: -1 });

module.exports = mongoose.model('News', newsSchema);
