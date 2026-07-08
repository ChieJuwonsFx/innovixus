import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt: userPrompt, language } = await req.json();

    const key = process.env.GROQ_API_KEY?.trim();
    if (!key) return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 400 });

    const lang = language === 'en' ? 'English' : 'Indonesian';

    const moods = ['falling in love', 'rindu', 'bahagia', 'galau', 'move on', 'insecure', 'syukur', 'harapan', 'kesepian', 'menunggu', 'ikhlas', 'semangat'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    const isEn = language === 'en';
    const forbidden = isEn ? 'forbidden: beloved, darling, my soulmate, my queen, my heart, oh love, dearest' : 'DILARANG: wahai, kekasihku, permaisuri, dirimu, asmara, sanubari, rembulan, cintaku, pujaan, belahan jiwa';
    const toneRule = isEn ? 'TONE: Casual, modern, natural like a text message or tweet. Use English slang naturally (gonna, wanna, kinda, nope, tho, fr, tbh, lowkey).' : 'TONE: Casual, modern, natural like a text message. Use Indonesian slang naturally (nggak, ga, beneran, gapapa, kok, aja, bakal, emang, lu, cuekin, gausah).';
    const style = isEn ? 'modern American youth conversation style' : 'modern Indonesian youth quotes';
    const examples = isEn ? [
      'EXCELLENT EXAMPLES — tone reference only, DO NOT copy:',
      '- Please normalize texting when you leave or what you\'re doing. It takes 2 seconds. Small things like that make someone feel valued.',
      '- Turns out being let go hurts less than being left hanging without clarity.',
      '- The key is simple: if they really care, you won\'t be confused about their feelings.',
      '- Stop making excuses for small things, or you\'ll get used to being taken for granted.',
      '- Funny how we used to share everything, now asking \'how are you\' feels illegal.',
      '- Sometimes silence isn\'t being cold, it\'s just protecting your own peace.',
      '',
      'SHORT examples — tone reference only, DO NOT copy:',
      '- Tired of thinking about you.',
      '- I still do, sadly.',
      '- You deserve to be happy.',
      '- Why does it have to be this hard?',
      '',
      'MEDIUM examples — tone reference only, DO NOT copy:',
      '- The saddest part is not the breakup. It\'s realizing you were the only one trying.',
      '- Don\'t let anyone make you feel like your feelings are too much. They just aren\'t the right person.',
      '- If they wanted to, they would. It\'s really that simple. Stop overcomplicating it.',
      '- Love shouldn\'t feel like a puzzle you have to solve alone.',
      '',
    ] : [
      'EXCELLENT EXAMPLES — tone reference only. DO NOT rewrite or paraphrase these. Create NEW original quotes:',
      '- Plis normalisasi kasih kabar kalau mau pergi atau mau ngapain aja. Nggak peduli pasangan lagi tidur atau lagi sibuk, ngasih kabar cuma butuh beberapa detik. Karena hal kecil seperti itu bisa bikin seseorang merasa dihargai dan nggak kepikiran yang macem-macem.',
      '- Ternyata benar, dilepasin itu nggak sepedih digantungin tanpa kepastian.',
      '- Kuncinya cuma satu: kalau dia beneran sayang, kamu nggak akan dibuat bingung sama sikapnya.',
      '- Tolong dipahami, perhatian itu nggak bisa diminta. Itu harusnya inisiatif dari diri dia sendiri.',
      '- Jangan terlalu sering memaklumkan hal kecil, lama-lama kamu jadi biasa untuk disia-siakan.',
      '- Dipikir-pikir lucu ya, dulu apa-apa cerita ke kamu, sekarang mau nanya kabar aja rasanya ga berhak.',
      '- Capek banget mikirin harus gimana lagi biar kamu paham.',
      '- Kadang diam itu bukan nggak peduli, cuma lagi menata rasa aja.',
      '- Sebenarnya sederhana, kalau ada kemauan, pasti ada jalan. Kalau nggak, pasti ada sejuta alasan.',
      '- Lagi di fase capek berharap, kalau mau menetap ya syukur, kalau mau pergi ya silakan.',
      '- Sederhana kok, yang beneran tulus itu kelihatan dari usahanya, bukan dari ketikan manisnya.',
      '- Ternyata obat paling ampuh buat ikhlas itu bukan waktu, tapi kesadaran kalau kita emang udah ga dihargai.',
      '- Lucu ya, kita sama-sama tahu kalau udah nggak cocok, tapi nggak ada yang berani buat beneran bilang selesai.',
      '',
      'SHORT examples — tone reference only, DO NOT copy:',
      '- Capek mikirin kamu.',
      '- Iya, aku masih sayang.',
      '- Kamu berhak bahagia.',
      '- Kenapa harus serumit ini?',
      '',
      'MEDIUM examples — tone reference only, DO NOT copy:',
      '- Kadang diam itu bukan ga peduli, cuman lagi nata hati aja.',
      '- Capek banget harus mikirin gimana caranya biar kamu paham.',
      '- Sebenarnya sederhana, kalau ada kemauan pasti ada jalan.',
      '- Gw sekarang di fase capek berharap, kalau mau stay ya syukur, mau pergi ya silakannn.',
      '- Yang beneran tulus itu kelihatan dari usahanya, bukan dari kata-kata manisnya.',
      '- Kadang kita perlu ngerasain sakit dulu biar tahu mana yang benar-benar berarti.',
      '- Plis, jangan biasain aku sama ketidakpastian.',
      '',
    ];

    const rules = [
      'Act as a creative writer specializing in ' + style + '.',
      'Generate a love/relationship quote in ' + lang + ' with mood: ' + randomMood + '.',
      '',
      'CRITICAL RULES:',
      '1. EMOTIONAL DEPTH: Every quote must target a specific psychological trigger in modern dating (mixed signals, silent boundaries, unrequited effort, need for reassurance).',
      '2. ' + forbidden,
      '3. ' + toneRule,
      '4. LENGTH: Random each time — sometimes short (3-5 words), sometimes medium (1-2 sentences), sometimes longer (3-4 sentences). Mix it up.',
      '5. MOOD: Must match the assigned mood. Make it feel real and relatable.',
      '6. NO emojis, quotes, or hashtags in the quote text.',
      '',
      ...examples,
      'BAD examples (cringe, AI-like, robotic):',
      '- Wahai kekasihku, engkaulah permata hatiku.',
      '- Cinta adalah anugerah terindah dalam hidup.',
      '- Love is the most beautiful thing in the universe.',
      '',
      'Return JSON:',
      JSON.stringify({
        text: 'Quote tanpa emoji, tanpa tanda kutip, sesuai mood ' + randomMood + '. Bisa pendek 1 kata atau panjang 4 kalimat ga selalu medium atau long saja.',
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
