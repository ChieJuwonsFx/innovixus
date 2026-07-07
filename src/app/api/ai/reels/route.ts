import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt: userPrompt, language } = await req.json();

    const key = process.env.GROQ_API_KEY?.trim();
    if (!key) return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 400 });

    const lang = language === 'en' ? 'English' : 'Indonesian';

    const rules = [
      'Act as a creative writer specializing in modern Indonesian youth quotes.',
      'Generate a short, deep love/relationship quote in ' + lang + '.',
      '',
      'CRITICAL RULES:',
      '1. FORBIDDEN: wahai, kekasihku, permaisuri, dirimu, asmara, sanubari, rembulan, cintaku, pujaan, belahan jiwa',
      '2. TONE: Casual, modern, natural like a tweet or chat message.',
      '3. SHORT: Max 1-2 sentences under 15 words total.',
      '4. VARIETY: Mature love, quiet moments, growth.',
      '5. NO emojis, quotes, or hashtags in the quote text.',
      '',
      'GOOD examples (natural, like real tweets):',
      '- Dia yang tepat bukan yang paling romantis, tapi yang paling konsisten.',
      '- Kadang diam itu bukan tidak peduli, sedang menata rasa.',
      '- Kamu ga harus sempurna buat dicintai.',
      '- Mencintai bukan berarti memiliki segalanya. Terkadang, memiliki ketenangan adalah cukup.',
      '- Aku tidak pernah mencari yang sempurna, hanya yang mau tetap tinggal.',
      '- Dewasa itu belajar bahwa cinta bukan hanya soal rasa, tapi juga keputusan.',
      '',
      'BAD examples (cringe, AI-like, robotic):',
      '- Wahai kekasihku, engkaulah permata hatiku.',
      '- Cinta adalah anugerah terindah dalam hidup.',
      '- Kita bukan pasangan sempurna, tapi kita bisa menjadi peta untuk menavigasi kehidupan bersama.',
      '- Kita ga harus selalu bahagia bareng, tapi setidaknya kita sama dalam kesedihan.',
      '- Kita tidak harus menunggu saat itu, tapi menciptakan saat itu bersama.',
      '- Mencintai bukan berarti kita harus menyatu sepenuhnya, tapi saling melengkapi dalam perbedaan.',
      '',
      'Return JSON:',
      JSON.stringify({
        text: 'Quote pendek 1-2 kalimat, tanpa emoji, tanpa tanda kutip',
        caption: 'Caption hanya 2 paragraf, pisahkan dengan 1 baris kosong.\n\nParagraf 1: Quote dari text (boleh tambah 1-2 kalimat natural, ga usah panjang).\n\nParagraf 2: Ajakan interaksi singkat + Follow @kineticslove.',
        hashtags: '#storywa #katakata #quotescinta #lovequotes #katacinta #fyp #kineticslove'
      }, null, 2),
      '',
      'CAPTION HANYA 2 PARAGRAF. JANGAN LEBIH.'
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
