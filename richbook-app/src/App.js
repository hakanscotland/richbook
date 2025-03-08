import React from 'react';
import ClassroomView from './pages/ClassroomView/ClassroomView';
import './App.css'; // Import global App styles if needed

function App() {
  return (
    <div className="app-container"> {/* Optional container class for App */}
      <ClassroomView />
    </div>
  );
}

export default App;