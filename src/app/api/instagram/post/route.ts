import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateUploadSignature, deleteMultipleCloudinaryImages } from '@/lib/cloudinary.action';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function getToken(account = 'main'): Promise<string> {
  if (account === 'kinetics') return (process.env.IG_TOKEN_KINETICS || '').trim();
  const { data } = await supabase.from('app_settings').select('value').eq('key', 'ig_access_token').maybeSingle();
  if (data?.value) return data.value;
  return (process.env.IG_ACCESS_TOKEN || '').trim();
}

function getUserId(account = 'main'): string {
  return account === 'kinetics' ? process.env.IG_ACCOUNT_KINETICS! : process.env.IG_ACCOUNT_ID!;
}

export async function POST(req: Request) {
  try {
    const { imageDataUrls, caption, mediaType, videoDataUrl, videoUrl: incomingVideoUrl, audioId, audioVolume, videoVolume, account = 'main', userTags } = await req.json();
    const token = await getToken(account);
    const userId = getUserId(account);
    if (!token || !userId) return NextResponse.json({ error: 'IG account not configured' }, { status: 400 });
    const api = 'https://graph.instagram.com/v25.0';

    if (mediaType === 'REELS' || mediaType === 'IMAGE' || (!mediaType && videoDataUrl)) {
      const isReels = mediaType === 'REELS';
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
      let finalUrl = incomingVideoUrl || '';
      const rawData = videoDataUrl || (mediaType === 'IMAGE' ? imageDataUrls?.[0] : null);

      const uploadToCloudinary = async (fileData: string, resourceType: 'image' | 'video'): Promise<{ url: string; publicId: string }> => {
        const isBase64 = fileData.startsWith('data:');
        const buffer = Buffer.from(
          isBase64 ? fileData.replace(/^data:image\/\w+;base64,/, '').replace(/^data:video\/\w+;base64,/, '') : fileData,
          isBase64 ? 'base64' : 'utf-8'
        );
        const { timestamp, signature } = await generateUploadSignature('instagram-posts');
        const fd = new FormData();
        fd.append('file', new Blob([buffer], { type: resourceType === 'video' ? 'video/mp4' : 'image/png' }), `post.${resourceType === 'video' ? 'mp4' : 'png'}`);
        fd.append('api_key', apiKey!);
        fd.append('signature', signature);
        fd.append('timestamp', timestamp.toString());
        fd.append('folder', 'instagram-posts');
        const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
        const res = await fetch(endpoint, { method: 'POST', body: fd });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        return { url: json.secure_url, publicId: json.public_id };
      };

      if (!finalUrl && rawData) {
        const result = await uploadToCloudinary(rawData, 'image');
        finalUrl = result.url;
      }
      if (!finalUrl) return NextResponse.json({ error: 'No image/video URL' }, { status: 400 });

      if (isReels) {
        try {
          const { timestamp, signature } = await generateUploadSignature('instagram-reels');
          const vidForm = new FormData();
          vidForm.append('file', finalUrl);
          vidForm.append('api_key', apiKey!);
          vidForm.append('signature', signature);
          vidForm.append('timestamp', timestamp.toString());
          vidForm.append('folder', 'instagram-reels');
          vidForm.append('eager', 'f_mp4,du_5,ac_aac,af_22050');
          const vidRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, { method: 'POST', body: vidForm });
          if (!vidRes.ok) {
            console.error('Video upload failed', await vidRes.text());
          } else {
            const vidData = await vidRes.json();
            if (vidData.eager?.[0]?.secure_url) {
              finalUrl = vidData.eager[0].secure_url;
            } else if (vidData.eager?.[0]?.url) {
              finalUrl = vidData.eager[0].url;
            } else if (vidData.secure_url) {
              finalUrl = vidData.secure_url.replace(/\.\w+$/, '.mp4');
            }
            await new Promise(r => setTimeout(r, 3000));
          }
        } catch {}
      }

      for (const mt of isReels ? ['REELS', 'IMAGE'] : ['IMAGE']) {
        const body: Record<string, unknown> = mt === 'REELS'
          ? { media_type: 'REELS', video_url: finalUrl, caption }
          : { media_type: 'IMAGE', image_url: finalUrl, caption, ...(userTags?.length ? { user_tags: userTags } : {}) };

        if (mt === 'REELS' && audioId) {
          body.audio_configuration = { audio_id: audioId, audio_volume: 100, video_volume: 0 };
        }

        let createRes = await fetch(`${api}/${userId}/media?access_token=${token}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        let createData = await createRes.json();
        if (!createRes.ok && body.user_tags) {
          delete body.user_tags;
          createRes = await fetch(`${api}/${userId}/media?access_token=${token}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          createData = await createRes.json();
        }
        if (!createRes.ok) {
          if (mt === 'REELS' && ['REELS', 'IMAGE'].includes(mediaType || '')) continue;
          throw new Error(createData.error?.message || `${mt} creation failed`);
        }

        let pubData: Record<string, unknown> | null = null;
        for (let attempt = 0; attempt < 5; attempt++) {
          await new Promise(r => setTimeout(r, attempt === 0 ? 3000 : 5000));
          const pubRes = await fetch(`${api}/${userId}/media_publish?access_token=${token}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ creation_id: createData.id }),
          });
          pubData = await pubRes.json();
          if (pubRes.ok) break;
          if (attempt < 4) console.log(`Publish attempt ${attempt + 1} failed, retrying...`);
        }
        if (!pubData?.id) {
          if (mt === 'REELS') { console.log('REELS publish failed after retries, fallback to IMAGE'); continue; }
          throw new Error((pubData as { error?: { message?: string } })?.error?.message || `${mt} publish failed`);
        }

        return NextResponse.json({ success: true, mediaId: pubData.id, type: mt.toLowerCase(), account });
      }
      throw new Error('Failed to create media');
    }

    if (!imageDataUrls?.length || !caption)
      return NextResponse.json({ error: 'imageDataUrls[] and caption required' }, { status: 400 });

    const urls = imageDataUrls.slice(0, 10);
    const publicUrls: string[] = [];
    for (let i = 0; i < urls.length; i++) {
      const isBase64 = urls[i].startsWith('data:');
      const buffer = Buffer.from(isBase64 ? urls[i].replace(/^data:image\/\w+;base64,/, '') : urls[i], isBase64 ? 'base64' : 'utf-8');
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
      const { timestamp, signature } = await generateUploadSignature('instagram-posts');
      const formData = new FormData();
      formData.append('file', new Blob([buffer], { type: 'image/png' }), `instagram-post-${i}.png`);
      formData.append('api_key', apiKey!);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());
      formData.append('folder', 'instagram-posts');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Cloudinary upload failed');
      publicUrls.push(data.secure_url);
    }

    if (publicUrls.length === 1) {
      const createRes = await fetch(`${api}/${userId}/media?access_token=${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: publicUrls[0], caption }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error?.message || 'Media creation failed');

      const pubRes = await fetch(`${api}/${userId}/media_publish?access_token=${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: createData.id }),
      });
      const pubData = await pubRes.json();
      if (!pubRes.ok) throw new Error(pubData.error?.message || 'Publish failed');

      try { await deleteMultipleCloudinaryImages(publicUrls); } catch {}
      return NextResponse.json({ success: true, mediaId: pubData.id, urls: publicUrls, account });
    }

    const childIds: string[] = [];
    for (const url of publicUrls) {
      const res = await fetch(`${api}/${userId}/media?access_token=${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: url, is_carousel_item: true }),
      });
      const data = await res.json();
      if (!res.ok) { console.error('Carousel item failed, falling back:', data); break; }
      childIds.push(data.id);
    }

    if (childIds.length < 2) {
      const singleRes = await fetch(`${api}/${userId}/media?access_token=${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: publicUrls[0], caption }),
      });
      const singleData = await singleRes.json();
      if (!singleRes.ok) throw new Error(singleData.error?.message || 'Single media creation failed');

      const pubRes = await fetch(`${api}/${userId}/media_publish?access_token=${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: singleData.id }),
      });
      const pubData = await pubRes.json();
      if (!pubRes.ok) throw new Error(pubData.error?.message || 'Publish failed');
      try { await deleteMultipleCloudinaryImages(publicUrls); } catch {}
      return NextResponse.json({ success: true, mediaId: pubData.id, urls: publicUrls.slice(0, 1) });
    }

    let carData;
    for (let attempt = 0; attempt < 3; attempt++) {
      const carRes = await fetch(`${api}/${userId}/media?access_token=${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_type: 'CAROUSEL', children: childIds, caption }),
      });
      carData = await carRes.json();
      if (carRes.ok) break;
      await new Promise(r => setTimeout(r, 2000));
    }
    if (!carData?.id) throw new Error(carData?.error?.message || 'Carousel creation failed');

    let pubData;
    for (let attempt = 0; attempt < 3; attempt++) {
      const pubRes = await fetch(`${api}/${userId}/media_publish?access_token=${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: carData.id }),
      });
      pubData = await pubRes.json();
      if (pubRes.ok) break;
      await new Promise(r => setTimeout(r, 3000));
    }
    if (!pubData?.id) throw new Error(pubData?.error?.message || 'Publish failed');

    try { await deleteMultipleCloudinaryImages(publicUrls); } catch {}
    return NextResponse.json({ success: true, mediaId: pubData.id, urls: publicUrls, childCount: childIds.length });
  } catch (e) {
    console.error('Instagram post error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to post' }, { status: 500 });
  }
}
