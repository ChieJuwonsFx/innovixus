'use client';

import { useState } from 'react';
import { Sparkles, Send, RotateCcw, Globe } from 'lucide-react';
import { FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;
const TEMPLATE_PATH = '/templates/template_feed.png';
const TEXT_BOX = { x: 90, y: 300, width: 900, height: 750 };
const TEXT_PADDING_X = 90;
const TEXT_PADDING_Y = 90;
const SAFE_TOP = 280;
const SAFE_BOTTOM = 1200;

type TextLine = { text: string; blank: boolean };

function wrapParagraph(ctx: CanvasRenderingContext2D, paragraph: string, maxWidth: number) {
  const words = paragraph.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';
  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(nextLine).width > maxWidth && currentLine) { lines.push(currentLine); currentLine = word; }
    else { currentLine = nextLine; }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

function buildTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const paragraphs = text.split('\n');
  const lines: TextLine[] = [];
  paragraphs.forEach((paragraph, index) => {
    if (!paragraph.trim()) { lines.push({ text: '', blank: true }); return; }
    const wrappedLines = wrapParagraph(ctx, paragraph, maxWidth);
    wrappedLines.forEach((line) => lines.push({ text: line, blank: false }));
    if (index < paragraphs.length - 1) lines.push({ text: '', blank: true });
  });
  return lines.length > 0 ? lines : [{ text: 'Tulis teks di sini', blank: false }];
}

function getTextBlockHeight(lines: TextLine[], lineHeight: number) {
  return lines.reduce((sum, line) => sum + (line.blank ? Math.round(lineHeight * 0.55) : lineHeight), 0);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src;
  });
}

async function createFeedPost(text: string) {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH; canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  try {
    const templateImage = await loadImage(TEMPLATE_PATH);
    ctx.drawImage(templateImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  } catch {
    const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#f8fafc');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  const content = text.trim() || 'Tulis teks di sini';
  const maxTextWidth = TEXT_BOX.width - TEXT_PADDING_X * 2;
  let fontSize = 84, lines: TextLine[] = [], lineHeight = Math.round(fontSize * 1.25);
  while (fontSize >= 30) {
    ctx.font = `600 ${fontSize}px Arial, sans-serif`;
    lines = buildTextLines(ctx, content, maxTextWidth);
    lineHeight = Math.round(fontSize * 1.25);
    if (getTextBlockHeight(lines, lineHeight) <= TEXT_BOX.height - TEXT_PADDING_Y * 2) break;
    fontSize -= 2;
  }
  ctx.fillStyle = '#003366'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  const totalHeight = getTextBlockHeight(lines, lineHeight);
  const centeredY = TEXT_BOX.y + (TEXT_BOX.height - totalHeight) / 2;
  const shortTextBias = Math.min(120, Math.max(0, (240 - totalHeight) * 0.45));
  const maxY = SAFE_BOTTOM - totalHeight;
  let currentY = Math.max(SAFE_TOP, Math.min(centeredY - shortTextBias, maxY));
  lines.forEach((line) => {
    if (line.blank) { currentY += Math.round(lineHeight * 0.55); return; }
    ctx.fillText(line.text, TEXT_BOX.x + TEXT_BOX.width / 2, currentY);
    currentY += lineHeight;
  });
  return canvas;
}

export default function ReelsPostPage() {
  const [text, setText] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('#kralokainfo #melangkahbarengkraloka #lovequotes');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [postResult, setPostResult] = useState<string | null>(null);

  const handleAiGenerate = async () => {
    setIsAiLoading(true);
    setPreviewUrl(null);
    setPostResult(null);
    try {
      const res = await fetch('/api/ai/reels', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, prompt: '' }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setText(json.data.text);
      setCaption(json.data.caption);
      setHashtags(json.data.hashtags);

      // Auto-generate preview
      const canvas = await createFeedPost(json.data.text);
      setPreviewUrl(canvas.toDataURL('image/png'));
    } catch (e) { toast.error('AI gagal: ' + (e instanceof Error ? e.message : '')); }
    finally { setIsAiLoading(false); }
  };

  const handlePostToIG = async () => {
    if (!previewUrl) { toast.error('Generate preview dulu'); return; }
    if (!caption.trim()) { toast.error('Caption masih kosong'); return; }
    setIsPosting(true);
    setPostResult(null);
    try {
      const res = await fetch('/api/instagram/post', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaType: 'IMAGE', imageDataUrls: [previewUrl], caption: caption + '\n\n' + hashtags, account: 'kinetics' }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setPostResult('Berhasil dipost!');
      toast.success('Post berhasil!');
    } catch (e) { toast.error('Gagal post: ' + (e instanceof Error ? e.message : '')); }
    finally { setIsPosting(false); }
  };

  const handleReset = () => { setText(''); setPreviewUrl(null); setCaption(''); setPostResult(null); };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Feed Post Generator</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <button onClick={() => setLanguage(language === 'id' ? 'en' : 'id')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">
              <Globe className="h-3 w-3" /> {language === 'id' ? 'Indonesia' : 'English'}
            </button>
            <button onClick={handleAiGenerate} disabled={isAiLoading} className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50">
              {isAiLoading ? <FiLoader className="animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isAiLoading ? 'Memproses...' : 'AI Generate'}
            </button>
          </div>

          <div>
            <label className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Teks Post</span>
              <span className="text-slate-400">{text.length}/50</span>
            </label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={500} rows={6} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="Love quote text..." />
          </div>

          <div className="flex gap-2">
            <button onClick={() => {
              if (!text.trim()) return;
              setIsGenerating(true);
              setPostResult(null);
              createFeedPost(text).then(canvas => setPreviewUrl(canvas.toDataURL('image/png'))).catch(() => toast.error('Gagal generate')).finally(() => setIsGenerating(false));
            }} disabled={isGenerating || !text.trim()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isGenerating ? <FiLoader className="animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isGenerating ? 'Generate...' : 'Regenerate'}
            </button>
          </div>

          {previewUrl && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Caption</label>
                <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Hashtags</label>
                <input type="text" value={hashtags} onChange={(e) => setHashtags(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
              </div>
              <button onClick={handlePostToIG} disabled={isPosting} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#003366] px-6 py-3 text-sm font-medium text-white hover:bg-[#00284d] disabled:opacity-50">
                {isPosting ? <FiLoader className="animate-spin" /> : <Send className="h-4 w-4" />}
                {isPosting ? 'Posting...' : 'Post ke Instagram'}
              </button>
              {postResult && <p className="text-center text-xs font-medium text-green-600">{postResult}</p>}
            </>
          )}

          <button onClick={handleReset} className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600">
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Preview</h2>
            <span className="text-xs text-slate-400">1080 x 1350 (4:5)</span>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-auto w-full" />
            ) : (
              <div className="flex min-h-[500px] items-center justify-center text-center"><p className="text-sm text-slate-400">Klik AI Generate untuk mulai</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
