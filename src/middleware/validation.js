/**
 * Validation Middleware
 * 
 * Validates incoming request parameters before they reach the controller.
 * Throws appropriate errors for invalid input.
 */

const {
  ValidationError,
  MandatoryDataMissingError,
  InvalidOptionError,
} = require('../utils/errors');

// Valid category values according to Swagger spec
const VALID_CATEGORIES = ['SIGHTS', 'BEACH_PARK', 'HISTORICAL', 'NIGHTLIFE', 'RESTAURANT', 'SHOPPING'];

/**
 * Validate GET /pois endpoint (search by radius)
 * 
 * Required: latitude, longitude
 * Optional: radius (0-20, default 1), categories, page[limit], page[offset]
 */
function validateGetPois(req, res, next) {
  try {
    const { latitude, longitude, radius, categories } = req.query;
    const limit = req.query['page[limit]'];
    const offset = req.query['page[offset]'];

    // Validate latitude (required)
    if (latitude === undefined || latitude === null || latitude === '') {
      throw new MandatoryDataMissingError(
        'latitude is required',
        { parameter: 'latitude' }
      );
    }

    const lat = parseFloat(latitude);
    if (isNaN(lat)) {
      throw new ValidationError(
        'latitude must be a valid number',
        { parameter: 'latitude', example: latitude }
      );
    }

    if (lat < -90 || lat > 90) {
      throw new ValidationError(
        'latitude must be between -90 and 90',
        { parameter: 'latitude', example: lat }
      );
    }

    // Validate longitude (required)
    if (longitude === undefined || longitude === null || longitude === '') {
      throw new MandatoryDataMissingError(
        'longitude is required',
        { parameter: 'longitude' }
      );
    }

    const lon = parseFloat(longitude);
    if (isNaN(lon)) {
      throw new ValidationError(
        'longitude must be a valid number',
        { parameter: 'longitude', example: longitude }
      );
    }

    if (lon < -180 || lon > 180) {
      throw new ValidationError(
        'longitude must be between -180 and 180',
        { parameter: 'longitude', example: lon }
      );
    }

    // Validate radius (optional)
    if (radius !== undefined) {
      const rad = parseInt(radius);
      if (isNaN(rad)) {
        throw new ValidationError(
          'radius must be a valid integer',
          { parameter: 'radius', example: radius }
        );
      }

      if (rad < 0 || rad > 20) {
        throw new InvalidOptionError(
          'radius must be between 0 and 20 kilometers',
          { parameter: 'radius', example: rad }
        );
      }
    }

    // Validate categories (optional)
    if (categories !== undefined && categories !== null && categories !== '') {
      let categoryArray;
      
      if (Array.isArray(categories)) {
        categoryArray = categories;
      } else if (typeof categories === 'string') {
        categoryArray = categories.split(',').map(c => c.trim());
      } else {
        throw new ValidationError(
          'categories must be a string or array',
          { parameter: 'categories' }
        );
      }

      // Check each category is valid
      for (const category of categoryArray) {
        if (!VALID_CATEGORIES.includes(category)) {
          throw new InvalidOptionError(
            `Invalid category: ${category}. Valid categories are: ${VALID_CATEGORIES.join(', ')}`,
            { parameter: 'categories', example: category }
          );
        }
      }
    }

    // Validate page[limit] (optional)
    if (limit !== undefined) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1) {
        throw new ValidationError(
          'page[limit] must be a positive integer',
          { parameter: 'page[limit]', example: limit }
        );
      }

      if (limitNum > 100) {
        throw new InvalidOptionError(
          'page[limit] must not exceed 100',
          { parameter: 'page[limit]', example: limitNum }
        );
      }
    }

    // Validate page[offset] (optional)
    if (offset !== undefined) {
      const offsetNum = parseInt(offset);
      if (isNaN(offsetNum) || offsetNum < 0) {
        throw new ValidationError(
          'page[offset] must be a non-negative integer',
          { parameter: 'page[offset]', example: offset }
        );
      }
    }

    // All validations passed
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Validate GET /pois/by-square endpoint (search by bounding box)
 * 
 * Required: north, south, east, west
 * Optional: categories, page[limit], page[offset]
 */
