/**
 * Geospatial Utility Functions
 * 
 * This module provides utilities for geospatial calculations including:
 * - Haversine distance calculation
 * - Bounding box generation
 * - Point-in-rectangle validation
 */

/**
 * Calculate the great-circle distance between two points using the Haversine formula
 * 
 * @param {number} lat1 - Latitude of first point in decimal degrees
 * @param {number} lon1 - Longitude of first point in decimal degrees
 * @param {number} lat2 - Latitude of second point in decimal degrees
 * @param {number} lon2 - Longitude of second point in decimal degrees
 * @returns {number} Distance in kilometers
 * 
 * @example
 * // Distance from Barcelona to Madrid (approximately 504 km)
 * const distance = calculateDistance(41.3874, 2.1686, 40.4168, -3.7038);
 * console.log(distance); // ~504
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Earth's radius in kilometers
  const R = 6371;

  // Convert degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in kilometers
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 * 
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * 
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Calculate a bounding box around a center point with a given radius
 * 
 * This creates a rectangular boundary that fully contains the circle defined
 * by the center point and radius. Note: This is an approximation and becomes
 * less accurate near the poles.
 * 
 * @param {number} lat - Center latitude in decimal degrees
 * @param {number} lon - Center longitude in decimal degrees
 * @param {number} radiusKm - Radius in kilometers
 * @returns {object} Bounding box with north, south, east, west boundaries
 * 
 * @example
 * const bbox = getBoundingBox(41.3874, 2.1686, 10);
 * // { north: 41.477, south: 41.297, east: 2.295, west: 2.042 }
 */
function getBoundingBox(lat, lon, radiusKm) {
  // Earth's radius in kilometers
  const R = 6371;

  // Angular distance in radians on a great circle
  const radDist = radiusKm / R;

  const minLat = lat - toDegrees(radDist);
  const maxLat = lat + toDegrees(radDist);

  // Calculate longitude delta (accounting for latitude)
  const deltaLon = toDegrees(Math.asin(Math.sin(radDist) / Math.cos(toRadians(lat))));

  const minLon = lon - deltaLon;
  const maxLon = lon + deltaLon;

  return {
    north: Math.min(maxLat, 90), // Cap at North Pole
    south: Math.max(minLat, -90), // Cap at South Pole
    east: normalizeLongitude(maxLon),
    west: normalizeLongitude(minLon),
  };
}

/**
 * Normalize longitude to be within -180 to 180 range
 * Handles International Date Line crossing
 * 
 * @param {number} lon - Longitude in decimal degrees
 * @returns {number} Normalized longitude
 */
function normalizeLongitude(lon) {
  while (lon > 180) lon -= 360;
  while (lon < -180) lon += 360;
  return lon;
}

/**
 * Check if a point is within a bounding box (rectangle)
 * 
 * @param {number} lat - Point latitude in decimal degrees
 * @param {number} lon - Point longitude in decimal degrees
 * @param {number} north - North boundary of bounding box
 * @param {number} south - South boundary of bounding box
 * @param {number} east - East boundary of bounding box
 * @param {number} west - West boundary of bounding box
 * @returns {boolean} True if point is within the bounding box
 * 
 * @example
 * const inBox = isInBoundingBox(41.39, 2.16, 41.5, 41.3, 2.2, 2.1);
 * console.log(inBox); // true
 */
function isInBoundingBox(lat, lon, north, south, east, west) {
  // Check latitude (straightforward comparison)
  const latInRange = lat >= south && lat <= north;

  // Check longitude (handle International Date Line)
  let lonInRange;
  if (west <= east) {
    // Normal case: west is west of east
    lonInRange = lon >= west && lon <= east;
  } else {
    // Special case: bounding box crosses the International Date Line
    lonInRange = lon >= west || lon <= east;
  }

  return latInRange && lonInRange;
}

/**
 * Validate coordinate values
 * 
 * @param {number} lat - Latitude in decimal degrees
 * @param {number} lon - Longitude in decimal degrees
 * @returns {boolean} True if coordinates are valid
 */
function isValidCoordinate(lat, lon) {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * Calculate the center point (centroid) of multiple coordinates
 * 
 * @param {Array<{latitude: number, longitude: number}>} points - Array of coordinate objects
 * @returns {object} Center point with latitude and longitude
 */
function calculateCentroid(points) {
  if (!points || points.length === 0) {
    throw new Error('Cannot calculate centroid of empty point array');
  }

  let x = 0;
  let y = 0;
  let z = 0;

  points.forEach(point => {
    const latRad = toRadians(point.latitude);
    const lonRad = toRadians(point.longitude);

    x += Math.cos(latRad) * Math.cos(lonRad);
    y += Math.cos(latRad) * Math.sin(lonRad);
    z += Math.sin(latRad);
  });

  const total = points.length;
  x /= total;
  y /= total;
  z /= total;

  const lonRad = Math.atan2(y, x);
  const hyp = Math.sqrt(x * x + y * y);
  const latRad = Math.atan2(z, hyp);

  return {
    latitude: toDegrees(latRad),
    longitude: toDegrees(lonRad),
  };
}

module.exports = {
  calculateDistance,
  getBoundingBox,
  isInBoundingBox,
  isValidCoordinate,
  calculateCentroid,
  toRadians,
  toDegrees,
  normalizeLongitude,
};

