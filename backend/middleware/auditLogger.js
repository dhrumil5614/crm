const AuditLog = require('../models/AuditLog');

/**
 * Core function to save an audit log entry
 */
const logAudit = async ({
    user,
    action,
    resource,
    resourceId = null,
    details = {},
    ip = '',
    userAgent = '',
    status = 'SUCCESS'
}) => {
    try {
        await AuditLog.create({
            user,
            action,
            resource,
            resourceId,
            details,
            ip,
            userAgent,
            status
        });
    } catch (error) {
        console.error('Audit Logging Failed:', error.message);
        // Fail silently to avoid breaking the main application flow
    }
};

/**
 * Express Middleware for automatic route auditing
 * Usage: router.post('/path', audit('CREATE_ITEM', 'Item'), controller)
 */
const audit = (action, resource) => {
    return async (req, res, next) => {
        // Capture original response methods
        const originalSend = res.send;
        const originalJson = res.json;

        // Helper to capture the response body
        let responseBody;

        res.send = function (body) {
            responseBody = body;
            originalSend.call(this, body);
        };

        res.json = function (body) {
            responseBody = body;
            originalJson.call(this, body);
        };

        // Listen for the request to finish
        res.on('finish', () => {
            // Determine status based on HTTP status code
            const status = res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS';

            // Determine resource ID (often in params or response)
            let resourceId = req.params.id || (responseBody && responseBody._id) || (responseBody && responseBody.id) || null;

            // Special handling for resourceId if it's deeply nested in response
            if (!resourceId && responseBody && typeof responseBody === 'object') {
                const keys = Object.keys(responseBody);
                // Try to find a logical ID in the response (e.g. { success: true, user: { id: ... } })
                for (const key of keys) {
                    if (responseBody[key] && (responseBody[key]._id || responseBody[key].id)) {
                        resourceId = responseBody[key]._id || responseBody[key].id;
                        break;
                    }
                }
            }

            logAudit({
                user: req.user ? req.user._id : null, // Assuming 'req.user' is populated by auth middleware
                action,
                resource,
                resourceId: resourceId ? resourceId.toString() : null,
                details: {
                    method: req.method,
                    url: req.originalUrl,
                    body: req.method !== 'GET' ? req.body : undefined, // Log body for non-GET requests
                    params: req.params,
                    query: req.query,
                    statusCode: res.statusCode,
                    error: status === 'FAILURE' ? responseBody : undefined
                },
                ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                userAgent: req.headers['user-agent'],
                status
            });
        });

        next();
    };
};

module.exports = { logAudit, audit };
