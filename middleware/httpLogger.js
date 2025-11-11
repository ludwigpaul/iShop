import { logger } from '../logger/logger.js';

export const httpLogger = (req, res, next) => {
    const startTime = Date.now();

    // Capture request details
    const requestData = {
        method: req.method,
        url: req.originalUrl || req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString(),
        headers: {
            contentType: req.get('Content-Type'),
            authorization: req.get('Authorization') ? 'Bearer [REDACTED]' : undefined,
            accept: req.get('Accept')
        },
        body: req.method !== 'GET' && req.body ? sanitizeBody(req.body) : undefined,
        query: Object.keys(req.query).length > 0 ? req.query : undefined
    };

    // Log the incoming request
    logger.info('HTTP Request', {
        type: 'HTTP_REQUEST',
        ...requestData
    });

    // Override res.json and res.send to capture response
    const originalJson = res.json;
    const originalSend = res.send;

    res.json = function(body) {
        logResponse(req, res, body, startTime);
        return originalJson.call(this, body);
    };

    res.send = function(body) {
        logResponse(req, res, body, startTime);
        return originalSend.call(this, body);
    };

    next();
};

// Helper function to log the response
function logResponse(req, res, body, startTime) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    const responseData = {
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: statusCode,
        statusMessage: res.statusMessage,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        responseSize: JSON.stringify(body).length + ' bytes',
        headers: {
            contentType: res.get('Content-Type')
        },
        // Only log response body for errors or if it's small
        responseBody: shouldLogResponseBody(statusCode, body) ? sanitizeResponseBody(body) : '[REDACTED - Too Large]'
    };

    // Choose log level based on status code
    if (statusCode >= 500) {
        logger.error('HTTP Response - Server Error', {
            type: 'HTTP_RESPONSE',
            ...responseData
        });
    } else if (statusCode >= 400) {
        logger.warn('HTTP Response - Client Error', {
            type: 'HTTP_RESPONSE',
            ...responseData
        });
    } else {
        logger.info('HTTP Response - Success', {
            type: 'HTTP_RESPONSE',
            ...responseData
        });
    }
}

// Helper function to sanitize request body (remove sensitive data)
function sanitizeBody(body) {
    if (!body || typeof body !== 'object') return body;

    const sanitized = { ...body };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    });

    return sanitized;
}

// Helper function to sanitize response body
function sanitizeResponseBody(body) {
    if (!body || typeof body !== 'object') return body;

    const sanitized = { ...body };

    // Remove sensitive fields from response
    const sensitiveFields = ['accessToken', 'refreshToken', 'password', 'secret'];
    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    });

    return sanitized;
}

// Helper function to determine if response body should be logged
function shouldLogResponseBody(statusCode, body) {
    // Always log error responses
    if (statusCode >= 400) return true;

    // Log successful responses if they're small (less than 1KB)
    if (typeof body === 'object') {
        return JSON.stringify(body).length < 1024;
    }

    return typeof body === 'string' && body.length < 1024;
}