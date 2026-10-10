/**
 * Enterprise Role-Based Access Control (RBAC) Middleware
 * Enforces server-side permissions for administrative and editorial operations
 */

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'], // Full unrestricted system privileges
  ADMIN: [
    'manage_users', 'manage_branches', 'manage_teachers', 'manage_achievements',
    'manage_projects', 'manage_news', 'manage_events', 'manage_applications',
    'manage_media', 'manage_settings', 'manage_activities', 'export_data',
  ],
  CONTENT_EDITOR: [
    'manage_branches', 'manage_teachers', 'manage_achievements',
    'manage_projects', 'manage_news', 'manage_events', 'manage_media',
  ],
  BRANCH_MANAGER: [
    'manage_branches', 'manage_teachers', 'manage_achievements',
    'manage_applications',
  ],
  TEACHER: [
    'view_branches', 'view_students', 'manage_achievements',
  ],
  REVIEWER: [
    'view_records', 'read_only',
  ],
  USER: [],
};

const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  const role = (req.user.role || '').toUpperCase();
  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_EDITOR', 'BRANCH_MANAGER'];

  if (!allowedRoles.includes(role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrative privileges required.',
    });
  }

  next();
};

/**
 * Require specific role or higher
 */
const requireRole = (...roles) => {
  const normalized = roles.map((r) => r.toUpperCase());
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const userRole = (req.user.role || '').toUpperCase();
    if (userRole === 'SUPER_ADMIN' || normalized.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires one of roles: ${roles.join(', ')}`,
    });
  };
};

/**
 * Require specific permission
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const userPerms = ROLE_PERMISSIONS[userRole] || [];

    if (userPerms.includes('*') || userPerms.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Missing permission: ${permission}`,
    });
  };
};

module.exports = adminMiddleware;
module.exports.adminMiddleware = adminMiddleware;
module.exports.requireRole = requireRole;
module.exports.requirePermission = requirePermission;
module.exports.ROLE_PERMISSIONS = ROLE_PERMISSIONS;
