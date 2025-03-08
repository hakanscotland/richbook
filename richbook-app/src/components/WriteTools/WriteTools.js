import React, { useState } from 'react';
import './WriteTools.css';

function WriteTools({ onToolChange, onColorChange, onSizeChange }) { // Add prop functions
  const [selectedTool, setSelectedTool] = useState('pen');
  const [selectedColor, setSelectedColor] = useState('black');
  const [penSize, setPenSize] = useState(2);

  const tools = ['pen', 'highlighter', 'eraser', 'line', 'circle', 'rectangle', 'text'];
  const colors = ['black', 'red', 'blue', 'green', 'yellow', 'white'];

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    onToolChange(tool); // Call prop function to notify parent component
    console.log(`Tool selected: ${tool}`);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    onColorChange(color); // Call prop function
    console.log(`Color selected: ${color}`);
  };

  const handlePenSizeChange = (event) => {
    const size = parseInt(event.target.value, 10);
    setPenSize(size);
    onSizeChange(size); // Call prop function
    console.log(`Pen size changed: ${size}`);
  };

  return (
    <div className="write-tools">
      <h3>Write Tools</h3>

      <div className="tools-container">
        {tools.map((tool) => (
          <button
            key={tool}
            className={`tool-button ${selectedTool === tool ? 'active' : ''}`}
            onClick={() => handleToolSelect(tool)}
            title={tool.charAt(0).toUpperCase() + tool.slice(1)}
          >
            {tool.charAt(0).toUpperCase()}
          </button>
        ))}
      </div>

      <div className="colors-container">
        {colors.map((color) => (
          <button
            key={color}
            className={`color-button ${selectedColor === color ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorSelect(color)}
            title={`Color: ${color.charAt(0).toUpperCase() + color.slice(1)}`}
          ></button>
        ))}
      </div>

      <div className="size-control">
        <label htmlFor="penSize">Pen Size:</label>
        <input
          type="range"
          id="penSize"
          min="1"
          max="10"
          value={penSize}
          onChange={handlePenSizeChange}
        />
        <span>{penSize}</span>
      </div>

      <div className="actions-container">
        <button className="action-button">Undo</button>
        <button className="action-button">Redo</button>
        <button className="action-button">Clear</button>
      </div>
    </div>
  );
}

export default WriteTools;