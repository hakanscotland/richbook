// src/services/AnnotationService.js

const ANNOTATION_STORAGE_KEY = 'richbook_annotations';

const AnnotationService = {
  saveAnnotations: (pageNumber, annotationsData) => {
    try {
      const existingAnnotations = AnnotationService.loadAnnotations() || {};
      existingAnnotations[pageNumber] = annotationsData;
      localStorage.setItem(ANNOTATION_STORAGE_KEY, JSON.stringify(existingAnnotations));
      console.log(`Annotations saved for page ${pageNumber}`);
    } catch (error) {
      console.error('Error saving annotations:', error);
    }
  },

  loadAnnotations: () => {
    try {
      const storedAnnotations = localStorage.getItem(ANNOTATION_STORAGE_KEY);
      return storedAnnotations ? JSON.parse(storedAnnotations) : null;
    } catch (error) {
      console.error('Error loading annotations:', error);
      return null;
    }
  },

  getPageAnnotations: (pageNumber) => {
    const allAnnotations = AnnotationService.loadAnnotations();
    return allAnnotations ? allAnnotations[pageNumber] : null;
  },

  clearAnnotationsForPage: (pageNumber) => {
    try {
      const existingAnnotations = AnnotationService.loadAnnotations() || {};
      delete existingAnnotations[pageNumber];
      localStorage.setItem(ANNOTATION_STORAGE_KEY, JSON.stringify(existingAnnotations));
      console.log(`Annotations cleared for page ${pageNumber}`);
    } catch (error) {
      console.error('Error clearing annotations:', error);
    }
  },

  clearAllAnnotations: () => {
    try {
      localStorage.removeItem(ANNOTATION_STORAGE_KEY);
      console.log('All annotations cleared.');
    } catch (error) {
      console.error('Error clearing all annotations:', error);
    }
  },
};

export default AnnotationService;