const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Personal Information
    applicantName: {
      type: String,
      required: [true, "Ism-familiya kiritilishi shart"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email kiritilishi shart"],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Telefon raqam kiritilishi shart"],
      trim: true,
    },
    birthDate: {
      type: String,
      trim: true,
      default: '',
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },
    region: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    parentName: {
      type: String,
      trim: true,
      default: '',
    },
    parentPhone: {
      type: String,
      trim: true,
      default: '',
    },

    // Education
    currentSchool: {
      type: String,
      trim: true,
      default: '',
    },
    currentGrade: {
      type: String,
      trim: true,
      default: '',
    },
    previousEducation: {
      type: String,
      trim: true,
      default: '',
    },

    // NIS AI Application Choices
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    campusName: {
      type: String,
      default: 'NIS Toshkent',
    },
    applicationType: {
      type: String,
      enum: ['student', 'olympiad', 'grant', 'transfer', 'other'],
      default: 'student',
    },
    desiredGrade: {
      type: String,
      default: '9',
    },
    direction: {
      type: String,
      default: 'Deep Learning & AI',
    },
    subjectsOfInterest: {
      type: String,
      default: '',
    },
    englishLevel: {
      type: String,
      default: '',
    },
    ieltsScore: {
      type: String,
      trim: true,
      default: '',
    },
    satScore: {
      type: String,
      trim: true,
      default: '',
    },
    certificates: {
      type: String,
      default: '',
    },
    achievementsSummary: {
      type: String,
      default: '',
    },

    // Projects & Experience
    projectsDescription: {
      type: String,
      default: '',
    },
    programmingExperience: {
      type: String,
      default: '',
    },
    startupExperience: {
      type: String,
      default: '',
    },
    competitions: {
      type: String,
      default: '',
    },
    futureGoals: {
      type: String,
      default: '',
    },

    // Additional Notes
    motivation: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },

    // Uploaded Documents
    documents: [
      {
        name: { type: String },
        url: { type: String },
        type: { type: String },
      },
    ],

    // Workflow & Status
    status: {
      type: String,
      enum: ['PENDING', 'REVIEWING', 'CONTACTED', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Helpful index for ownership & fast queries
applicationSchema.index({ userId: 1, createdAt: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
