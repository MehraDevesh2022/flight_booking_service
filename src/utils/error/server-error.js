class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.status = statusCode;
        this.explanation = message;
    }
}

module.exports = AppError