import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const res = await fetch('https://download-instagram-xi.vercel.app/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();

    if (!data.success || !data.urls?.length) {
      return NextResponse.json({ error: 'Gagal mengambil gambar dari link' }, { status: 400 });
    }

    const images: { dataUrl: string; type: string }[] = [];
    for (const imgUrl of data.urls.slice(0, 10)) {
      try {
        const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(15000) });
        const blob = await imgRes.blob();
        const buffer = await blob.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const mime = blob.type || 'image/jpeg';
        images.push({ dataUrl: `data:${mime};base64,${base64}`, type: mime });
      } catch {}
    }

    if (images.length === 0) {
      return NextResponse.json({ error: 'Gagal mendownload gambar' }, { status: 500 });
    }

    return NextResponse.json({ success: true, images, total: images.length });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
