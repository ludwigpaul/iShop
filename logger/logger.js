import winston from "winston";

const logFormat = winston.format.combine(
    // Add a timestamp in ISO 8601 format, which Splunk prefers.
    winston.format.timestamp({
        format: 'YYYY-MM-DDTHH:mm:ss.sssZ',
    }),
    // Log errors with a stack trace.
    winston.format.errors({ stack: true }),
    // Pretty print the JSON in the console for readability.
    winston.format.json()
);

// Define file options to set permissions that allow other users to read the file.
const fileOptions = {
    mode: 0o644, // Read/Write for owner, Read-only for group and others.
};



export const logger = winston.createLogger({
    level: "info",
    format: logFormat,
    exitOnError: false,
    transports: [
        // 1. Log to the console.
        new winston.transports.Console({
            // Use a simpler format for the console.
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
        // 2. Log all errors to a dedicated error file.
        new winston.transports.File({
            filename: '/var/log/error.log',
            level: 'error',
            options: fileOptions
        }),
        // 3. Log all messages with level 'info' and above to a combined file.
        new winston.transports.File({ filename: '/var/log/combined.log', options: fileOptions })
    ]
});

export const stream = {
    write: (message) => {
        // Morgan logs successful requests (status < 400) at 'info' level
        // and failed requests (status >= 400) at 'warn' level.
        // We can use this to route them appropriately.
        logger.info(message.trim());
    },
};

