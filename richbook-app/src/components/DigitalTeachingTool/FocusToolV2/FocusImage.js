import React from 'react';
import { Stage, Layer, Line } from 'react-konva';
import './styles.css';

/**
 * Sadeleştirilmiş - Component for displaying and interacting with the focus area image
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
  currentFocusLine,
  isDarkMode,
  containerSize
}) => {
  // Hesapla: görüntü boyutlarını container boyutlarına sığdır
  const imageStyle = React.useMemo(() => {
    if (!focusArea) return {};
    
    // Görüntü oranları
    const imageWidth = focusArea.originalWidth;
    const imageHeight = focusArea.originalHeight;
    const containerWidth = containerSize.width * 0.33 - 20; // padding için -20px
    const containerHeight = containerSize.height - 100; // header ve footer 
    
    // En-boy oranını koru
    const imageRatio = imageWidth / imageHeight;
    
    // Container sınırlarına göre boyutlandır
    let width = imageWidth;
    let height = imageHeight;
    
    if (width > containerWidth) {
      width = containerWidth;
      height = width / imageRatio;
    }
    
    if (height > containerHeight) {
      height = containerHeight;
      width = height * imageRatio;
    }
    
    return {
      width: '100%',
      height: '100%',
      backgroundSize: 'contain', // Görüntüyü sığdır
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
  }, [focusArea, containerSize]);
  
  return (
    <div 
      className={`focus-image-container focus-image-container--${isDarkMode ? 'dark' : 'light'}`}
      style={{
        width: `${containerSize.width * 0.33}px`, // 1/3 of container width
        height: containerSize.height - 80, // Adjust for header height
        borderRight: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        padding: '10px'
      }}
    >
      <div
        className="focus-image"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {/* Görüntü arkaplanı */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${focusArea.dataURL})`,
            backgroundSize: 'contain',  // Görüntüyü kırpmadan sığdır
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
          }}
        />
        
        {/* Çizim katmanı */}
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
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
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
            
            {/* Güncel çizgi */}
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