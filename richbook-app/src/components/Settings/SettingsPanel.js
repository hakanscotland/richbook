import React, { useState } from 'react';
import './SettingsPanel.css';

function SettingsPanel() {
  const [displayedPages, setDisplayedPages] = useState('one'); // Default: One page displayed
  const [showTooltipText, setShowTooltipText] = useState(true); // Default: Tooltips are shown

  const handleDisplayedPagesChange = (event) => {
    setDisplayedPages(event.target.value);
    console.log(`Displayed pages setting changed to: ${event.target.value}`); // For debugging
  };

  const handleShowTooltipTextChange = (event) => {
    setShowTooltipText(event.target.checked);
    console.log(`Show tooltip text setting changed to: ${event.target.checked}`); // For debugging
  };

  const handleApplySettings = () => {
    // In a real application, you would apply the settings here.
    // For now, settings are applied directly as state changes.
    console.log('Settings Applied:', { displayedPages, showTooltipText });
    alert('Settings Applied (check console for details)'); // Simple feedback for now
  };

  return (
    <div className="settings-panel">
      <h3>Settings</h3>

      <div className="settings-group">
        <h4>Nr. of Displayed Pages</h4>
        <label>
          <input
            type="radio"
            name="displayedPages"
            value="half"
            checked={displayedPages === 'half'}
            onChange={handleDisplayedPagesChange}
          />
          Half
        </label>
        <label>
          <input
            type="radio"
            name="displayedPages"
            value="one"
            checked={displayedPages === 'one'}
            onChange={handleDisplayedPagesChange}
          />
          One
        </label>
        <label>
          <input
            type="radio"
            name="displayedPages"
            value="two"
            checked={displayedPages === 'two'}
            onChange={handleDisplayedPagesChange}
          />
          Two
        </label>
      </div>

      <div className="settings-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showTooltipText}
            onChange={handleShowTooltipTextChange}
          />
          Show tooltip text.
        </label>
      </div>

      <div className="settings-actions">
        <button onClick={handleApplySettings}>Apply</button>
      </div>

      {/* Preview Section (Placeholder - you can expand this later) */}
      <div className="settings-preview">
        <h4>Preview</h4>
        <div className="preview-area">
          {/* You could add a visual preview of page layout here based on settings */}
          <div className={`preview-page ${displayedPages === 'one' ? 'one-page' : (displayedPages === 'two' ? 'two-page' : 'half-page')}`}></div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;