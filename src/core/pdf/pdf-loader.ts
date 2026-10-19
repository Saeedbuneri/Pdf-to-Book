import * as pdfjsLib from 'pdfjs-dist';
// Vite URL import bundles the worker locally and offline!
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface PdfDocumentMetadata {
  title?: string;
  author?: string;
  totalPages: number;
  outline: PdfOutlineItem[];
}

export interface PdfOutlineItem {
  title: string;
  dest: any; // PDF destination reference
  pageIndex?: number;
  items?: PdfOutlineItem[];
}

export async function loadPdfDocument(source: ArrayBuffer | Blob): Promise<pdfjsLib.PDFDocumentProxy> {
  const data = source instanceof Blob ? await source.arrayBuffer() : source;
  const loadingTask = pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
    cMapUrl: 'https://unpkg.com/pdfjs-dist@6.4.299/cmaps/',
    cMapPacked: true,
  });
  return await loadingTask.promise;
}

export async function extractPdfMetadata(doc: pdfjsLib.PDFDocumentProxy): Promise<PdfDocumentMetadata> {
  let meta: any = null;
  try {
    meta = await doc.getMetadata();
  } catch {
    // Ignore metadata read failure
  }

  let outline: any[] = [];
  try {
    outline = (await doc.getOutline()) || [];
  } catch {
    // Ignore outline read failure
  }

  const title = meta?.info?.Title || undefined;
  const author = meta?.info?.Author || undefined;

  // Resolve outline page numbers where possible
  const resolvedOutline: PdfOutlineItem[] = [];
  for (const item of outline) {
    const resolved = await resolveOutlineItem(doc, item);
    resolvedOutline.push(resolved);
  }

  return {
    title,
    author,
    totalPages: doc.numPages,
    outline: resolvedOutline,
  };
}

async function resolveOutlineItem(doc: pdfjsLib.PDFDocumentProxy, item: any): Promise<PdfOutlineItem> {
  let pageIndex: number | undefined;
  if (item.dest) {
    try {
      let dest = item.dest;
      if (typeof dest === 'string') {
        dest = await doc.getDestination(dest);
      }
      if (Array.isArray(dest) && dest[0]) {
        const ref = dest[0];
        pageIndex = await doc.getPageIndex(ref);
      }
    } catch {
      // Destination resolution fallback
    }
  }

  const children: PdfOutlineItem[] = [];
  if (item.items && Array.isArray(item.items)) {
    for (const sub of item.items) {
      children.push(await resolveOutlineItem(doc, sub));
    }
  }

  return {
    title: item.title,
    dest: item.dest,
    pageIndex: pageIndex !== undefined ? pageIndex + 1 : undefined,
    items: children.length > 0 ? children : undefined,
  };
}

export interface CancellableRenderTask {
  promise: Promise<void>;
  cancel: () => void;
}

export function renderPdfPageToCanvas(
  doc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number = 1.5
): CancellableRenderTask {
  let isCancelled = false;
  let activeRenderTask: any = null;

  const promise = (async () => {
    const page = await doc.getPage(pageNumber);
    if (isCancelled) return;
    const viewport = page.getViewport({ scale });

    const context = canvas.getContext('2d');
    if (!context || isCancelled) return;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };

    activeRenderTask = page.render(renderContext);
    await activeRenderTask.promise;
  })();

  return {
    promise,
    cancel: () => {
      isCancelled = true;
      if (activeRenderTask) {
        try {
          activeRenderTask.cancel();
        } catch {
          // Ignore cancellation errors
        }
      }
    },
  };
}
