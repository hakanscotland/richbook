// SettingsMenu.js - Dedicated settings component for the digital teaching tool
import React from 'react';

const SettingsMenu = ({ 
  isDarkMode, 
  setIsDarkMode, 
  isDoublePageView,
  setIsDoublePageView,
  isHalfPageView,
  setIsHalfPageView,
  showTooltips,
  setShowTooltips,
  autoFadeToolbar,
  setAutoFadeToolbar,
  onClose
}) => {
  const menuStyle = {
    position: 'absolute',
    right: '20px',
    top: '20px',
    backgroundColor: isDarkMode ? '#1f2937' : 'white',
    color: isDarkMode ? '#f9fafb' : '#1f2937',
    borderRadius: '0.5rem',
    padding: '1rem',
    width: '280px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    zIndex: 1100
  };

  const titleStyle = {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
    paddingBottom: '0.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const sectionStyle = {
    marginBottom: '1rem'
  };

  const sectionTitleStyle = {
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    fontSize: '0.9rem'
  };

  const optionStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5rem',
    cursor: 'pointer'
  };

  const radioStyle = (isChecked) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: isDarkMode ? '1px solid #9ca3af' : '1px solid #6b7280',
    marginRight: '0.75rem',
    position: 'relative',
    backgroundColor: isChecked ? '#3b82f6' : 'transparent'
  });

  const radioInnerStyle = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'white'
  };

  const switchContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer'
  };

  const switchTrackStyle = (isActive) => ({
    position: 'relative',
    width: '36px',
    height: '20px',
    backgroundColor: isActive ? '#3b82f6' : isDarkMode ? '#4b5563' : '#d1d5db',
    borderRadius: '10px',
    transition: 'background-color 0.2s'
  });

  const switchThumbStyle = (isActive) => ({
    position: 'absolute',
    top: '2px',
    left: isActive ? '18px' : '2px',
    width: '16px',
    height: '16px',
    backgroundColor: 'white',
    borderRadius: '50%',
    transition: 'left 0.2s'
  });

  return (
    <div style={menuStyle}>
      <div style={titleStyle}>
        <span>Settings</span>
        <span style={{ cursor: 'pointer' }} onClick={onClose}>✕</span>
      </div>

      {/* Page View Options */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Page View</div>
        
        <div 
          style={optionStyle}
          onClick={() => {
            setIsDoublePageView(false);
            setIsHalfPageView(false);
          }}
        >
          <div style={radioStyle(!isDoublePageView && !isHalfPageView)}>
            {!isDoublePageView && !isHalfPageView && <div style={radioInnerStyle} />}
          </div>
          <span>Single Page View</span>
        </div>
        
        <div 
          style={optionStyle}
          onClick={() => {
            setIsDoublePageView(true);
            setIsHalfPageView(false);
          }}
        >
          <div style={radioStyle(isDoublePageView && !isHalfPageView)}>
            {isDoublePageView && !isHalfPageView && <div style={radioInnerStyle} />}
          </div>
          <span>Double Page View</span>
        </div>
        
        <div 
          style={optionStyle}
          onClick={() => {
            setIsDoublePageView(false);
            setIsHalfPageView(true);
          }}
        >
          <div style={radioStyle(!isDoublePageView && isHalfPageView)}>
            {!isDoublePageView && isHalfPageView && <div style={radioInnerStyle} />}
          </div>
          <span>Half Page View</span>
        </div>
      </div>

      {/* Theme Settings */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Appearance</div>
        
        <div style={switchContainerStyle} onClick={() => setIsDarkMode(!isDarkMode)}>
          <span>Dark Mode</span>
          <div style={switchTrackStyle(isDarkMode)}>
            <div style={switchThumbStyle(isDarkMode)} />
          </div>
        </div>

        <div style={{...switchContainerStyle, marginTop: '10px'}} onClick={() => {
          console.log('Current tooltip state:', showTooltips);
          setShowTooltips(!showTooltips);
          console.log('New tooltip state will be:', !showTooltips);
        }}>
          <span>Show Tooltip Text</span>
          <div style={switchTrackStyle(showTooltips)}>
            <div style={switchThumbStyle(showTooltips)} />
          </div>
        </div>

        <div style={{...switchContainerStyle, marginTop: '10px'}} onClick={() => setAutoFadeToolbar(!autoFadeToolbar)}>
          <span>Auto-Fade Toolbar</span>
          <div style={switchTrackStyle(autoFadeToolbar)}>
            <div style={switchThumbStyle(autoFadeToolbar)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;