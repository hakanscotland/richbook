import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

import './PDFReader.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = `pdf.worker.mjs`; // Relative path to public folder

function PDFReader({ selectedTool, selectedColor, penSize }) { // Receive props
  const canvasRef = useRef(null);
  const annotationCanvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('sample.pdf');

  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const annotationContextRef = useRef(null); // Ref to annotation context

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdfDocument = await loadingTask.promise;
        setPdfDoc(pdfDocument);
        setNumPages(pdfDocument.numPages);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };
    loadPdf();
  }, [pdfUrl]);

  const renderPage = useCallback(async (num) => {
    if (!pdfDoc) return;
    try {
      const page = await pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      const canvasContext = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext,
        viewport,
      };
      const renderTask = page.render(renderContext);
      await renderTask.promise;

      const annotationCanvas = annotationCanvasRef.current;
      const annotationContext = annotationCanvas.getContext('2d');
      annotationContext.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);
      annotationCanvas.width = viewport.width;
      annotationCanvas.height = viewport.height;
      annotationContextRef.current = annotationContext; // Store context in ref

      page.cleanup();
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  }, [pdfDoc]);

  useEffect(() => {
    renderPage(pageNumber);
  }, [pageNumber, renderPage]);

  useEffect(() => {
    const annotationCanvas = annotationCanvasRef.current;
    const context = annotationCanvas.getContext('2d');
    annotationContextRef.current = context; // Initialize context ref here as well

    const handleMouseDown = (e) => {
      setIsDrawing(true);
      const rect = annotationCanvas.getBoundingClientRect();
      setLastPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseMove = (e) => {
      if (!isDrawing) return;
      const context = annotationContextRef.current;
      if (!context) return; // Ensure context is available

      context.strokeStyle = selectedColor;
      context.lineWidth = penSize;
      context.lineJoin = 'round';
      context.lineCap = 'round';

      const rect = annotationCanvas.getBoundingClientRect();
      const currentPosition = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      context.beginPath();
      context.moveTo(lastPosition.x, lastPosition.y);
      context.lineTo(currentPosition.x, currentPosition.y);
      context.closePath();
      context.stroke();

      setLastPosition(currentPosition);
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
      setLastPosition(null);
    };

    annotationCanvas.addEventListener('mousedown', handleMouseDown);
    annotationCanvas.addEventListener('mousemove', handleMouseMove);
    annotationCanvas.addEventListener('mouseup', handleMouseUp);
    annotationCanvas.addEventListener('mouseleave', handleMouseUp); // End drawing if mouse leaves canvas

    return () => {
      annotationCanvas.removeEventListener('mousedown', handleMouseDown);
      annotationCanvas.removeEventListener('mousemove', handleMouseMove);
      annotationCanvas.removeEventListener('mouseup', handleMouseUp);
      annotationCanvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [selectedColor, penSize, isDrawing, lastPosition, annotationContextRef]); // Dependencies for useEffect

  const goToPreviousPage = () => {
    setPageNumber(pageNumber > 1 ? pageNumber - 1 : 1);
  };

  const goToNextPage = () => {
    setPageNumber(pageNumber < numPages ? pageNumber + 1 : numPages);
  };

  return (
    <div className="pdf-reader">
      <div className="pdf-container">
        <canvas ref={canvasRef} className="pdf-canvas" />
        <canvas ref={annotationCanvasRef} className="annotation-canvas" />
      </div>

      <div className="page-navigation">
        <button onClick={goToPreviousPage} disabled={pageNumber <= 1}>
          Previous
        </button>
        <span>
          Page {pageNumber} / {numPages}
        </span>
        <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default PDFReader;