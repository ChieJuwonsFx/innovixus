import { NextResponse } from 'next/server';

// Preset audio IDs dari Instagram. Kamu bisa ganti manual setelah dapat ID asli dari browser IG.
// Cara dapat ID: buka IG web → pilih lagu → lihat URL: instagram.com/reels/audio/{ID}/
const LOVE_SONGS_PRESET: string[] = [
  "283068355668666", // Love song dari IG
];

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    // Filter by keyword (case-insensitive)
    let results = LOVE_SONGS_PRESET;
    if (query) {
      // Since we only have IDs, filtering is limited until real data is added
      results = LOVE_SONGS_PRESET; // Return all when searching
    }

    return NextResponse.json({
      success: true,
      audio: results.map((id, i) => ({
        audio_id: id,
        title: `Love Song ${i + 1}`,
        display_artist: 'Instagram Audio',
      })),
      preset: true,
      count: results.length,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
