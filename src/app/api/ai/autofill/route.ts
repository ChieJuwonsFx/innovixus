import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { caption } = await req.json();
    if (!caption || typeof caption !== 'string') {
      return NextResponse.json({ error: 'Caption required' }, { status: 400 });
    }

    const prompt = `
Kamu adalah asisten profesional untuk platform lowongan kerja bernama Kraloka.
Tugasmu adalah mengekstrak teks loker mentah menjadi format JSON yang siap dimasukkan ke database website.

Teks Loker Mentah:
"""
${caption}
"""

Kembalikan data HANYA dalam format JSON dengan struktur persis seperti ini (jangan beri teks pembuka/penutup lain):
{
  "title": "Judul event yang rapi dan jelas",
  "kategori": "Info Lomba atau Info Magang atau Info Loker",
  "caption": "Buat caption Instagram gaya Kraloka dengan struktur WAJIB setiap bagian PISAH BARIS (line break). JANGAN gabung dalam satu paragraf. Semua konten harus dari teks asli (JANGAN placeholder/buatan). Sertakan field_names, level_names, location yang relevan dari teks.

Hashtag wajib sesuai kategori:
- Info Loker: #kralokainfo #melangkahbarengkraloka #infoloker #loker #lowongankerja #carikerja #[hashtag_dari_teks]
- Info Magang: #kralokainfo #melangkahbarengkraloka #infomagang #magang #internship #carikerja #[hashtag_dari_teks]
- Info Lomba: #kralokainfo #melangkahbarengkraloka #infolomba #lomba #kompetisi #[hashtag_dari_teks]

Format:

🔥 [judul dari teks asli] 🔥

Halo Rekan Kraloka! 👋

[Paragraf dari teks asli]

💼 [POIN-POIN DARI TEKS ASLI]:
• [isi dari teks asli]
• [isi dari teks asli]

📌 [KUALIFIKASI DARI TEKS ASLI]:
• [isi dari teks asli]

🗓️ Pendaftaran: [tanggal dari teks asli]

👉 [link dari teks asli]

⚠️ PANDUAN KEAMANAN KRALOKA:
Rekan Kraloka, mohon selalu waspada saat mencari info. Ingat, rekrutmen resmi TIDAK PERNAH memungut biaya apa pun (GRATIS).

#kralokainfo #melangkahbarengkraloka #infoloker #loker #lowongankerja #carikerja #[hashtag_dari_teks_asli]",
  "guidelink": "Link panduan jika ada di teks, jika tidak ada null",
  "registerlink": "Link pendaftaran jika ada, jika berbentuk email ubah ke mailto:email@domain.com?subject=JudulEvent",
  "open_date": "Tanggal buka format YYYY-MM-DD jika disebutkan, jika tidak null",
  "close_date": "Tanggal tutup format YYYY-MM-DD jika disebutkan, jika tidak null",
  "is_online": "Online atau Offline atau Online & Offline",
  "location": "Deteksi lokasi dari teks (kota/daerah). Jika tidak disebutkan sama sekali, isi null",
  "is_free": true atau false,
  "organizer_name": "Nama perusahaan/penyelenggara",
  "organizer_instagram": "Instagram handle perusahaan tanpa @ jika ada, jika tidak null",
  "field_names": ["Array nama bidang yang DIDETEKSI dari teks. Contoh: Hukum, Keuangan, Pemasaran, Teknik, Manajemen, Desain, Multimedia, IT, dan lainnya. Jangan dikosongkan"],
  "level_names": ["Array nama level yang DIDETEKSI dari teks. Contoh: Fresh Graduate, Profesional (Maks. 2 tahun), Mahasiswa, Semua Jurusan, Siswa SMA/SMK, dan lainnya. Jangan dikosongkan"]
}
`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Groq API error:', err);
      return NextResponse.json({ error: 'Gagal memproses caption' }, { status: 500 });
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return NextResponse.json({ success: true, data: parsed });
  } catch (e) {
    console.error('Autofill error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
