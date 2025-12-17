/**
 * Geometry utilities for radar chart calculations
 * Handles polar to cartesian conversion and SVG path generation
 */

/**
 * Convert polar coordinates to Cartesian (SVG) coordinates
 * Note: SVG Y-axis is inverted, and we start from top (12 o'clock)
 *
 * @param cx - Center X coordinate
 * @param cy - Center Y coordinate
 * @param radius - Distance from center
 * @param angleInRadians - Angle in radians (0 = right, adjusted to start from top)
 * @returns Cartesian coordinates {x, y}
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInRadians: number
): { x: number; y: number } {
  // Offset by -PI/2 to start from top (12 o'clock) instead of right (3 o'clock)
  const adjustedAngle = angleInRadians - Math.PI / 2;
  return {
    x: cx + radius * Math.cos(adjustedAngle),
    y: cy + radius * Math.sin(adjustedAngle),
  };
}

/**
 * Calculate angle in radians for an axis based on its index
 * Axes are evenly distributed around the circle starting from top
 *
 * @param axisIndex - Index of the axis (0-based)
 * @param totalAxes - Total number of axes
 * @returns Angle in radians
 */
export function calculateAxisAngle(axisIndex: number, totalAxes: number): number {
  if (totalAxes <= 0) return 0;
  return (2 * Math.PI * axisIndex) / totalAxes;
}

/**
 * Generate SVG path string for a polygon from a series of points
 *
 * @param points - Array of {x, y} coordinates
 * @returns SVG path d attribute string
 */
export function generatePolygonPath(
  points: readonly { x: number; y: number }[]
): string {
  if (points.length === 0) return '';

  const firstPoint = points[0];
  if (!firstPoint) return '';

  if (points.length === 1) {
    // Single point - return a small circle marker
    const x = firstPoint.x.toFixed(2);
    const y = firstPoint.y.toFixed(2);
    return `M ${x} ${y} m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0`;
  }

  const secondPoint = points[1];
  if (points.length === 2 && secondPoint) {
    // Two points - return a line
    return `M ${firstPoint.x.toFixed(2)} ${firstPoint.y.toFixed(2)} L ${secondPoint.x.toFixed(2)} ${secondPoint.y.toFixed(2)}`;
  }

  const pathParts = [`M ${firstPoint.x.toFixed(2)} ${firstPoint.y.toFixed(2)}`];

  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    if (point) {
      pathParts.push(`L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
    }
  }

  pathParts.push('Z'); // Close the path
  return pathParts.join(' ');
}

/**
 * Generate SVG path for a circular grid ring
 *
 * @param cx - Center X coordinate
 * @param cy - Center Y coordinate
 * @param radius - Radius of the circle
 * @returns SVG path d attribute string for a circle
 */
export function generateCircularGridPath(
  cx: number,
  cy: number,
  radius: number
): string {
  if (radius <= 0) return '';

  // Draw circle using two arcs (SVG can't draw a full circle with a single arc)
  return [
    `M ${cx - radius} ${cy}`,
    `A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy}`,
    `A ${radius} ${radius} 0 1 1 ${cx - radius} ${cy}`,
  ].join(' ');
}

/**
 * Generate SVG path for a polygon grid ring
 * Creates a regular polygon with the specified number of sides
 *
 * @param cx - Center X coordinate
 * @param cy - Center Y coordinate
 * @param radius - Distance from center to vertices
 * @param sides - Number of polygon sides (equals number of axes)
 * @returns SVG path d attribute string for the polygon
 */
export function generatePolygonGridPath(
  cx: number,
  cy: number,
  radius: number,
  sides: number
): string {
  if (radius <= 0 || sides < 3) return '';

  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < sides; i++) {
    const angle = calculateAxisAngle(i, sides);
    points.push(polarToCartesian(cx, cy, radius, angle));
  }

  return generatePolygonPath(points);
}

/**
 * Calculate the optimal label position for an axis
 * Adjusts position based on the angle to avoid overlapping with the chart
 *
 * @param angle - Angle of the axis in radians
 * @param cx - Center X coordinate
 * @param cy - Center Y coordinate
 * @param radius - Chart radius
 * @param offset - Additional offset for label placement
 * @returns Position {x, y} and text anchor properties
 */
export function calculateLabelPosition(
  angle: number,
  cx: number,
  cy: number,
  radius: number,
  offset: number
): {
  x: number;
  y: number;
  textAnchor: 'start' | 'middle' | 'end';
  dominantBaseline: 'auto' | 'middle' | 'hanging';
} {
  const labelRadius = radius + offset;
  const { x, y } = polarToCartesian(cx, cy, labelRadius, angle);

  // Normalize angle to 0-2π range
  const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  // Determine text anchor based on position
  let textAnchor: 'start' | 'middle' | 'end';
  let dominantBaseline: 'auto' | 'middle' | 'hanging';

  // Right side of chart
  if (normalizedAngle > 0.1 && normalizedAngle < Math.PI - 0.1) {
    textAnchor = 'start';
  }
  // Left side of chart
  else if (normalizedAngle > Math.PI + 0.1 && normalizedAngle < 2 * Math.PI - 0.1) {
    textAnchor = 'end';
  }
  // Top or bottom
  else {
    textAnchor = 'middle';
  }

  // Vertical alignment
  // Top half
  if (normalizedAngle < 0.1 || normalizedAngle > 2 * Math.PI - 0.1) {
    dominantBaseline = 'auto'; // Bottom of text aligns (text appears above)
  }
  // Bottom half
  else if (normalizedAngle > Math.PI - 0.1 && normalizedAngle < Math.PI + 0.1) {
    dominantBaseline = 'hanging'; // Top of text aligns (text appears below)
  }
  else {
    dominantBaseline = 'middle';
  }

  return { x, y, textAnchor, dominantBaseline };
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 * Useful for determining if a click/hover is within a series area
 *
 * @param point - Point to test {x, y}
 * @param polygon - Array of polygon vertices
 * @returns True if point is inside the polygon
 */
export function isPointInPolygon(
  point: { x: number; y: number },
  polygon: readonly { x: number; y: number }[]
): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  const { x, y } = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pointI = polygon[i];
    const pointJ = polygon[j];
    if (!pointI || !pointJ) continue;

    const xi = pointI.x;
    const yi = pointI.y;
    const xj = pointJ.x;
    const yj = pointJ.y;

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Calculate the centroid of a polygon
 * Useful for tooltip positioning
 *
 * @param points - Array of polygon vertices
 * @returns Centroid coordinates {x, y}
 */
export function calculatePolygonCentroid(
  points: readonly { x: number; y: number }[]
): { x: number; y: number } {
  if (points.length === 0) return { x: 0, y: 0 };

  const sum = points.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 }
  );

  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
  };
}