function validateGetPoisBySquare(req, res, next) {
  try {
    const { north, south, east, west, categories } = req.query;
    const limit = req.query['page[limit]'];
    const offset = req.query['page[offset]'];

    // Validate north (required)
    if (north === undefined || north === null || north === '') {
      throw new MandatoryDataMissingError(
        'north is required',
        { parameter: 'north' }
      );
    }

    const northNum = parseFloat(north);
    if (isNaN(northNum)) {
      throw new ValidationError(
        'north must be a valid number',
        { parameter: 'north', example: north }
      );
    }

    if (northNum < -90 || northNum > 90) {
      throw new ValidationError(
        'north must be between -90 and 90',
        { parameter: 'north', example: northNum }
      );
    }

    // Validate south (required)
    if (south === undefined || south === null || south === '') {
      throw new MandatoryDataMissingError(
        'south is required',
        { parameter: 'south' }
      );
    }

    const southNum = parseFloat(south);
    if (isNaN(southNum)) {
      throw new ValidationError(
        'south must be a valid number',
        { parameter: 'south', example: south }
      );
    }

    if (southNum < -90 || southNum > 90) {
      throw new ValidationError(
        'south must be between -90 and 90',
        { parameter: 'south', example: southNum }
      );
    }

    // Validate north > south
    if (northNum <= southNum) {
      throw new ValidationError(
        'north must be greater than south',
        { parameter: 'north, south', example: `north: ${northNum}, south: ${southNum}` }
      );
    }

    // Validate east (required)
    if (east === undefined || east === null || east === '') {
      throw new MandatoryDataMissingError(
        'east is required',
        { parameter: 'east' }
      );
    }

    const eastNum = parseFloat(east);
    if (isNaN(eastNum)) {
      throw new ValidationError(
        'east must be a valid number',
        { parameter: 'east', example: east }
      );
    }

    if (eastNum < -180 || eastNum > 180) {
      throw new ValidationError(
        'east must be between -180 and 180',
        { parameter: 'east', example: eastNum }
      );
    }

    // Validate west (required)
    if (west === undefined || west === null || west === '') {
      throw new MandatoryDataMissingError(
        'west is required',
        { parameter: 'west' }
      );
    }

    const westNum = parseFloat(west);
    if (isNaN(westNum)) {
      throw new ValidationError(
        'west must be a valid number',
        { parameter: 'west', example: west }
      );
    }

    if (westNum < -180 || westNum > 180) {
      throw new ValidationError(
        'west must be between -180 and 180',
        { parameter: 'west', example: westNum }
      );
    }

    // Note: We allow east == west for International Date Line crossing
    // The service layer will handle this case

    // Validate categories (optional) - same as validateGetPois
    if (categories !== undefined && categories !== null && categories !== '') {
      let categoryArray;
      
      if (Array.isArray(categories)) {
        categoryArray = categories;
      } else if (typeof categories === 'string') {
        categoryArray = categories.split(',').map(c => c.trim());
      } else {
        throw new ValidationError(
          'categories must be a string or array',
          { parameter: 'categories' }
        );
      }

      for (const category of categoryArray) {
        if (!VALID_CATEGORIES.includes(category)) {
          throw new InvalidOptionError(
            `Invalid category: ${category}. Valid categories are: ${VALID_CATEGORIES.join(', ')}`,
            { parameter: 'categories', example: category }
          );
        }
      }
    }

    // Validate pagination - same as validateGetPois
    if (limit !== undefined) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1) {
        throw new ValidationError(
          'page[limit] must be a positive integer',
          { parameter: 'page[limit]', example: limit }
        );
      }

      if (limitNum > 100) {
        throw new InvalidOptionError(
          'page[limit] must not exceed 100',
          { parameter: 'page[limit]', example: limitNum }
        );
      }
    }

    if (offset !== undefined) {
      const offsetNum = parseInt(offset);
      if (isNaN(offsetNum) || offsetNum < 0) {
        throw new ValidationError(
          'page[offset] must be a non-negative integer',
          { parameter: 'page[offset]', example: offset }
        );
      }
    }

    // All validations passed
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Validate GET /pois/by-name endpoint (search by name)
 * 
 * Required: name
 * Optional: categories, page[limit], page[offset]
 */
