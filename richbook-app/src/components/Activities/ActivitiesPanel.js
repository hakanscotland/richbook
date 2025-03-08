import React from 'react';
import './ActivitiesPanel.css';

function ActivitiesPanel() {
  const activityTypes = [
    { name: 'Matching', description: 'Matching Activities' },
    { name: 'Combo', description: 'Combo-box Activities' },
    { name: 'TrueFalse', description: 'True / False Quiz' },
    { name: 'MultipleChoice', description: 'Multiple Choice Quiz' },
    // You can add more activity types here in the future
  ];

  const handleActivitySelect = (activityName) => {
    console.log(`Activity selected: ${activityName}`);
    // In a real application, you would handle launching or displaying the selected activity here.
    // For example, you might update the main content area to show the selected activity component.
  };

  return (
    <div className="activities-panel">
      <h3>Activities Panel</h3>
      <ul className="activity-list">
        {activityTypes.map((activity, index) => (
          <li key={index} className="activity-item">
            <button
              className="activity-button"
              onClick={() => handleActivitySelect(activity.name)}
              title={`Launch ${activity.description}`} // Tooltip
            >
              {activity.description}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ActivitiesPanel;