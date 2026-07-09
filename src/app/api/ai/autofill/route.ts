import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function formatDateID(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return dateStr; }
}

function normalizeName(name: string): string {
  const prefixes = ['pt ', 'cv ', 'tbk ', 'ltd ', 'inc ', 'corp ', 'co ', 'perusahaan '];
  let n = name.toLowerCase().trim();
  for (const p of prefixes) {
    if (n.startsWith(p)) n = n.slice(p.length).trim();
  }
  return n;
}

function findBestMatch(name: string, list: { id: string; name: string }[]): string | null {
  const normalized = normalizeName(name);
  for (const item of list) {
    if (normalizeName(item.name).includes(normalized) || normalized.includes(normalizeName(item.name))) {
      return item.id;
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { caption } = await req.json();
    if (!caption || typeof caption !== 'string') {
      return NextResponse.json({ error: 'Caption required' }, { status: 400 });
    }

    const [{ data: existingOrganizers }, { data: existingFields }, { data: existingLevels }] = await Promise.all([
      supabase.from('organizers').select('id, name, instagram'),
      supabase.from('fields').select('id, name'),
      supabase.from('levels').select('id, name'),
    ]);

    const orgs = existingOrganizers || [];
    const fields = existingFields || [];
    const levels = existingLevels || [];

    const extractPrompt = `
Kamu adalah asisten ekstraktor data lowongan untuk Kraloka.

Teks lowongan:
"""
${caption}
"""

Database saat ini — pilih ID dari daftar yang paling cocok. Jika tidak ada yang cocok, isi "new" dengan nama yang sesuai.

Organizer tersedia (pilih id yang cocok dengan penyelenggara dari teks):
${JSON.stringify(orgs.map(o => ({ id: o.id, name: o.name, instagram: o.instagram })))}

Bidang tersedia (pilih id yang cocok dari teks, bisa lebih dari satu):
${JSON.stringify(fields.map(f => ({ id: f.id, name: f.name })))}

Level tersedia (pilih id yang cocok dari teks, bisa lebih dari satu):
${JSON.stringify(levels.map(l => ({ id: l.id, name: l.name })))}

Ekstrak data berikut ke JSON.
{
  "title": "Judul rapi dan jelas",
  "kategori": "Info Lomba atau Info Magang atau Info Loker",
  "guidelink": "Link panduan, null jika tidak",
  "registerlink": "Link pendaftaran, null jika tidak. Email: mailto:email?subject=Judul",
  "open_date": "YYYY-MM-DD. Konversi dari teks ke ISO. Contoh: \"19 JULY 2026\" jadi \"2026-07-19\". null jika tidak disebutkan",
  "close_date": "YYYY-MM-DD. Sama. null jika tidak disebutkan",
  "is_online": "Online / Offline / Online & Offline",
  "location": "Kota/daerah, null jika tidak",
  "is_free": true atau false,
  "organizer_id": "ID dari daftar yang cocok, atau {\"new\": \"Nama Organizer\"} jika tidak ada yang cocok",
  "organizer_instagram": "Instagram handle tanpa @, null jika tidak",
  "field_ids": ["ID dari daftar yang cocok", ...] atau [{"new": "Nama Bidang Baru"}, ...],
  "level_ids": ["ID dari daftar yang cocok", ...] atau [{"new": "Nama Level Baru"}, ...],
  "user_hashtags": ["#hashtag1", "#hashtag2", ... hashtag yang ditemukan di teks (dengan #). [] jika tidak ada"]
}
`;

    const extractRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: extractPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });

    if (!extractRes.ok) {
      const err = await extractRes.text();
      console.error('Extract API error:', err);
      return NextResponse.json({ error: 'Gagal mengekstrak data' }, { status: 500 });
    }

    const extractData = await extractRes.json();
    const extracted = JSON.parse(extractData?.choices?.[0]?.message?.content || '{}');

    let organizer_id = extracted.organizer_id;
    if (typeof organizer_id === 'object' && organizer_id?.new) {
      const match = findBestMatch(organizer_id.new, orgs);
      if (match) {
        organizer_id = match;
      } else {
        const { quickCreateOrganizer } = await import('@/app/admin/organizers/actions');
        organizer_id = (await quickCreateOrganizer(organizer_id.new, extracted.organizer_instagram || null)).id;
      }
    }

    const field_ids: string[] = [];
    for (const fId of extracted.field_ids || []) {
      if (typeof fId === 'string') {
        field_ids.push(fId);
      } else if (fId?.new) {
        const match = findBestMatch(fId.new, fields);
        if (match) {
          field_ids.push(match);
        } else {
          const { createField } = await import('@/app/admin/fields/actions');
          const fd = new FormData();
          fd.append('name', fId.new);
          fd.append('only_lomba', String(extracted.kategori === 'Info Lomba'));
          await createField(fd);
          await new Promise(r => setTimeout(r, 200));
          const { getFields } = await import('@/app/admin/fields/actions');
          const updated = await getFields();
          const created = updated.find((x: { name: string }) => normalizeName(x.name) === normalizeName(fId.new));
          if (created) field_ids.push(created.id);
        }
      }
    }

    const level_ids: string[] = [];
    for (const lId of extracted.level_ids || []) {
      if (typeof lId === 'string') {
        level_ids.push(lId);
      } else if (lId?.new) {
        const match = findBestMatch(lId.new, levels);
        if (match) {
          level_ids.push(match);
        } else {
          const { createLevel } = await import('@/app/admin/levels/actions');
          const ld = new FormData();
          ld.append('name', lId.new);
          await createLevel(ld);
          await new Promise(r => setTimeout(r, 200));
          const { getLevels } = await import('@/app/admin/levels/actions');
          const updated = await getLevels();
          const created = updated.find((x: { name: string }) => normalizeName(x.name) === normalizeName(lId.new));
          if (created) level_ids.push(created.id);
        }
      }
    }

    const organizerName = (orgs.find(o => o.id === organizer_id)?.name || extracted.organizer_id?.new || '').toLowerCase().replace(/\s+/g, '');
    const formattedOpen = formatDateID(extracted.open_date);
    const formattedClose = formatDateID(extracted.close_date);
    const dateLine = extracted.close_date
      ? `🗓️ ${extracted.open_date ? `Pendaftaran: ${formattedOpen} - ${formattedClose}` : `Batas Pendaftaran: ${formattedClose}`}`
      : '';

    const kralokaHashtags = extracted.kategori === 'Info Loker'
      ? '#kralokainfo #melangkahbarengkraloka #infoloker #loker #lowongankerja #carikerja'
      : extracted.kategori === 'Info Magang'
        ? '#kralokainfo #melangkahbarengkraloka #infomagang #magang #internship #carikerja'
        : '#kralokainfo #melangkahbarengkraloka #infolomba #lomba #kompetisi';
    const orgHashtag = organizerName ? ` #${organizerName}` : '';
    const userHashtags = (extracted.user_hashtags || []).join(' ');
    const allHashtags = `${kralokaHashtags}${orgHashtag}${userHashtags ? '\n' + userHashtags : ''}`;

    const captionPrompt = `
Buat caption Instagram Kraloka yang menarik dari data berikut. Jangan copy mentah teks asli. Tulis ulang dengan gaya engaging, per poin, setiap bagian PISAH BARIS.

Data:
- Judul: ${extracted.title || '(tidak ada)'}
- Kategori: ${extracted.kategori || '(tidak ada)'}
- Tanggal: ${formattedClose || 'Tidak disebutkan'}
- Lokasi: ${extracted.location || 'Tidak disebutkan'}
- Link: ${extracted.registerlink || 'Tidak ada'}
- Penyelenggara: ${(orgs.find(o => o.id === organizer_id)?.name) || extracted.organizer_id?.new || 'Tidak disebutkan'}

Format caption:

🔥 [judul] 🔥

Halo Rekan Kraloka! 👋

[Tulis paragraf pembuka yang menarik]

💼 Poin Penting:
•
•

📌 Kualifikasi:
•

${extracted.close_date ? `🗓️ ${extracted.open_date ? `Pendaftaran: ${formattedOpen} - ${formattedClose}` : `Batas Pendaftaran: ${formattedClose}`}` : ''}

👉 ${extracted.registerlink || 'Link tidak tersedia'}

⚠️ PANDUAN KEAMANAN KRALOKA:
Rekan Kraloka, mohon selalu waspada saat mencari info. Rekrutmen resmi TIDAK PERNAH memungut biaya apapun (GRATIS).

${allHashtags}

JANGAN membuat hashtag baru apapun. Hanya gunakan hashtag yang sudah disediakan di atas. Kembalikan HANYA teks caption. Tanpa JSON, tanpa pembuka/penutup.
`;

    const captionRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: captionPrompt }],
        temperature: 0.5
      })
    });

    if (!captionRes.ok) {
      const err = await captionRes.text();
      console.error('Caption API error:', err);
      return NextResponse.json({ error: 'Gagal generate caption' }, { status: 500 });
    }

    const captionData = await captionRes.json();
    const generatedCaption = captionData?.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        ...extracted,
        caption: generatedCaption,
        organizer_id,
        field_ids,
        level_ids,
        user_hashtags: extracted.user_hashtags || [],
      }
    });
  } catch (e) {
    console.error('Autofill error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
