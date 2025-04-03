import React from 'react';
import { Stage, Layer, Line } from 'react-konva';
import './styles.css';

/**
 * Component for displaying and interacting with the focus area image
 */
const FocusImage = ({
  focusArea,
  stageSize,
  focusCanvasRef,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  focusZoom,
  tool,
  focusDrawings,
  focusShapes,
  tempShape,
  currentFocusLine,
  renderShape,
  isDarkMode,
  containerSize
}) => {
  return (
    <div 
      className={`focus-image-container focus-image-container--${isDarkMode ? 'dark' : 'light'}`}
      style={{
        width: `${containerSize.width * 0.25}px`,
        height: containerSize.height - 80, // Adjust for header height
        borderRight: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
      }}
    >
      <div
        className="focus-image"
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${focusArea.dataURL})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          ref={focusCanvasRef}
          onMouseDown={(e) => handleCanvasMouseDown(e, 'focus')}
          onMouseMove={(e) => handleCanvasMouseMove(e, 'focus')}
          onMouseUp={(e) => handleCanvasMouseUp(e, 'focus')}
          onTouchStart={(e) => handleCanvasMouseDown(e, 'focus')}
          onTouchMove={(e) => handleCanvasMouseMove(e, 'focus')}
          onTouchEnd={(e) => handleCanvasMouseUp(e, 'focus')}
          className="focus-canvas"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            cursor: tool === 'hand' ? 'grab' : (
              tool === 'text' ? 'text' : 'crosshair'
            ),
          }}
          scaleX={focusZoom}
          scaleY={focusZoom}
        >
          <Layer>
            {/* Show only focus area drawings */}
            {focusDrawings
              .filter(line => line.canvasType !== 'whiteboard')
              .map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  opacity={line.opacity || 1}
                  globalCompositeOperation={
                    line.tool === 'eraser' ? 'destination-out' : 'source-over'
                  }
                  perfectDrawEnabled={false}
                  listening={false}
                />
              ))}
            
            {/* Show only focus area shapes */}
            {focusShapes
              .filter(shape => shape.canvasType !== 'whiteboard')
              .map(shape => renderShape(shape))}
            
            {/* Temporary shape if in focus area */}
            {tempShape && tempShape.canvasType !== 'whiteboard' && renderShape(tempShape)}
            
            {/* Currently drawing line if in focus area */}
            {currentFocusLine && currentFocusLine.canvasType !== 'whiteboard' && (
              <Line
                points={currentFocusLine.points}
                stroke={currentFocusLine.color}
                strokeWidth={currentFocusLine.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                opacity={currentFocusLine.opacity || 1}
                globalCompositeOperation={
                  currentFocusLine.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
                perfectDrawEnabled={false}
                listening={false}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default FocusImage;