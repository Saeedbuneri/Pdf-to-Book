import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileUp, AlertCircle, CheckCircle2, ArrowRight, Loader2, X } from 'lucide-react';
import { loadPdfDocument } from '../../core/pdf/pdf-loader';
import { PdfBookAnalyzer, type ExtractionProgress } from '../../core/pdf/analyzer';
import { saveBook, deleteBookAndData } from '../../storage/book-store';
import type { BookRecord } from '../../types/book';

interface ImportZoneProps {
  onImportComplete: (bookId: string) => void;
  onStartReadingImmediately?: (bookId: string) => void;
}

export const ImportZone: React.FC<ImportZoneProps> = ({
  onImportComplete,
  onStartReadingImmediately,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ExtractionProgress | null>(null);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScannedPdf, setIsScannedPdf] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  // FIX #14: Keep a ref to the analyzer so we can cancel it
  const analyzerRef = useRef<PdfBookAnalyzer | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // FIX #14: Cancel handler
  const handleCancel = useCallback(() => {
    analyzerRef.current?.cancel();
    analyzerRef.current = null;
    setIsProcessing(false);
    setProgress(null);
    setCurrentBookId(null);
  }, []);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF document (.pdf).');
      return;
    }

    setErrorMsg(null);
    setIsScannedPdf(false);
    setIsProcessing(true);

    const bookId = 'book_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    setCurrentBookId(bookId);

    try {
      const pdfDoc = await loadPdfDocument(file);
      const totalPages = pdfDoc.numPages;

      const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');

      // FIX #2: Don't include pdfBlob in the initial record — storeBookBlob was a redundant
      // second write of the same blob. Store the blob once here in the initial saveBook call.
      const newBook: BookRecord = {
        id: bookId,
        title: cleanTitle,
        originalFileName: file.name,
        fileSize: file.size,
        pageCount: totalPages,
        genre: 'general',
        storageStatus: 'available',
        processingStatus: 'processing',
        lastProcessedPage: 0,
        extractionVersion: 1,
        createdAt: Date.now(),
        pdfBlob: file,
      };

      await saveBook(newBook);
      // storeBookBlob removed — pdfBlob is already persisted via saveBook above

      const analyzer = new PdfBookAnalyzer();
      analyzerRef.current = analyzer;

      const result = await analyzer.analyzeBook(pdfDoc, newBook, p => {
        setProgress(p);
      });

      analyzerRef.current = null;

      if (result.isScanned) {
        setIsScannedPdf(true);
        setIsProcessing(false);
        await deleteBookAndData(bookId);
        return;
      }

      setIsProcessing(false);
      onImportComplete(bookId);
    } catch (err: any) {
      // If cancelled intentionally, don't show an error
      if (analyzerRef.current === null && !err?.message) return;

      console.error('Failed to parse PDF:', err);
      setErrorMsg(
        err.name === 'PasswordException'
          ? 'This PDF is password-protected. Please unlock it before importing.'
          : 'Unable to parse this PDF. The document may be corrupted or in an unsupported format.'
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="my-8">
      {/* Upload Drop Area */}
      {!isProcessing && !isScannedPdf && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
            isDragging
              ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
              : 'border-neutral-800 bg-neutral-900/30 hover:border-indigo-500/50 hover:bg-neutral-900/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4 transition-transform hover:scale-110">
            <UploadCloud className="h-7 w-7" />
          </div>

          <h3 className="text-base font-semibold text-white">
            Import a PDF Book into Your Local Reading Space
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
            Drag and drop your PDF here, or click to browse. Processing is 100% local on your PC—no file is ever uploaded.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-neutral-800/80 px-4 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-750 transition-colors">
            <FileUp className="h-4 w-4 text-indigo-400" />
            <span>Select PDF from Computer</span>
          </div>

          {errorMsg && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-rose-400 bg-rose-500/10 py-2 px-3 rounded-lg max-w-md mx-auto border border-rose-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* Live Processing Card */}
      {isProcessing && (
        <div className="rounded-3xl border border-indigo-500/30 bg-neutral-900/90 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 animate-spin">
                <Loader2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">Analyzing Book Structure</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {progress?.statusText || 'Parsing PDF metadata and preparing extraction...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-indigo-400">
                {progress?.percentage || 5}%
              </span>
              {/* FIX #14: Cancel button */}
              <button
                onClick={handleCancel}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Cancel import"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 transition-all duration-300"
              style={{ width: `${progress?.percentage || 5}%` }}
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-400">
            <div>
              Extracted Page{' '}
              <span className="font-semibold text-white">{progress?.currentPage || 0}</span> of{' '}
              <span className="font-semibold text-white">{progress?.totalPages || '...'}</span>
            </div>

            {progress?.firstChapterReady && currentBookId && onStartReadingImmediately && (
              <button
                onClick={() => onStartReadingImmediately(currentBookId)}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-md"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>First Chapter Ready — Start Reading Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Scanned PDF Warning Card */}
      {isScannedPdf && (
        <div className="rounded-3xl border border-amber-500/30 bg-neutral-900/90 p-6 shadow-2xl text-left">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-white">Scanned PDF Detected (OCR Needed)</h4>
              <p className="mt-1 text-sm text-neutral-300 leading-relaxed">
                This PDF contains scanned images of pages rather than selectable digital text. Smart Book Reader's initial version is optimized for text-based PDFs to ensure high fidelity and predictable reading.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => setIsScannedPdf(false)}
                  className="rounded-lg bg-neutral-800 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-700 transition-colors"
                >
                  Import Another PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
