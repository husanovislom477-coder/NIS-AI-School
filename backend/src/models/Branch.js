const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameRu: { type: String, trim: true },
    nameEn: { type: String, trim: true },
    shortName: { type: String, trim: true },
    location: { type: String, required: true, trim: true }, // e.g. "Toshkent", "Namangan"
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    description: { type: String },
    descriptionRu: { type: String },
    descriptionEn: { type: String },
    workingHours: { type: String, default: '09:00 - 18:00' },
    established: { type: Number },
    studentCount: { type: Number, default: 0 },
    teacherCount: { type: Number, default: 0 },
    images: [{ type: String }], // Array of up to 6 image URLs
    coverImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Index for search
branchSchema.index({ name: 'text', location: 'text', address: 'text' });

module.exports = mongoose.model('Branch', branchSchema);
