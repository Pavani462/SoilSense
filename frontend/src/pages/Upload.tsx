import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowRight,
  Info,
  Loader2,
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import type { SoilInput } from '../services/api';

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createWorker } from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const keys = [
  'N',
  'P',
  'K',
  'pH',
  'EC',
  'OC',
  'S',
  'Zn',
  'Fe',
  'Cu',
  'Mn',
  'B',
] as const;

type SoilKey = typeof keys[number];

const defaults: SoilInput = {
  N: 0,
  P: 0,
  K: 0,
  pH: 0,
  EC: 0,
  OC: 0,
  S: 0,
  Zn: 0,
  Fe: 0,
  Cu: 0,
  Mn: 0,
  B: 0,

  // Required by your crop model.
  temperature: 25,
  humidity: 80,
  rainfall: 200,
};

type FoundValues = Partial<Record<SoilKey, number>>;

/* =========================================================
   TEXT NORMALIZATION
========================================================= */

function normalizeText(text: string): string {
  return text
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n')
    .trim();
}

/* =========================================================
   VALUE EXTRACTION
========================================================= */

function extractValues(text: string): FoundValues {
  const found: FoundValues = {};

  const normalized = normalizeText(text);

  /*
   Each parameter has several possible names because
   laboratory reports don't necessarily use exactly "N:"
   */

  const patterns: Record<SoilKey, RegExp[]> = {
    N: [
      /(?:^|\n|\b)N\s*(?:\(.*?\))?\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
      /nitrogen(?:\s*\(N\))?\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
    ],

    P: [
      /(?:^|\n|\b)P\s*(?:\(.*?\))?\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
      /phosphorus(?:\s*\(P\))?\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
    ],

    K: [
      /(?:^|\n|\b)K\s*(?:\(.*?\))?\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
      /potassium(?:\s*\(K\))?\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
    ],

    pH: [
      /\bpH\b\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
      /soil\s*pH\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
    ],

    EC: [
      /\bEC\b\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
      /electrical\s+conductivity\s*(?:\(EC\))?\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
    ],

    OC: [
      /\bOC\b\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
      /organic\s+carbon\s*(?:\(OC\))?\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
    ],

    S: [
      /(?:^|\n|\b)S\s*(?:\(.*?\))?\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
      /sulphur(?:\s*\(S\))?\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
      /sulfur(?:\s*\(S\))?\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
    ],

    Zn: [
      /\bZn\b\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
      /zinc(?:\s*\(Zn\))?\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
    ],

    Fe: [
      /\bFe\b\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
      /iron(?:\s*\(Fe\))?\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
    ],

    Cu: [
      /\bCu\b\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
      /copper(?:\s*\(Cu\))?\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
    ],

    Mn: [
      /\bMn\b\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
      /manganese(?:\s*\(Mn\))?\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
    ],

    B: [
      /(?:^|\n|\b)B\s*(?:\(.*?\))?\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
      /boron(?:\s*\(B\))?\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/i,
    ],
  };

  for (const key of keys) {
    for (const pattern of patterns[key]) {
      const match = normalized.match(pattern);

      if (match) {
        const value = Number(match[1]);

        if (Number.isFinite(value)) {
          found[key] = value;
          break;
        }
      }
    }
  }

  return found;
}

/* =========================================================
   PDF TEXT EXTRACTION
========================================================= */

async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  }).promise;

  let completeText = '';

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);

    const content = await page.getTextContent();

    const pageText = content.items
      .map((item: any) => item.str || '')
      .join(' ');

    completeText += `\n${pageText}\n`;
  }

  return normalizeText(completeText);
}

/* =========================================================
   RENDER PDF PAGE FOR OCR
========================================================= */

async function renderPdfPage(
  page: any,
  scale = 2
): Promise<string> {
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not create PDF canvas.');
  }

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  return canvas.toDataURL('image/png');
}

/* =========================================================
   OCR IMAGE / SCANNED PDF
========================================================= */

async function runOcrOnImage(file: File): Promise<string> {
  const worker = await createWorker('eng');

  try {
    const result = await worker.recognize(file);

    return normalizeText(result.data.text);
  } finally {
    await worker.terminate();
  }
}

