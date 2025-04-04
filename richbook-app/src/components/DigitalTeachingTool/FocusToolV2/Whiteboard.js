import React from 'react';
import { Stage, Layer, Line } from 'react-konva';
import './styles.css';

/**
 * Sadeleştirilmiş - Component for the whiteboard drawing area
 */
const Whiteboard = ({
  whiteboardCanvasRef,
  whiteboardSize,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  tool,
  focusDrawings,
  currentFocusLine,
  containerSize
}) => {
  return (
    <div 
      className="whiteboard-container"
      style={{
        width: `${containerSize.width * 0.66}px`, // Match the 2/3 container width
        height: containerSize.height - 80, // Adjust for header height
        backgroundColor: '#ffffff',
        position: 'relative'
      }}
    >
      <Stage
        width={whiteboardSize.width}
        height={whiteboardSize.height}
        ref={whiteboardCanvasRef}
        onMouseDown={(e) => handleCanvasMouseDown(e, 'whiteboard')}
        onMouseMove={(e) => handleCanvasMouseMove(e, 'whiteboard')}
        onMouseUp={(e) => handleCanvasMouseUp(e, 'whiteboard')}
        onTouchStart={(e) => handleCanvasMouseDown(e, 'whiteboard')}
        onTouchMove={(e) => handleCanvasMouseMove(e, 'whiteboard')}
        onTouchEnd={(e) => handleCanvasMouseUp(e, 'whiteboard')}
        className="whiteboard-canvas"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: tool === 'hand' ? 'grab' : 'crosshair',
        }}
      >
        <Layer>
          {/* Çizim satırları */}
          {focusDrawings
            .filter(line => line.canvasType === 'whiteboard')
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
          
          {/* Güncel çizgi */}
          {currentFocusLine && currentFocusLine.canvasType === 'whiteboard' && (
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
  );
};

export default Whiteboard;