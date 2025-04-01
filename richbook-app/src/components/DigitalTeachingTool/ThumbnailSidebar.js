// src/components/DigitalTeachingTool/ThumbnailSidebar.js
import React from 'react';
import { X } from 'lucide-react';

const ThumbnailSidebar = ({ 
  pages, 
  currentPage, 
  decryptedImages, 
  isLoadingImages, 
  goToPage, 
  setShowThumbnails, 
  isDarkMode 
}) => {
  return (
    <div className={`thumbnails-sidebar thumbnails-sidebar--${isDarkMode ? 'dark' : 'light'}`}>
      <div className="thumbnails-header">
        <span>Pages</span>
        <X 
          size={16} 
          onClick={() => setShowThumbnails(false)} 
          style={{ cursor: 'pointer' }} 
        />
      </div>
      <div className="thumbnails-container">
        {pages.map((page, index) => (
          <div 
            key={page.id} 
            className={`thumbnail-item 
              ${currentPage === index + 1 ? 'thumbnail-item--current' : ''} 
              thumbnail-item--${isDarkMode ? 'dark' : 'light'}`}
            onClick={() => {
              goToPage(index + 1);
              setShowThumbnails(false);
            }}
          >
            {isLoadingImages ? (
              <div className="thumbnail-loading">
                <div className="spinner-small"></div>
              </div>
            ) : (
              <img 
                src={decryptedImages[index + 1] || page.src} 
                alt={`Page ${index + 1}`} 
                className="thumbnail-image"
              />
            )}
            <div className="thumbnail-label">
              Page {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThumbnailSidebar;