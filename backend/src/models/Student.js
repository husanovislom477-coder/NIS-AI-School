const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  type: { type: String, required: true }, // IELTS, SAT, IOI, etc.
  score: { type: String },
  year: { type: Number },
  certificateImage: { type: String, default: '' },
});

const awardSchema = new mongoose.Schema({
  title: { type: String },
  titleRu: { type: String },
  titleEn: { type: String },
  year: { type: Number },
  level: { type: String }, // National, International, Regional
});

const studentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    photo: { type: String, default: '' },
    certificatePhoto: { type: String, default: '' },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    grade: { type: String, trim: true }, // e.g. "10-A"
    graduationYear: { type: Number },
    results: [resultSchema],
    awards: [awardSchema],
    projects: [
      {
        title: { type: String },
        titleRu: { type: String },
        titleEn: { type: String },
        description: { type: String },
        link: { type: String },
        year: { type: Number },
      },
    ],
    startup: { type: String, default: '' },
    biography: { type: String, default: '' },
    biographyRu: { type: String, default: '' },
    biographyEn: { type: String, default: '' },
    achievements: [{ type: String }],
    achievementsRu: [{ type: String }],
    achievementsEn: [{ type: String }],
    university: { type: String, trim: true }, // Admitted university
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

studentSchema.index({ firstName: 'text', lastName: 'text' });

module.exports = mongoose.model('Student', studentSchema);