function validateGetPoisByName(req, res, next) {
  try {
    const { name, categories } = req.query;
    const limit = req.query['page[limit]'];
    const offset = req.query['page[offset]'];

    // Validate name (required)
    if (name === undefined || name === null || name === '') {
      throw new MandatoryDataMissingError(
        'name is required',
        { parameter: 'name' }
      );
    }

    if (typeof name !== 'string') {
      throw new ValidationError(
        'name must be a string',
        { parameter: 'name', example: name }
      );
    }

    if (name.trim().length === 0) {
      throw new ValidationError(
        'name cannot be empty',
        { parameter: 'name' }
      );
    }

    if (name.length > 255) {
      throw new ValidationError(
        'name must be less than 255 characters',
        { parameter: 'name' }
      );
    }

    // Validate categories (optional) - same as other endpoints
    if (categories !== undefined && categories !== null && categories !== '') {
      let categoryArray;
      
      if (Array.isArray(categories)) {
        categoryArray = categories;
      } else if (typeof categories === 'string') {
        categoryArray = categories.split(',').map(c => c.trim());
      } else {
        throw new ValidationError(
          'categories must be a string or array',
          { parameter: 'categories' }
        );
      }

      for (const category of categoryArray) {
        if (!VALID_CATEGORIES.includes(category)) {
          throw new InvalidOptionError(
            `Invalid category: ${category}. Valid categories are: ${VALID_CATEGORIES.join(', ')}`,
            { parameter: 'categories', example: category }
          );
        }
      }
    }

    // Validate page[limit] (optional)
    if (limit !== undefined) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1) {
        throw new ValidationError(
          'page[limit] must be a positive integer',
          { parameter: 'page[limit]', example: limit }
        );
      }

      if (limitNum > 100) {
        throw new InvalidOptionError(
          'page[limit] must not exceed 100',
          { parameter: 'page[limit]', example: limitNum }
        );
      }
    }

    // Validate page[offset] (optional)
    if (offset !== undefined) {
      const offsetNum = parseInt(offset);
      if (isNaN(offsetNum) || offsetNum < 0) {
        throw new ValidationError(
          'page[offset] must be a non-negative integer',
          { parameter: 'page[offset]', example: offset }
        );
      }
    }

    // All validations passed
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Validate GET /pois/:poisId endpoint (get by ID)
 * 
 * Required: poisId (path parameter)
 */
