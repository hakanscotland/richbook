/**
 * Utility functions for the Focus tool - Sadeleştirilmiş
 */

/**
 * Draws a line on the canvas context
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
 * @param {Object} line - The line object with points and style properties
 * @param {number} offsetX - X offset for drawing
 * @param {number} offsetY - Y offset for drawing
 * @param {number} scale - Scale factor for drawing
 */
export const drawLineOnCanvas = (ctx, line, offsetX = 0, offsetY = 0, scale = 1) => {
  ctx.beginPath();
  ctx.strokeStyle = line.color || '#000000';
  ctx.lineWidth = line.strokeWidth || 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = line.opacity || 1;
  
  if (line.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
  } else {
    ctx.globalCompositeOperation = 'source-over';
  }
  
  // Draw line points
  const points = line.points;
  if (points.length >= 2) {
    ctx.moveTo(points[0] * scale + offsetX, points[1] * scale + offsetY);
    for (let i = 2; i < points.length; i += 2) {
      ctx.lineTo(points[i] * scale + offsetX, points[i+1] * scale + offsetY);
    }
    ctx.stroke();
  }
};

/**
 * Draws a shape on the canvas context
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
 * @param {Object} shape - The shape object with type and style properties
 * @param {number} offsetX - X offset for drawing
 * @param {number} offsetY - Y offset for drawing
 * @param {number} scale - Scale factor for drawing
 */
export const drawShapeOnCanvas = (ctx, shape, offsetX = 0, offsetY = 0, scale = 1) => {
  ctx.beginPath();
  ctx.strokeStyle = shape.color || '#000000';
  ctx.lineWidth = shape.strokeWidth || 3;
  ctx.globalAlpha = shape.opacity || 1;
  ctx.globalCompositeOperation = 'source-over';
  
  if (shape.type === 'rect') {
    ctx.rect(
      shape.x * scale + offsetX, 
      shape.y * scale + offsetY, 
      shape.width * scale, 
      shape.height * scale
    );
    ctx.stroke();
  } else if (shape.type === 'ellipse') {
    const centerX = shape.x * scale + offsetX;
    const centerY = shape.y * scale + offsetY;
    
    ctx.ellipse(
      centerX,
      centerY,
      shape.radiusX * scale,
      shape.radiusY * scale,
      0,
      0,
      2 * Math.PI
    );
    ctx.stroke();
  } else if (shape.type === 'line') {
    const points = shape.points;
    ctx.moveTo(points[0] * scale + offsetX, points[1] * scale + offsetY);
    ctx.lineTo(points[2] * scale + offsetX, points[3] * scale + offsetY);
    ctx.stroke();
  } else if (shape.type === 'text') {
    ctx.font = `${(shape.fontSize || 16) * scale}px Arial`;
    ctx.fillStyle = shape.color || '#000000';
    ctx.fillText(shape.text, shape.x * scale + offsetX, shape.y * scale + offsetY + (shape.fontSize || 16) * scale);
  }
};

/**
 * Saves the focus area and whiteboard as a combined image
 * @param {Object} focusArea - The focus area object with dataURL and dimensions
 * @param {Object} stageSize - The dimensions of the stage
 * @param {Object} containerSize - The dimensions of the container 
 * @param {Object} whiteboardSize - The dimensions of the whiteboard
 * @param {number} focusZoom - The zoom level of the focus area
 * @param {Array} focusDrawings - The drawings on the focus area
 */
export const saveFocusAreaAsImage = (
  focusArea, 
  stageSize, 
  containerSize, 
  whiteboardSize, 
  focusZoom, 
  focusDrawings
) => {
  try {
    // Create a combined canvas with the image and drawings
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to the popup container size
    canvas.width = containerSize.width;
    canvas.height = containerSize.height;
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate the focus area dimensions
    const focusWidthScaled = stageSize.width * focusZoom;
    const focusHeightScaled = stageSize.height * focusZoom;
    
    // Draw the original image
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      // Draw the focus area image
      ctx.drawImage(img, 0, 0, focusWidthScaled, focusHeightScaled);
      
      // Manually draw all the lines and shapes from both canvas areas
      ctx.globalCompositeOperation = 'source-over';
      
      // Draw lines
      if (focusDrawings.length > 0) {
        focusDrawings.forEach(line => {
          // Skip if line belongs to another canvas
          if (line.canvasType === 'whiteboard') {
            // Draw on whiteboard area
            drawLineOnCanvas(ctx, line, containerSize.width - whiteboardSize.width, 0);
          } else {
            // Draw on focus area
            drawLineOnCanvas(ctx, line, 0, 0, focusZoom);
          }
        });
      }
      
      // Shapes drawing code removed
      
      // Create download link
      const link = document.createElement('a');
      link.download = `focus-area-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    img.onerror = (error) => {
      console.error('Error loading image for save:', error);
    };
    
    img.src = focusArea.dataURL;
  } catch (error) {
    console.error('Error saving focus area:', error);
  }
};