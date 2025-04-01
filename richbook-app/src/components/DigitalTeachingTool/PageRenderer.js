// src/components/DigitalTeachingTool/PageRenderer.js
import React from 'react';

const PageRenderer = ({ 
  currentPage, 
  pages, 
  decryptedImages, 
  isLoadingImages, 
  zoom, 
  isDoublePageView, 
  isHalfPageView 
}) => {
  return (
    <div className="page-container">
      <div className="page-scaling" style={{ transform: `scale(${zoom})` }}>
        {/* Current page display */}
        {currentPage <= pages.length && (
          <div>
            {isLoadingImages ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Sayfa yükleniyor...</p>
              </div>
            ) : (
              <img 
                src={decryptedImages[currentPage] || pages[currentPage - 1]?.src} 
                alt={`Page ${currentPage}`}
                className={`page-image ${isHalfPageView ? 'page-image--half' : ''}`}
              />
            )}
          </div>
        )}
        
        {/* Second page in double view */}
        {isDoublePageView && currentPage + 1 <= pages.length && (
          <div>
            {isLoadingImages ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Sayfa yükleniyor...</p>
              </div>
            ) : (
              <img 
                src={decryptedImages[currentPage + 1] || pages[currentPage]?.src} 
                alt={`Page ${currentPage + 1}`}
                className={`page-image ${isHalfPageView ? 'page-image--half' : ''}`}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageRenderer;