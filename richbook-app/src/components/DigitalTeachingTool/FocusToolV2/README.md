# Focus Tool V2

A redesigned Focus Tool component for the Digital Teaching Tool. This tool allows teachers to capture any area of the screen and display it in a popup window for focused explanation, combined with a whiteboard area for annotations.

## Key Features

- Captures any part of the screen and displays it 20% larger in the upper-left portion of the popup
- Provides a large whiteboard area (taking 3/4 of the space) for additional explanations
- Drawing tools for both the captured image and whiteboard area
- Support for freehand drawing, shapes (rectangle, ellipse, line), and text
- Color and thickness controls
- Zoom in/out capabilities for the captured area
- Dark mode support
- Ability to save the combined image

## File Structure

```
FocusToolV2/
├── index.js             # Main export file
├── FocusArea.js         # Main component that integrates all the pieces
├── FocusImage.js        # Component for the captured image area
├── hooks.js             # Custom React hooks for various functionalities
├── README.md            # Documentation
├── styles.css           # Styling for all components
├── ToolHeader.js        # Header with tools and controls
├── ToolOptions.js       # Tool options panel (color, thickness)
├── utils.js             # Utility functions
└── Whiteboard.js        # Component for the whiteboard area
```

## Component Hierarchy

- **FocusArea**: Main container component
  - **ToolHeader**: Header with drawing tools and controls
  - **FocusImage**: Captured screenshot with annotation capabilities
  - **Whiteboard**: Drawing area for explanations
  - **ToolOptions**: Panel for tool-specific settings

## Usage

```jsx
import FocusArea from './components/DigitalTeachingTool/FocusToolV2';

// Within your component:
<FocusArea
  focusArea={focusArea}
  setFocusArea={setFocusArea}
  isFocusMode={isFocusMode}
  setIsFocusMode={setIsFocusMode}
  tool={tool}
  setTool={setTool}
  color={color}
  setColor={setColor}
  strokeWidth={strokeWidth}
  setStrokeWidth={setStrokeWidth}
  opacity={opacity}
  setOpacity={setOpacity}
  isDarkMode={isDarkMode}
/>
```

## Props

- `focusArea`: Object containing the captured area info (dataURL, dimensions)
- `setFocusArea`: Function to update the focus area
- `isFocusMode`: Boolean indicating if focus mode is active
- `setIsFocusMode`: Function to toggle focus mode
- `tool`: Currently selected drawing tool
- `setTool`: Function to change the selected tool
- `color`: Current drawing color
- `setColor`: Function to change the drawing color
- `strokeWidth`: Current stroke width for drawing
- `setStrokeWidth`: Function to change the stroke width
- `opacity`: Current opacity for drawing
- `setOpacity`: Function to change the opacity
- `isDarkMode`: Boolean for dark mode

## Implementation Details

1. The tool displays captured screenshots 20% larger than original size
2. Layout: 1/4 of the width for the screenshot, 3/4 for the whiteboard
3. All drawings (on both screenshot and whiteboard) share the same state
4. Tool settings (color, thickness) apply to both areas
5. Keyboard shortcuts: Escape to close, +/- to zoom, Delete to remove selected shapes