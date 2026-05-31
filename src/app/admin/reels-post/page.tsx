'use client';

import { useEffect, useState } from 'react';
import { Download, RotateCcw, FileText } from 'lucide-react';

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;
const TEMPLATE_PATH = '/templates/template_reels.png';
const TEXT_BOX = {
  x: 90,
  y: 510,
  width: 900,
  height: 900,
};
const TEXT_PADDING_X = 90;
const TEXT_PADDING_Y = 90;
const SAFE_TOP = 420;
const SAFE_BOTTOM = 1560;

type TextLine = {
  text: string;
  blank: boolean;
};

function wrapParagraph(ctx: CanvasRenderingContext2D, paragraph: string, maxWidth: number) {
  const words = paragraph.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (ctx.measureText(nextLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function buildTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const paragraphs = text.split('\n');
  const lines: TextLine[] = [];

  paragraphs.forEach((paragraph, index) => {
    if (!paragraph.trim()) {
      lines.push({ text: '', blank: true });
      return;
    }

    const wrappedLines = wrapParagraph(ctx, paragraph, maxWidth);
    wrappedLines.forEach((line) => {
      lines.push({ text: line, blank: false });
    });

    if (index < paragraphs.length - 1) {
      lines.push({ text: '', blank: true });
    }
  });

  return lines.length > 0 ? lines : [{ text: 'Tulis teks di sini', blank: false }];
}

function getTextBlockHeight(lines: TextLine[], lineHeight: number) {
  return lines.reduce((sum, line) => {
    return sum + (line.blank ? Math.round(lineHeight * 0.55) : lineHeight);
  }, 0);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function createReelsPost(text: string) {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  try {
    const templateImage = await loadImage(TEMPLATE_PATH);
    ctx.drawImage(templateImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  } catch {
    const background = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    background.addColorStop(0, '#ffffff');
    background.addColorStop(1, '#f8fafc');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  const content = text.trim() || 'Tulis teks di sini';
  const maxTextWidth = TEXT_BOX.width - TEXT_PADDING_X * 2;

  let fontSize = 84;
  let lines: TextLine[] = [];
  let lineHeight = Math.round(fontSize * 1.25);

  while (fontSize >= 30) {
    ctx.font = `600 ${fontSize}px Arial, sans-serif`;
    lines = buildTextLines(ctx, content, maxTextWidth);
    lineHeight = Math.round(fontSize * 1.25);

    const totalHeight = getTextBlockHeight(lines, lineHeight);

    if (totalHeight <= TEXT_BOX.height - TEXT_PADDING_Y * 2) {
      break;
    }

    fontSize -= 2;
  }

  ctx.fillStyle = '#003366';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const totalHeight = getTextBlockHeight(lines, lineHeight);

  const centeredY = TEXT_BOX.y + (TEXT_BOX.height - totalHeight) / 2;
  const shortTextBias = Math.min(120, Math.max(0, (240 - totalHeight) * 0.45));
  const maxY = SAFE_BOTTOM - totalHeight;
  let currentY = Math.max(SAFE_TOP, Math.min(centeredY - shortTextBias, maxY));

  lines.forEach((line) => {
    if (line.blank) {
      currentY += Math.round(lineHeight * 0.55);
      return;
    }

    ctx.fillText(line.text, TEXT_BOX.x + TEXT_BOX.width / 2, currentY);
    currentY += lineHeight;
  });

  return canvas.toDataURL('image/png');
}

export default function ReelsPostPage() {
  const [text, setText] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!text.trim()) {
        setPreviewUrl(null);
        return;
      }

      void (async () => {
        try {
          setPreviewUrl(await createReelsPost(text));
        } catch (error) {
          console.error('Error generating reels post preview:', error);
        }
      })();
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [text]);

  const handleGenerate = () => {
    if (!text.trim()) {
      return;
    }

    setIsGenerating(true);

    window.requestAnimationFrame(() => {
      void (async () => {
        try {
          setPreviewUrl(await createReelsPost(text));
        } finally {
          setIsGenerating(false);
        }
      })();
    });
  };

  const handleDownload = () => {
    if (!previewUrl) {
      return;
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .replace('Z', '');

    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `reels-post-${timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setText('');
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 dark:border-slate-800 dark:bg-slate-900 sm:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
          Create post
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Reels text post generator
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Text content
          </label>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={12}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-slate-700"
            placeholder="Tulis teks post di sini. Gunakan enter untuk baris baru."
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!text.trim() || isGenerating}
              className="inline-flex items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <FileText className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate preview'}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!previewUrl}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-full border border-transparent px-5 py-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Preview
            </h2>
            <span className="text-xs text-slate-400">1080 x 1920</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
            {previewUrl ? (
              <img src={previewUrl} alt="Reels post preview" className="w-full h-auto" />
            ) : (
              <div className="flex min-h-[640px] items-center justify-center px-6 text-center">
                <div>
                  <p className="text-lg font-medium text-slate-900 dark:text-white">
                    Preview will appear here
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Type your text, then generate the post.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}