async function runOcrOnPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  }).promise;

  const worker = await createWorker('eng');

  try {
    let completeText = '';

    /*
      OCR each page.
      Most soil reports are only 1–3 pages, so this is acceptable
      for a local project application.
    */

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);

      const imageData = await renderPdfPage(page, 2);

      const result = await worker.recognize(imageData);

      completeText += `\n${result.data.text}\n`;
    }

    return normalizeText(completeText);
  } finally {
    await worker.terminate();
  }
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Upload() {
  const { t } = useLanguage();
  const { setSoil } = useApp();
  const navigate = useNavigate();

  const ref = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);

  const [text, setText] = useState('');

  const [found, setFound] = useState<FoundValues>({});

  const [notice, setNotice] = useState('');

  const [fileNote, setFileNote] = useState('');

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  /* =======================================================
     PROCESS EXTRACTED TEXT
  ======================================================= */

  const processText = (value: string) => {
    setText(value);

    const values = extractValues(value);

    setFound(values);

    const count = Object.keys(values).length;

    if (count === keys.length) {
      setNotice(`${count}/12 soil values detected successfully.`);
      setError('');
    } else if (count > 0) {
      setNotice(`${count}/12 soil values detected. Please verify the remaining values.`);
      setError('');
    } else {
      setNotice('');
      setError(
        'No soil values could be detected. Please verify the report text or enter the values manually.'
      );
    }
  };

  /* =======================================================
     FILE HANDLER
  ======================================================= */

  const handleFile = async (selected: File | null) => {
    setFile(selected);

    setFound({});
    setNotice('');
    setFileNote('');
    setError('');
    setText('');

    if (!selected) {
      return;
    }

    setLoading(true);

    try {
      const fileName = selected.name.toLowerCase();
      const type = selected.type.toLowerCase();

      /* -----------------------------------------------
         TXT / CSV
      ------------------------------------------------ */

      if (
        type.includes('text') ||
        fileName.endsWith('.csv') ||
        fileName.endsWith('.txt')
      ) {
        const content = await selected.text();

        processText(content);

        setFileNote('Text file read successfully.');

        return;
      }

      /* -----------------------------------------------
         PDF
      ------------------------------------------------ */

      if (type.includes('pdf') || fileName.endsWith('.pdf')) {
        let extractedText = '';

        /*
          First attempt:
          extract actual text from the PDF.
        */

        try {
          extractedText = await extractPdfText(selected);
        } catch (pdfError) {
          console.error('PDF text extraction failed:', pdfError);
        }

        /*
          If the PDF contains selectable text,
          use it directly.
        */

        if (extractedText.trim().length > 20) {
          const values = extractValues(extractedText);

          /*
            If enough values were detected, use the extracted text.
          */

          if (Object.keys(values).length >= 4) {
            processText(extractedText);

            setFileNote(
              'PDF text extracted successfully. Please verify the detected values before analysis.'
            );

            return;
          }
        }

        /*
          If normal extraction failed, treat it as a scanned PDF
          and run OCR.
        */

        setFileNote(
          'This PDF appears to be scanned. Running OCR...'
        );

        const ocrText = await runOcrOnPdf(selected);

        processText(ocrText);

        setFileNote(
          'PDF OCR completed. Please verify the detected values before analysis.'
        );

        return;
      }

      /* -----------------------------------------------
         IMAGE
      ------------------------------------------------ */

      if (
        type.startsWith('image/') ||
        /\.(png|jpg|jpeg|webp)$/i.test(fileName)
      ) {
        setFileNote('Reading soil report image with OCR...');

        const ocrText = await runOcrOnImage(selected);

        processText(ocrText);

        setFileNote(
          'Image OCR completed. Please verify the detected values before analysis.'
        );

        return;
      }

      throw new Error(
        'Unsupported file type. Please upload PDF, image, CSV or TXT.'
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Could not process this file.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     MANUAL VALUE CHANGE
  ======================================================= */

  const updateValue = (key: SoilKey, value: string) => {
    if (value.trim() === '') {
      setFound((previous) => {
        const next = { ...previous };
        delete next[key];
        return next;
      });

      return;
    }

    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
      return;
    }

    setFound((previous) => ({
      ...previous,
      [key]: numberValue,
    }));
  };

  /* =======================================================
     CONTINUE TO ANALYSIS
  ======================================================= */

  const continueToAnalysis = () => {
    const missing = keys.filter(
      (key) => found[key] === undefined
    );

    if (missing.length > 0) {
      setError(
        `Please provide all soil values. Missing: ${missing.join(', ')}`
      );

      return;
    }

    const soil: SoilInput = {
      ...defaults,
      N: found.N!,
      P: found.P!,
      K: found.K!,
      pH: found.pH!,
      EC: found.EC!,
      OC: found.OC!,
      S: found.S!,
      Zn: found.Zn!,
      Fe: found.Fe!,
      Cu: found.Cu!,
      Mn: found.Mn!,
      B: found.B!,
    };

    /*
      Save values in AppContext.
      The Analysis page can then send them to /analyze-soil.
    */

    setSoil(soil);

    navigate('/analysis');
  };

  const detectedCount = keys.filter(
    (key) => found[key] !== undefined
  ).length;

  const allValuesFound = detectedCount === keys.length;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">
          {t('upload.eyebrow')}
        </span>

        <h1>{t('upload.title')}</h1>

        <p>{t('upload.desc')}</p>
      </div>

      <div className="upload-grid">

        {/* =================================================
            FILE UPLOAD
        ================================================= */}

        <div
          className="upload-card"
          onClick={() => !loading && ref.current?.click()}
          style={{
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          <input
            ref={ref}
            hidden
            type="file"
            accept=".txt,.csv,.pdf,.png,.jpg,.jpeg,.webp,image/*"
            onChange={(event) =>
              handleFile(
                event.target.files?.[0] || null
              )
            }
          />

          {loading ? (
            <Loader2
              size={38}
              className="spin"
            />
          ) : (
            <FileUp size={38} />
          )}

          <h2>
            {file
              ? file.name
              : t('upload.choose')}
          </h2>

          <p>
            {t('upload.formats')}
          </p>

          {file && !loading && (
            <span className="upload-file-state">
              <FileText size={14} />

              {file.name.toLowerCase().endsWith('.pdf')
                ? 'PDF processed'
                : file.type.startsWith('image/')
                ? 'Image processed'
                : 'File read'}
            </span>
          )}

          {loading && (
            <span className="upload-file-state">
              Processing report...
            </span>
          )}
        </div>

        {/* =================================================
            REVIEW
        ================================================= */}

        <div className="upload-review">

          <div className="review-head">
            <div>
              <span className="eyebrow">
                {t('upload.reviewEyebrow')}
              </span>

              <h2>
                {t('upload.reviewTitle')}
              </h2>
            </div>

            <span className="badge">
              <AlertTriangle size={14} />

              {t('upload.verify')}
            </span>
          </div>

          {/* Extracted text */}

          <textarea
            value={text}
            onChange={(event) =>
              processText(event.target.value)
            }
            placeholder={`N: 145
P: 18.6
K: 172
pH: 6.42
EC: 0.31
OC: 0.38
S: 9.2
Zn: 0.71
Fe: 4.18
Cu: 0.28
Mn: 5.63
B: 0.32`}
          />

          {/* File information */}

          {fileNote && (
            <div className="info-box">
              <Info size={17} />

              <span>{fileNote}</span>
            </div>
          )}

          {/* Error */}

          {error && (
            <div className="error-box">
              <AlertTriangle size={17} />

              <span>{error}</span>
            </div>
          )}

          {/* Success / detection notice */}

          {notice && !error && (
            <div
              className={
                allValuesFound
                  ? 'success-box'
                  : 'info-box'
              }
            >
              {allValuesFound ? (
                <CheckCircle2 size={17} />
              ) : (
                <Info size={17} />
              )}

              <span>{notice}</span>
            </div>
          )}

          {/* =================================================
              EXTRACTED VALUES
          ================================================= */}

          <div className="extracted-grid">
            {keys.map((key) => (
              <div
                key={key}
                className={
                  found[key] !== undefined
                    ? 'extracted-item found'
                    : 'extracted-item'
                }
              >
                <span>{key}</span>

                <input
                  type="number"
                  step="any"
                  value={
                    found[key] !== undefined
                      ? found[key]
                      : ''
                  }
                  placeholder="—"
                  onChange={(event) =>
                    updateValue(
                      key,
                      event.target.value
                    )
                  }
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                />
              </div>
            ))}
          </div>

          {/* =================================================
              ANALYZE BUTTON
          ================================================= */}

          <button
            className="btn primary"
            disabled={
              loading ||
              !allValuesFound
            }
            onClick={continueToAnalysis}
          >
            {loading ? (
              <>
                <Loader2
                  size={16}
                  className="spin"
                />

                Processing...
              </>
            ) : (
              <>
                {t('upload.continueAnalysis')}

                <ArrowRight size={16} />
              </>
            )}
          </button>

          <p className="muted">
            {allValuesFound
              ? 'All 12 soil values are ready. Verify them before analysis.'
              : `Detected ${detectedCount}/12 required soil values.`}
          </p>
        </div>
      </div>

      {/* =================================================
          DISCLAIMER
      ================================================= */}

      <div className="disclaimer">
        <AlertTriangle size={17} />

        <span>
          {t('upload.disclaimer')}
        </span>
      </div>

      <div className="upload-footer">
        <Link
          className="btn ghost"
          to="/analysis"
        >
          {t('upload.manual')}
        </Link>
      </div>
    </div>
  );
}