import { POST_TEMPLATES, POST_DIMENSIONS } from './constants';
import { PostData, GeneratedPost } from '../types/event';

export async function generatePostImages(postData: PostData): Promise<GeneratedPost[]> {
  const results: GeneratedPost[] = [];
  const template = POST_TEMPLATES[postData.template as keyof typeof POST_TEMPLATES];
  
  if (!template) {
    throw new Error(`Template "${postData.template}" not found. Available templates: ${Object.keys(POST_TEMPLATES).join(', ')}`);
  }
  
  const mainCanvas = document.createElement('canvas');
  mainCanvas.width = POST_DIMENSIONS.main.width;
  mainCanvas.height = POST_DIMENSIONS.main.height;
  const mainCtx = mainCanvas.getContext('2d');
  
  if (!mainCtx) throw new Error('Could not create canvas context');
  
  const mainTemplate = await loadImage(template.main);
  mainCtx.drawImage(mainTemplate, 0, 0);
  
  mainCtx.fillStyle = template.textColor;
  mainCtx.font = POST_DIMENSIONS.main.title.font;
  mainCtx.textBaseline = 'top';
  
  const fontSize = parseInt(POST_DIMENSIONS.main.title.font.match(/\d+/)?.[0] || '24');
  const lineHeight = fontSize * 1.35;
  const titleX = POST_DIMENSIONS.main.title.x;
  let currentY = POST_DIMENSIONS.main.title.y;
  const maxWidth = POST_DIMENSIONS.main.title.maxWidth;
  
  const words = postData.title.trim().split(/\s+/);
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(' ');
  const line2 = words.slice(mid).join(' ') || ' ';
  
  [line1, line2].forEach(text => {
    if (!text.trim()) {
      currentY += lineHeight;
      return;
    }
    const parts = text.split(' ');
    let line = '';
    for (let i = 0; i < parts.length; i++) {
      const testLine = line ? `${line} ${parts[i]}` : parts[i];
      if (mainCtx.measureText(testLine).width > maxWidth && line) {
        mainCtx.fillText(line, titleX, currentY);
        currentY += lineHeight;
        line = parts[i];
      } else {
        line = testLine;
      }
    }
    if (line) {
      mainCtx.fillText(line, titleX, currentY);
      currentY += lineHeight;
    }
  });
  
  mainCtx.fillStyle = template.categoryBg;
  mainCtx.font = POST_DIMENSIONS.main.category.font;
  
  const categoryMetrics = mainCtx.measureText(postData.category);
  const categoryWidth = categoryMetrics.width + 40; 
  const categoryHeight = parseInt(POST_DIMENSIONS.main.category.font) + 12; 
  
  mainCtx.fillRect(
    POST_DIMENSIONS.main.category.x,
    POST_DIMENSIONS.main.category.y,
    categoryWidth,
    categoryHeight
  );
  
  mainCtx.fillStyle = template.categoryText;
  mainCtx.fillText(
    postData.category,
    POST_DIMENSIONS.main.category.x + 20, 
    POST_DIMENSIONS.main.category.y + 6 
  );
  
  if (postData.images.length > 0) {
    const firstImage = await loadImage(URL.createObjectURL(postData.images[0]));
    const { x, y, width, height, border } = POST_DIMENSIONS.main.image;
    
    const sourceAspect = firstImage.width / firstImage.height;
    const targetAspect = width / height;
    
    let sourceWidth, sourceHeight;
    const sourceX = 0;
    const sourceY = 0; 
    
    if (sourceAspect > targetAspect) {
      sourceHeight = firstImage.height;
      sourceWidth = sourceHeight * targetAspect;
    } else {
      sourceWidth = firstImage.width;
      sourceHeight = sourceWidth / targetAspect;
    }
    
    mainCtx.drawImage(
      firstImage,
      sourceX, sourceY, sourceWidth, sourceHeight,
      x, y, width, height 
    );
    
    mainCtx.strokeStyle = template.borderColor;
    mainCtx.lineWidth = border;
    mainCtx.strokeRect(x, y, width, height);
  }
  
  results.push({
    url: mainCanvas.toDataURL('image/png', 1.0),
    pageNumber: 1
  });
  
  const imagesToProcess = postData.images.length === 1 
    ? [postData.images[0]] 
    : postData.images;
  
  for (let i = 0; i < imagesToProcess.length; i++) {
    const contentCanvas = document.createElement('canvas');
    contentCanvas.width = POST_DIMENSIONS.content.width;
    contentCanvas.height = POST_DIMENSIONS.content.height;
    const contentCtx = contentCanvas.getContext('2d');
    
    if (!contentCtx) continue;
    
    const contentTemplate = await loadImage(template.content);
    contentCtx.drawImage(contentTemplate, 0, 0);
    
    const image = await loadImage(URL.createObjectURL(imagesToProcess[i]));
    const { maxWidth, maxHeight, border } = POST_DIMENSIONS.content.image;
    
    const aspectRatio = image.width / image.height;
    let drawWidth = maxWidth;
    let drawHeight = maxWidth / aspectRatio;
    
    if (drawHeight > maxHeight) {
      drawHeight = maxHeight;
      drawWidth = maxHeight * aspectRatio;
    }
    
    const x = (POST_DIMENSIONS.content.width - drawWidth) / 2;
    const y = (POST_DIMENSIONS.content.height - drawHeight) / 2;
    
    contentCtx.drawImage(image, x, y, drawWidth, drawHeight);
    
    contentCtx.strokeStyle = template.borderColor;
    contentCtx.lineWidth = border;
    contentCtx.strokeRect(x, y, drawWidth, drawHeight);
    
    results.push({
      url: contentCanvas.toDataURL('image/png', 1.0),
      pageNumber: i + 2
    });
  }
  
  return results;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}