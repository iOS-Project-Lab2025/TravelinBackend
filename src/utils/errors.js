/**
 * Custom Error Classes
 *
 * Extends Error with additional properties for API error responses:
 * - status: HTTP status code
 * - code: Amadeus error code
 * - title: Error title
 * - detail: Detailed error message
 * - source: Source of the error (field, parameter, etc.)
 */

/**
 * Base API Error class
 */
class ApiError extends Error {
  constructor(status, code, title, detail, source = null) {
    super(detail);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.title = title;
    this.detail = detail;
    this.source = source;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    const error = {
      status: this.status,
      code: this.code,
      title: this.title,
      detail: this.detail,
    };

    if (this.source) {
      error.source = this.source;
    }

    return error;
  }
}

/**
 * 400 Bad Request - Invalid Format
 * Amadeus Code: 477
 */
class ValidationError extends ApiError {
  constructor(detail, source = null) {
    super(400, 477, 'INVALID FORMAT', detail, source);
  }
}

/**
 * 400 Bad Request - Mandatory Data Missing
 * Amadeus Code: 32171
 */
class MandatoryDataMissingError extends ApiError {
  constructor(detail, source = null) {
    super(400, 32171, 'MANDATORY DATA MISSING', detail, source);
  }
}

/**
 * 400 Bad Request - Invalid Option
 * Amadeus Code: 572
 */
class InvalidOptionError extends ApiError {
  constructor(detail, source = null) {
    super(400, 572, 'INVALID OPTION', detail, source);
  }
}

/**
 * 400 Bad Request - Invalid Data Received
 * Amadeus Code: 4926
 */
class InvalidDataError extends ApiError {
  constructor(detail, source = null) {
    super(400, 4926, 'INVALID DATA RECEIVED', detail, source);
  }
}

/**
 * 401 Unauthorized
 * Amadeus Code: 38187
 */
class UnauthorizedError extends ApiError {
  constructor(detail, source = null) {
    super(401, 38187, 'UNAUTHORIZED', detail, source);
  }
}

/**
 * 404 Not Found
 * Amadeus Code: 1797
 */
class NotFoundError extends ApiError {
  constructor(detail, source = null) {
    super(404, 1797, 'NOT FOUND', detail, source);
  }
}

/**
 * 500 Internal Server Error
 * Amadeus Code: 141
 */
class InternalServerError extends ApiError {
  constructor(detail = 'An unexpected error occurred', source = null) {
    super(500, 141, 'SYSTEM ERROR HAS OCCURRED', detail, source);
  }
}

module.exports = {
  ApiError,
  ValidationError,
  MandatoryDataMissingError,
  InvalidOptionError,
  InvalidDataError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
};
