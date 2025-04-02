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
    <div className="page-container" style={{position: 'absolute', inset: 0, zIndex: 100}}>
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
                src={decryptedImages[currentPage] || (pages[currentPage - 1] && pages[currentPage - 1].src)} 
                alt={`Page ${currentPage}`}
                className={`page-image ${isHalfPageView ? 'page-image--half' : ''}`}
                style={{
                  maxHeight: '90vh',
                  maxWidth: '90vw',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  objectPosition: 'center'
                }}
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
                src={decryptedImages[currentPage + 1] || (pages[currentPage] && pages[currentPage].src)} 
                alt={`Page ${currentPage + 1}`}
                className={`page-image ${isHalfPageView ? 'page-image--half' : ''}`}
                style={{
                  maxHeight: '90vh',
                  maxWidth: '90vw',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  objectPosition: 'center'
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageRenderer;