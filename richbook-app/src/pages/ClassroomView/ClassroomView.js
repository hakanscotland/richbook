import React, { useState } from 'react'; // Import useState
import './ClassroomView.css';
import Toolbar from '../../components/Toolbar/Toolbar';
import WriteTools from '../../components/WriteTools/WriteTools';
import ActivitiesPanel from '../../components/Activities/ActivitiesPanel';
import PDFReader from '../../components/PDFReader/PDFReader';
import SettingsPanel from '../../components/Settings/SettingsPanel';
import ComboActivity from '../../components/Activities/ComboActivity/ComboActivity';
import TrueFalseActivity from '../../components/Activities/TrueFalseActivity/TrueFalseActivity';
import MultipleChoiceActivity from '../../components/Activities/MultipleChoiceActivity/MultipleChoiceActivity';
import MatchingActivity from '../../components/Activities/MatchingActivity/MatchingActivity'; // Import MatchingActivity

function ClassroomView() {
  const [selectedTool, setSelectedTool] = useState('pen');
  const [selectedColor, setSelectedColor] = useState('black');
  const [penSize, setPenSize] = useState(2);
  const [selectedActivity, setSelectedActivity] = useState(null); // State for selected activity component

  const handleToolChange = (tool) => {
    setSelectedTool(tool);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleSizeChange = (size) => {
    setPenSize(size);
  };

  const handleActivitySelect = (activityName) => {
    setSelectedActivity(activityName); // Update selected activity state
    console.log(`Activity selected in ClassroomView: ${activityName}`);
  };

  return (
    <div className="classroom-view">
      <header className="classroom-header">
        <h1>RichBook</h1>
      </header>

      <aside className="classroom-sidebar">
        <SettingsPanel />
        <Toolbar />
        <WriteTools
          onToolChange={handleToolChange}
          onColorChange={handleColorChange}
          onSizeChange={handleSizeChange}
        />
        <ActivitiesPanel onActivitySelect={handleActivitySelect} /> {/* Pass handleActivitySelect as prop */}
      </aside>

      <main className="classroom-main-content">
        {selectedActivity === null && ( // Render PDFReader if no activity selected
          <PDFReader
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            penSize={penSize}
          />
        )}
        {selectedActivity === 'Matching' && <MatchingActivity />} {/* Render MatchingActivity */}
        {selectedActivity === 'Combo' && <ComboActivity />} {/* Render ComboActivity */}
        {selectedActivity === 'TrueFalse' && <TrueFalseActivity />} {/* Render TrueFalseActivity */}
        {selectedActivity === 'MultipleChoice' && <MultipleChoiceActivity />} {/* Render MultipleChoiceActivity */}
      </main>

      <footer className="classroom-footer">
        <p>© 2023 RichBook Software</p>
      </footer>
    </div>
  );
}

export default ClassroomView;