import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt: userPrompt, language } = await req.json();

    const key = process.env.GROQ_API_KEY?.trim();
    if (!key) return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 400 });

    const lang = language === 'en' ? 'English' : 'Indonesian';

    const moods = ['falling in love', 'rindu', 'bahagia', 'galau', 'move on', 'insecure', 'syukur', 'harapan', 'kesepian', 'menunggu', 'ikhlas', 'semangat'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];

    const rules = [
      'Act as a creative writer specializing in modern Indonesian youth quotes.',
      'Generate a love/relationship quote in ' + lang + ' with mood: ' + randomMood + '.',
      '',
      'CRITICAL RULES:',
      '1. FORBIDDEN: wahai, kekasihku, permaisuri, dirimu, asmara, sanubari, rembulan, cintaku, pujaan, belahan jiwa',
      '2. TONE: Casual, modern, natural like a tweet or chat message.',
      '3. LENGTH: Be random! Sometimes 1 sentence (3 words). Sometimes 3-4 sentences (deep). Vary each time.',
      '4. MOOD: Must match the assigned mood. Make it feel real, relatable, like a human experience.',
      '5. NO emojis, quotes, or hashtags in the quote text.',
      '',
      'GOOD examples (natural, like real tweets):',
      '- Dia yang tepat bukan yang paling romantis, tapi yang paling konsisten.',
      '- Kadang diam itu bukan tidak peduli, sedang menata rasa.',
      '- Kamu ga harus sempurna buat dicintai.',
      '- Hari ini aku nangis. Besok mungkin akan lebih baik. Atau tidak. Tapi gapapa.',
      '- Aku tidak pernah mencari yang sempurna, hanya yang mau tetap tinggal.',
      '- Dewasa itu belajar bahwa cinta bukan hanya soal rasa, tapi juga keputusan.',
      '- Senyumnya sederhana, tapi dampaknya luar biasa.',
      '- Ada yang bilang waktu menyembuhkan. Tapi kadang kita harus memutuskan untuk sembuh.',
      '',
      'BAD examples (cringe, AI-like, robotic):',
      '- Wahai kekasihku, engkaulah permata hatiku.',
      '- Cinta adalah anugerah terindah dalam hidup.',
      '- Kita bukan pasangan sempurna, tapi kita bisa menjadi peta.',
      '- Kita ga harus selalu bahagia bareng, tapi setidaknya kita sama dalam kesedihan.',
      '',
      'Return JSON:',
      JSON.stringify({
        text: 'Quote tanpa emoji, tanpa tanda kutip, sesuai mood ' + randomMood + '. Bisa pendek 1 kata atau panjang 4 kalimat.',
        caption: 'Caption 2 paragraf. Paragraf 1: quote + tambahan natural. Paragraf 2: ajakan interaksi + Follow @kineticslove. Pisahkan paragraf dengan 1 baris kosong.',
        hashtags: '#storywa #katakata #quotescinta #lovequotes #katacinta #fyp #kineticslove'
      }, null, 2),
      '',
    ].join('\n');

    const promptText = userPrompt || rules;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: promptText }],
        response_format: { type: 'json_object' },
        temperature: 0.9
      })
    });
    if (!res.ok) return NextResponse.json({ error: 'AI failed' }, { status: 500 });

    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({ success: true, data: parsed });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
