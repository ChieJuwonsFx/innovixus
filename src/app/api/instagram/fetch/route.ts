import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    const res = await fetch('https://chiejuwonsfx-downloader.hf.space/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();

    if (!data.success || !data.urls?.length) {
      return NextResponse.json({ error: 'Gagal mengambil gambar' }, { status: 400 });
    }

    return NextResponse.json({ success: true, urls: data.urls, total: data.total });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
