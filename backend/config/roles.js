const Permissions = require('./permissions');

const Roles = {
    ADMIN: 'admin',
    USER: 'user',
    SUPERVISOR: 'supervisor'
};

const RolePermissions = {
    [Roles.ADMIN]: [
        Object.values(Permissions) // Admin gets everything
    ].flat(),

    [Roles.USER]: [
        Permissions.LEAD_READ_OWN,
        Permissions.LEAD_CREATE,
        Permissions.LEAD_UPDATE_OWN,
        Permissions.USER_READ // Read own profile
    ],

    [Roles.SUPERVISOR]: [
        Permissions.LEAD_READ_ALL,
        Permissions.LEAD_CREATE,
        Permissions.LEAD_UPDATE_ALL,
        Permissions.LEAD_EXPORT,
        Permissions.USER_READ
    ]
};

module.exports = { Roles, RolePermissions };
