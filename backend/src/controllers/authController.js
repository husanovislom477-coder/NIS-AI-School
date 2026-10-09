const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const {
  findUserById,
  findUserByEmail,
  findUserByGoogleId,
  createUser,
  updateUser,
  sanitizeUser,
} = require('../services/db');

const signToken = (id, rememberMe = true) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'nis_ai_school_secret_key_2026', {
    expiresIn: rememberMe !== false ? (process.env.JWT_EXPIRES_IN || '30d') : '1d',
  });

// Active 2MFA verification codes for Admin logins (expires after 10 mins)
const active2FACodes = new Map();

// @desc   Register new user
// @route  POST /api/auth/register
// @access Public
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { firstName, lastName, middleName, patronymic, email, password, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Ism, familiya, email va parol kiritilishi shart.',
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email orqali allaqachon ro\'yxatdan o\'tilgan.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await createUser({
      firstName,
      lastName,
      middleName: middleName || patronymic || '',
      email,
      phone: phone || '',
      passwordHash,
      role: 'USER',
    });

    const token = signToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Hisob muvaffaqiyatli yaratildi.',
      token,
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
  try {
    const { email, password, twoFactorCode, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email va parol kiritilishi shart.' });
    }

    const user = await findUserByEmail(email);
    if (!user || user.isActive === false) {
      return res.status(401).json({ success: false, message: 'Email yoki parol noto\'g\'ri.' });
    }

    const hash = user.passwordHash || user.password;
    let isMatch = false;
    if (hash) {
      isMatch = await bcrypt.compare(password, hash).catch(() => false);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email yoki parol noto\'g\'ri.' });
    }

    const role = (user.role || '').toUpperCase();

    // Check if user is Admin -> require 2MFA
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      if (!twoFactorCode) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        active2FACodes.set(user.email.toLowerCase(), {
          code,
          expires: Date.now() + 10 * 60 * 1000,
        });
        console.log(`🔐 [2MFA] Admin ${user.email} uchun tasdiqlash kodi: ${code}`);
        return res.json({
          success: true,
          requires2FA: true,
          message: "Admin hisobi aniqlandi. 2MFA (Ikki bosqichli xavfsizlik) kodi talab qilinadi.",
          email: user.email,
          twoFactorCode: code,
        });
      }

      const submitted = twoFactorCode.toString().trim();
      const stored = active2FACodes.get(user.email.toLowerCase());
      const isValid = stored && stored.code === submitted && Date.now() < stored.expires;

      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: "Noto'g'ri 2MFA xavfsizlik kodi kiritildi yoki muddat o'tgan!",
        });
      }
      active2FACodes.delete(user.email.toLowerCase());
    }

    // Update lastLoginAt
    await updateUser(user.id, { lastLoginAt: new Date().toISOString() });

    const token = signToken(user.id, rememberMe !== false);
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

    res.json({
      success: true,
      message: 'Muvaffaqiyatli kirildi.',
      token,
      isAdmin,
      redirectTo: isAdmin ? '/admin' : '/',
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Admin login
// @route  POST /api/auth/admin-login
// @access Public
const adminLogin = async (req, res, next) => {
  try {
    const { email, password, twoFactorCode, rememberMe } = req.body;

    const user = await findUserByEmail(email);
    const role = (user?.role || '').toUpperCase();
    if (!user || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
      return res.status(401).json({ success: false, message: 'Admin huquqi mavjud emas.' });
    }

    const hash = user.passwordHash || user.password;
    let isMatch = false;
    if (hash) {
      isMatch = await bcrypt.compare(password, hash).catch(() => false);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Admin paroli noto\'g\'ri.' });
    }

    if (!twoFactorCode) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      active2FACodes.set(user.email.toLowerCase(), {
        code,
        expires: Date.now() + 10 * 60 * 1000,
      });
      console.log(`🔐 [2MFA] Admin ${user.email} uchun 2MFA kodi: ${code}`);
      return res.json({
        success: true,
        requires2FA: true,
        message: "Admin hisobi: 2MFA tasdiqlash kodi talab qilinadi.",
        email: user.email,
        twoFactorCode: code,
      });
    }

    const submitted = twoFactorCode.toString().trim();
    const stored = active2FACodes.get(user.email.toLowerCase());
    const isValid = stored && stored.code === submitted && Date.now() < stored.expires;

    if (!isValid) {
      return res.status(401).json({ success: false, message: "Noto'g'ri 2MFA kodi kiritildi yoki muddat o'tgan!" });
    }
    active2FACodes.delete(user.email.toLowerCase());

    await updateUser(user.id, { lastLoginAt: new Date().toISOString() });
    const token = signToken(user.id, rememberMe !== false);

    res.json({
      success: true,
      message: 'Admin muvaffaqiyatli tizimga kirdi.',
      token,
      isAdmin: true,
      redirectTo: '/admin',
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get current user
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi.' });
    }
    res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

// @desc   Update profile
// @route  PUT /api/auth/me
// @access Private
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, middleName, patronymic, phone, language, theme, primaryColor, secondaryColor } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (middleName !== undefined) updateData.middleName = middleName;
    if (patronymic !== undefined) updateData.middleName = patronymic;
    if (phone !== undefined) updateData.phone = phone;
    if (language) updateData.language = language;
    if (theme) updateData.theme = theme;
    if (primaryColor) updateData.primaryColor = primaryColor;
    if (secondaryColor) updateData.secondaryColor = secondaryColor;

    // Profile photo upload
    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    const updated = await updateUser(req.user.id, updateData);
    res.json({
      success: true,
      message: 'Profil muvaffaqiyatli yangilandi.',
      data: sanitizeUser(updated),
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Change password
// @route  PUT /api/auth/change-password
// @access Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Joriy va yangi parol kiritilishi shart.' });
    }

    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi.' });
    }

    const hash = user.passwordHash || user.password;
    const isMatch = await bcrypt.compare(currentPassword, hash).catch(() => false);
    if (!isMatch && hash !== currentPassword) {
      return res.status(400).json({ success: false, message: 'Joriy parol noto\'g\'ri kiritildi.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await updateUser(user.id, { passwordHash: newHash });

    res.json({ success: true, message: 'Parol muvaffaqiyatli o\'zgartirildi.' });
  } catch (error) {
    next(error);
  }
};

// @desc   Logout user
// @route  POST /api/auth/logout
// @access Public
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Tizimdan muvaffaqiyatli chiqildi.',
  });
};

module.exports = {
  register,
  login,
  adminLogin,
  getMe,
  updateProfile,
  changePassword,
  logout,
};
