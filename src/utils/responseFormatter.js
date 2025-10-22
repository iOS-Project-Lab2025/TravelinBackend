/**
 * Response Formatter Utilities
 * 
 * Formats data according to Amadeus API specification:
 * - Location resources
 * - Collection responses with pagination
 * - Error responses
 * - HATEOAS links
 */

/**
 * Format a single POI to Location resource according to Swagger spec
 * 
 * @param {PointOfInterest} poi - POI model instance
 * @param {string} baseUrl - Base URL for generating links
 * @returns {object} Formatted location object
 * 
 * @example
 * const location = formatLocation(poi, 'http://localhost:3000');
 * // Returns: { id, self, type, subType, name, geoCode, category, rank, tags }
 */
function formatLocation(poi, baseUrl) {
  if (!poi) {
    return null;
  }

  // Use the model's built-in method
  return poi.toPublicJSON(baseUrl);
}

/**
 * Format an array of POIs to Location resources
 * 
 * @param {Array<PointOfInterest>} pois - Array of POI model instances
 * @param {string} baseUrl - Base URL for generating links
 * @returns {Array<object>} Array of formatted location objects
 */
function formatLocationCollection(pois, baseUrl) {
  if (!Array.isArray(pois)) {
    return [];
  }

  return pois.map(poi => formatLocation(poi, baseUrl));
}

/**
 * Build pagination metadata with HATEOAS links
 * 
 * @param {string} baseUrl - Base URL (e.g., 'http://localhost:3000')
 * @param {string} path - API path (e.g., '/v1/reference-data/locations/pois')
 * @param {object} queryParams - Original query parameters
 * @param {number} totalCount - Total number of results
 * @param {number} limit - Page size
 * @param {number} offset - Current offset
 * @returns {object} Meta object with count and links
 */
function buildPaginationMeta(baseUrl, path, queryParams, totalCount, limit, offset) {
  const meta = {
    count: totalCount,
    links: {},
  };

  // Helper to build URL with query params
  const buildUrl = (newOffset, newLimit = limit) => {
    const params = new URLSearchParams();

    // Add all original query params except page[offset] and page[limit]
    Object.keys(queryParams).forEach(key => {
      if (key !== 'page[offset]' && key !== 'page[limit]') {
        const value = queryParams[key];
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      }
    });

    // Add pagination params
    if (newOffset > 0) {
      params.append('page[offset]', newOffset);
    }
    if (newLimit !== 10) {
      // Only add if not default
      params.append('page[limit]', newLimit);
    }

    const queryString = params.toString();
    return `${baseUrl}${path}${queryString ? '?' + queryString : ''}`;
  };

  // Self link (current page)
  meta.links.self = buildUrl(offset, limit);

  // First link
  meta.links.first = buildUrl(0, limit);

  // Last link
  const lastOffset = Math.max(0, Math.floor((totalCount - 1) / limit) * limit);
  meta.links.last = buildUrl(lastOffset, limit);

  // Previous link (if not on first page)
  if (offset > 0) {
    const prevOffset = Math.max(0, offset - limit);
    meta.links.previous = buildUrl(prevOffset, limit);
  }

  // Next link (if not on last page)
  if (offset + limit < totalCount) {
    const nextOffset = offset + limit;
    meta.links.next = buildUrl(nextOffset, limit);
  }

  // Up link (parent resource - remove pagination)
  const upParams = new URLSearchParams();
  Object.keys(queryParams).forEach(key => {
    if (key !== 'page[offset]' && key !== 'page[limit]') {
      const value = queryParams[key];
      if (Array.isArray(value)) {
        value.forEach(v => upParams.append(key, v));
      } else if (value !== undefined && value !== null) {
        upParams.append(key, value);
      }
    }
  });
  const upQueryString = upParams.toString();
  meta.links.up = `${baseUrl}${path}${upQueryString ? '?' + upQueryString : ''}`;

  return meta;
}

/**
 * Format an error response according to Amadeus API spec
 * 
 * @param {number} status - HTTP status code
 * @param {number} code - Amadeus error code
 * @param {string} title - Error title
 * @param {string} detail - Detailed error message
 * @param {object} source - Source of the error (optional)
 * @returns {object} Formatted error response
 * 
 * Error codes:
 * - 477: INVALID FORMAT
 * - 572: INVALID OPTION
 * - 4926: INVALID DATA RECEIVED
 * - 32171: MANDATORY DATA MISSING
 * - 1797: NOT FOUND
 * - 141: SYSTEM ERROR HAS OCCURRED
 */
function formatError(status, code, title, detail, source = null) {
  const error = {
    status,
    code,
    title,
    detail,
  };

  if (source) {
    error.source = source;
  }

  return {
    errors: [error],
  };
}

/**
 * Format a collection response (data + meta)
 * 
 * @param {Array<PointOfInterest>} pois - Array of POIs
 * @param {string} baseUrl - Base URL
 * @param {string} path - API path
 * @param {object} queryParams - Query parameters
 * @param {number} totalCount - Total count
 * @param {number} limit - Page size
 * @param {number} offset - Current offset
 * @returns {object} Complete API response with data and meta
 */
function formatCollectionResponse(pois, baseUrl, path, queryParams, totalCount, limit, offset) {
  return {
    data: formatLocationCollection(pois, baseUrl),
    meta: buildPaginationMeta(baseUrl, path, queryParams, totalCount, limit, offset),
  };
}

/**
 * Format a single resource response
 * 
 * @param {PointOfInterest} poi - POI instance
 * @param {string} baseUrl - Base URL
 * @returns {object} API response with data
 */
function formatSingleResponse(poi, baseUrl) {
  return {
    data: formatLocation(poi, baseUrl),
  };
}

/**
 * Get Amadeus error code from error type
 * 
 * @param {string} errorType - Type of error
 * @returns {number} Amadeus error code
 */
function getErrorCode(errorType) {
  const errorCodes = {
    INVALID_FORMAT: 477,
    INVALID_OPTION: 572,
    INVALID_DATA: 4926,
    MANDATORY_DATA_MISSING: 32171,
    NOT_FOUND: 1797,
    SYSTEM_ERROR: 141,
  };

  return errorCodes[errorType] || 141;
}

/**
 * Format a validation error
 * 
 * @param {string} field - Field that failed validation
 * @param {string} message - Error message
 * @param {*} value - Invalid value
 * @returns {object} Formatted error response
 */
function formatValidationError(field, message, value = null) {
  return formatError(400, getErrorCode('INVALID_FORMAT'), 'INVALID FORMAT', message, {
    parameter: field,
    ...(value !== null && { example: value }),
  });
}

/**
 * Format a not found error
 * 
 * @param {string} resource - Resource that was not found
 * @param {string} id - Resource ID
 * @returns {object} Formatted error response
 */
function formatNotFoundError(resource, id) {
  return formatError(
    404,
    getErrorCode('NOT_FOUND'),
    'NOT FOUND',
    `${resource} with id '${id}' not found`,
    {
      parameter: 'id',
      example: id,
    }
  );
}

/**
 * Format a system error
 * 
 * @param {string} message - Error message (sanitized for production)
 * @returns {object} Formatted error response
 */
function formatSystemError(message = 'An unexpected error occurred') {
  return formatError(500, getErrorCode('SYSTEM_ERROR'), 'SYSTEM ERROR HAS OCCURRED', message);
}

module.exports = {
  formatLocation,
  formatLocationCollection,
  buildPaginationMeta,
  formatError,
  formatCollectionResponse,
  formatSingleResponse,
  getErrorCode,
  formatValidationError,
  formatNotFoundError,
  formatSystemError,
};

