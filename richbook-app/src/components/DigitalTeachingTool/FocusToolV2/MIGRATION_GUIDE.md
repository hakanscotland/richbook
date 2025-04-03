# Migration Guide: Focus Tool V1 to V2

This guide explains how to migrate from the original Focus Tool implementation to the new version. The new Focus Tool (V2) has been completely redesigned with a modular architecture for better maintainability, performance, and features.

## Key Improvements in V2

1. **Modular Code Structure**: Split into multiple focused components
2. **Enhanced Layout**: Modified to display focus area at 20% larger size in the top-left with 3/4 of space allocated to whiteboard
3. **Better State Management**: Improved with custom hooks for better separation of concerns
4. **Performance Optimizations**: Reduced unnecessary re-renders
5. **Extensibility**: Easier to add new features

## Migration Steps

### 1. Add the New Implementation

The new implementation is entirely contained within the `FocusToolV2` directory. You can keep both implementations side by side during the transition period.

### 2. Update Imports

Change your imports from:

```javascript
import FocusArea from '../components/DigitalTeachingTool/FocusArea';
```

To:

```javascript
import FocusArea from '../components/DigitalTeachingTool/FocusToolV2';
```

### 3. Interface Changes

The component interface (props) remains the same for compatibility, so no changes are needed to how you call the component:

```jsx
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

### 4. CSS Handling

The new implementation contains all its CSS within the `styles.css` file in the FocusToolV2 directory. If you've made customizations to the original CSS, you'll need to:

1. Identify your custom CSS in the original `FocusArea.css`
2. Apply similar customizations to the new `styles.css`

### 5. Testing

Before fully migrating, test the new implementation thoroughly:

1. Test all drawing tools (pen, highlighter, eraser)
2. Test all shape tools (rectangle, ellipse, line, text)
3. Test color and stroke width options
4. Test zoom in/out functionality
5. Test saving the focus area
6. Test in both light and dark modes

### 6. Potential Issues and Solutions

1. **Issue**: Captured area not displaying correctly
   **Solution**: Ensure the `focusArea` object includes `dataURL`, `originalWidth`, and `originalHeight` properties

2. **Issue**: Drawing not working on focus area or whiteboard
   **Solution**: Check the event handling and stage references in your implementation

3. **Issue**: Tools not behaving as expected
   **Solution**: Ensure your tool state is properly managed and passed to the FocusArea component

### 7. Clean Up (After Successful Migration)

Once you've verified the new implementation works correctly in all scenarios:

1. Remove the old implementation files
2. Remove any references to the old implementation in your code
3. Update documentation to reflect the new implementation

## Example Integration

See the `integration-example.js` file for a complete example of how to integrate the new Focus Tool into your application.

## Support

If you encounter any issues during migration, please:

1. Check the README.md for detailed component documentation
2. Compare your implementation with the integration example
3. Review the component files for insight into how they work