function validateGetPoiById(req, res, next) {
  try {
    const { poisId } = req.params;

    // Validate poisId (required)
    if (!poisId || typeof poisId !== 'string' || poisId.trim() === '') {
      throw new ValidationError(
        'poisId is required and must be a non-empty string',
        { parameter: 'poisId' }
      );
    }

    // All validations passed
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Validate POST /auth/register endpoint
 * 
 * Required: email, password
 * Optional: firstName, lastName, phone
 */
function validateRegister(req, res, next) {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validate email (required)
    if (!email || typeof email !== 'string' || email.trim() === '') {
      throw new MandatoryDataMissingError(
        'email is required',
        { parameter: 'email' }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new ValidationError(
        'email must be a valid email address',
        { parameter: 'email', example: email }
      );
    }

    // Validate password (required)
    if (!password || typeof password !== 'string') {
      throw new MandatoryDataMissingError(
        'password is required',
        { parameter: 'password' }
      );
    }

    if (password.length < 6) {
      throw new ValidationError(
        'password must be at least 6 characters long',
        { parameter: 'password' }
      );
    }

    if (password.length > 255) {
      throw new ValidationError(
        'password must be less than 255 characters',
        { parameter: 'password' }
      );
    }

    // Validate firstName (optional)
    if (firstName !== undefined && firstName !== null) {
      if (typeof firstName !== 'string') {
        throw new ValidationError(
          'firstName must be a string',
          { parameter: 'firstName' }
        );
      }
      if (firstName.length > 255) {
        throw new ValidationError(
          'firstName must be less than 255 characters',
          { parameter: 'firstName' }
        );
      }
    }

    // Validate lastName (optional)
    if (lastName !== undefined && lastName !== null) {
      if (typeof lastName !== 'string') {
        throw new ValidationError(
          'lastName must be a string',
          { parameter: 'lastName' }
        );
      }
      if (lastName.length > 255) {
        throw new ValidationError(
          'lastName must be less than 255 characters',
          { parameter: 'lastName' }
        );
      }
    }

    // Validate phone (optional)
    if (phone !== undefined && phone !== null) {
      if (typeof phone !== 'string') {
        throw new ValidationError(
          'phone must be a string',
          { parameter: 'phone' }
        );
      }
      if (phone.trim().length > 50) {
        throw new ValidationError(
          'phone must be less than 50 characters',
          { parameter: 'phone' }
        );
      }
    }

    // All validations passed
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Validate POST /auth/login endpoint
 * 
 * Required: email, password
 */
function validateLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate email (required)
    if (!email || typeof email !== 'string' || email.trim() === '') {
      throw new MandatoryDataMissingError(
        'email is required',
        { parameter: 'email' }
      );
    }

    // Validate password (required)
    if (!password || typeof password !== 'string') {
      throw new MandatoryDataMissingError(
        'password is required',
        { parameter: 'password' }
      );
    }

    // All validations passed
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Validate POST /favorites endpoint
 * 
 * Required: poiId
 */
function validateAddFavorite(req, res, next) {
  try {
    const { poiId } = req.body;

    // Validate poiId (required)
    if (!poiId || typeof poiId !== 'string' || poiId.trim() === '') {
      throw new MandatoryDataMissingError(
        'poiId is required',
        { parameter: 'poiId' }
      );
    }

    // All validations passed
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Validate GET /favorites endpoint pagination
 */
function validateGetFavorites(req, res, next) {
  try {
    const limit = req.query['page[limit]'];
    const offset = req.query['page[offset]'];

    // Validate page[limit] (optional)
    if (limit !== undefined) {
      const lim = parseInt(limit, 10);
      if (isNaN(lim)) {
        throw new ValidationError(
          'page[limit] must be a valid integer',
          { parameter: 'page[limit]', example: limit }
        );
      }

      if (lim < 1 || lim > 100) {
        throw new InvalidOptionError(
          'page[limit] must be between 1 and 100',
          { parameter: 'page[limit]', example: lim }
        );
      }
    }

    // Validate page[offset] (optional)
    if (offset !== undefined) {
      const off = parseInt(offset, 10);
      if (isNaN(off)) {
        throw new ValidationError(
          'page[offset] must be a valid integer',
          { parameter: 'page[offset]', example: offset }
        );
      }

      if (off < 0) {
        throw new ValidationError(
          'page[offset] must be a non-negative integer',
          { parameter: 'page[offset]', example: off }
        );
      }
    }

    // All validations passed
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Validate POST /bookings endpoint
 * 
 * Required: poiId, startDate, endDate
 */
function validateCreateBooking(req, res, next) {
  try {
    const { poiId, startDate, endDate } = req.body;

    // Validate poiId (required)
    if (!poiId || typeof poiId !== 'string' || poiId.trim() === '') {
      throw new MandatoryDataMissingError(
        'poiId is required',
        { parameter: 'poiId' }
      );
    }

    // Validate startDate (required)
    if (!startDate || typeof startDate !== 'string' || startDate.trim() === '') {
      throw new MandatoryDataMissingError(
        'startDate is required',
        { parameter: 'startDate' }
      );
    }

    // Validate startDate format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate.trim())) {
      throw new ValidationError(
        'startDate must be in YYYY-MM-DD format',
        { parameter: 'startDate', example: startDate }
      );
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      throw new ValidationError(
        'startDate must be a valid date',
        { parameter: 'startDate', example: startDate }
      );
    }

    // Validate endDate (required)
    if (!endDate || typeof endDate !== 'string' || endDate.trim() === '') {
      throw new MandatoryDataMissingError(
        'endDate is required',
        { parameter: 'endDate' }
      );
    }

    // Validate endDate format (YYYY-MM-DD)
    if (!dateRegex.test(endDate.trim())) {
      throw new ValidationError(
        'endDate must be in YYYY-MM-DD format',
        { parameter: 'endDate', example: endDate }
      );
    }

    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      throw new ValidationError(
        'endDate must be a valid date',
        { parameter: 'endDate', example: endDate }
      );
    }

    // Validate endDate > startDate
    if (end <= start) {
      throw new ValidationError(
        'endDate must be after startDate',
        { parameter: 'endDate', example: `${startDate} < ${endDate}` }
      );
    }

    // All validations passed
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Validate GET /bookings endpoint pagination
 */
function validateGetBookings(req, res, next) {
  try {
    const limit = req.query['page[limit]'];
    const offset = req.query['page[offset]'];

    // Validate page[limit] (optional)
    if (limit !== undefined) {
      const lim = parseInt(limit, 10);
      if (isNaN(lim)) {
        throw new ValidationError(
          'page[limit] must be a valid integer',
          { parameter: 'page[limit]', example: limit }
        );
      }

      if (lim < 1 || lim > 100) {
        throw new InvalidOptionError(
          'page[limit] must be between 1 and 100',
          { parameter: 'page[limit]', example: lim }
        );
      }
    }

    // Validate page[offset] (optional)
    if (offset !== undefined) {
      const off = parseInt(offset, 10);
      if (isNaN(off)) {
        throw new ValidationError(
          'page[offset] must be a valid integer',
          { parameter: 'page[offset]', example: offset }
        );
      }

      if (off < 0) {
        throw new ValidationError(
          'page[offset] must be a non-negative integer',
          { parameter: 'page[offset]', example: off }
        );
      }
    }

    // All validations passed
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Validate GET /bookings/availability endpoint
 * 
 * Required: poiId, startDate, endDate
 */
function validateCheckAvailability(req, res, next) {
  try {
    const { poiId, startDate, endDate } = req.query;

    // Validate poiId (required)
    if (!poiId || typeof poiId !== 'string' || poiId.trim() === '') {
      throw new MandatoryDataMissingError(
        'poiId is required',
        { parameter: 'poiId' }
      );
    }

    // Validate startDate (required)
    if (!startDate || typeof startDate !== 'string' || startDate.trim() === '') {
      throw new MandatoryDataMissingError(
        'startDate is required',
        { parameter: 'startDate' }
      );
    }

    // Validate startDate format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate.trim())) {
      throw new ValidationError(
        'startDate must be in YYYY-MM-DD format',
        { parameter: 'startDate', example: startDate }
      );
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      throw new ValidationError(
        'startDate must be a valid date',
        { parameter: 'startDate', example: startDate }
      );
    }

    // Validate endDate (required)
    if (!endDate || typeof endDate !== 'string' || endDate.trim() === '') {
      throw new MandatoryDataMissingError(
        'endDate is required',
        { parameter: 'endDate' }
      );
    }

    // Validate endDate format (YYYY-MM-DD)
    if (!dateRegex.test(endDate.trim())) {
      throw new ValidationError(
        'endDate must be in YYYY-MM-DD format',
        { parameter: 'endDate', example: endDate }
      );
    }

    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      throw new ValidationError(
        'endDate must be a valid date',
        { parameter: 'endDate', example: endDate }
      );
    }

    // Validate endDate > startDate
    if (end <= start) {
      throw new ValidationError(
        'endDate must be after startDate',
        { parameter: 'endDate', example: `${startDate} < ${endDate}` }
      );
    }

    // All validations passed
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Validate GET /bookings/:bookingId endpoint
 * 
 * Required: bookingId (path parameter)
 */
function validateGetBookingById(req, res, next) {
  try {
    const { bookingId } = req.params;

    // Validate bookingId (required)
    if (!bookingId) {
      throw new ValidationError(
        'bookingId is required',
        { parameter: 'bookingId' }
      );
    }

    const id = parseInt(bookingId, 10);
    if (isNaN(id) || id < 1) {
      throw new ValidationError(
        'bookingId must be a positive integer',
        { parameter: 'bookingId', example: bookingId }
      );
    }

    // All validations passed
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Validate DELETE /auth/me endpoint
 * 
 * Optional: password (for confirmation)
 */
function validateDeleteAccount(req, res, next) {
  try {
    const { password } = req.body;

    // Validate password if provided (optional but recommended)
    if (password !== undefined && password !== null) {
      if (typeof password !== 'string') {
        throw new ValidationError(
          'Password must be a string',
          { parameter: 'password' }
        );
      }

      if (password.trim() === '') {
        throw new ValidationError(
          'Password cannot be empty',
          { parameter: 'password' }
        );
      }
    }

    // All validations passed
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  validateGetPois,
  validateGetPoisBySquare,
  validateGetPoisByName,
  validateGetPoiById,
  validateRegister,
  validateLogin,
  validateAddFavorite,
  validateGetFavorites,
  validateCreateBooking,
  validateGetBookings,
  validateCheckAvailability,
  validateGetBookingById,
  validateDeleteAccount,
  VALID_CATEGORIES,
};

