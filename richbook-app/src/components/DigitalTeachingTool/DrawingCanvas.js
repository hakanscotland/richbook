// src/components/DigitalTeachingTool/DrawingCanvas.js
import React from 'react';
import { Stage, Layer, Line } from 'react-konva';

const DrawingCanvas = ({ 
  stageRef, 
  dimensions, 
  zoom, 
  tool, 
  isSelectingFocusArea, 
  showCurtain,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  lines,
  currentLine
}) => {
  return (
    <Stage
      width={dimensions.width}
      height={dimensions.height}
      ref={stageRef}
      scale={{ x: zoom, y: zoom }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`drawing-stage 
        ${showCurtain ? 'drawing-stage--above-curtain' : ''}
        ${tool === 'hand' && !isSelectingFocusArea ? 'drawing-stage--hand-tool' : 'drawing-stage--drawing-tool'}
      `}
      style={{ 
        cursor: isSelectingFocusArea ? 'crosshair' : (tool === 'hand' ? 'grab' : 'crosshair'),
        touchAction: 'none', // Dokunmatik kaydırmayı engelle
        msTouchAction: 'none', // IE/Edge için
        WebkitTapHighlightColor: 'rgba(0,0,0,0)', // Dokunmatik vurgulamayı kaldır
        position: 'absolute', // Kesin pozisyon
        top: 0,
        left: 0,
        zIndex: showCurtain ? 750 : 500,
      }}
    >
      <Layer>
        {/* Draw existing lines */}
        {lines.map((line, i) => (
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
            // Modern Konva sürümlerinde bu özellikler farklı olabilir
            // Gerçek konva sürümünüze göre özellikler ayarlanmalıdır
            listening={false} // Performans için
          />
        ))}
        
        {/* Draw current line */}
        {currentLine && (
          <Line
            points={currentLine.points}
            stroke={currentLine.color}
            strokeWidth={currentLine.strokeWidth}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            opacity={currentLine.opacity || 1}
            globalCompositeOperation={
              currentLine.tool === 'eraser' ? 'destination-out' : 'source-over'
            }
            // Modern Konva sürümlerinde bu özellikler farklı olabilir
            listening={false} // Performans için
          />
        )}
      </Layer>
    </Stage>
  );
};

export default DrawingCanvas;