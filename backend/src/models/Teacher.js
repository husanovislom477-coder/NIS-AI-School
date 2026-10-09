const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  type: { type: String, required: true }, // IELTS, SAT, IOI, etc.
  name: { type: String },
  score: { type: String },
  year: { type: Number },
  image: { type: String, default: '' },
});

const teacherSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    patronymic: { type: String, trim: true, default: '' },
    photo: { type: String, default: '' },
    subject: { type: String, required: true, trim: true },
    subjectRu: { type: String, trim: true },
    subjectEn: { type: String, trim: true },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    age: { type: Number },
    university: { type: String, trim: true },
    universityRu: { type: String, trim: true },
    universityEn: { type: String, trim: true },
    education: { type: String, trim: true }, // Bachelor, Master, PhD
    experience: { type: Number, default: 0 }, // Years of experience
    biography: { type: String },
    biographyRu: { type: String },
    biographyEn: { type: String },
    certificates: [certificateSchema],
    achievements: [{ type: String }],
    achievementsRu: [{ type: String }],
    achievementsEn: [{ type: String }],
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

teacherSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

teacherSchema.index({ firstName: 'text', lastName: 'text', subject: 'text' });

module.exports = mongoose.model('Teacher', teacherSchema);
