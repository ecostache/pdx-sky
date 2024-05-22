import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { createCanvas, loadImage } from 'canvas';
import { kv } from '@vercel/kv';

/**
 * Extracts the average RGB values from an image URL.
 * @param {string} url - The URL of the image.
 * @returns {Promise<number[]>} - A promise that resolves to an array containing the average RGB values.
 */
const extractAverageRGB = async (url) => {
  const response = await fetch(url);
  const buffer = await response.buffer();
  const img = await loadImage(buffer);
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 200, 200);

  const imageData = ctx.getImageData(0, 0, 200, 200);
  const data = new Uint32Array(imageData.data.buffer);

  let r = 0, g = 0, b = 0;

  for (let i = 0; i < data.length; i++) {
    r += (data[i] & 0xFF);
    g += (data[i] >> 8) & 0xFF;
    b += (data[i] >> 16) & 0xFF;
  }

  const pixelCount = data.length;
  r = Math.round(r / pixelCount);
  g = Math.round(g / pixelCount);
  b = Math.round(b / pixelCount);

  return [r, g, b];
};


/**
 * Saves the average RGB data to the KV store.
 * @param {number[]} avgRGB - The average RGB values.
 */
const saveRGBToKV = async (avgRGB) => {
  const timestamp = new Date().toISOString();
  const rgbData = (await kv.get('rgbData')) || [];
  
  rgbData.push({
    timestamp,
    rgb: avgRGB
  });

  await kv.set('rgbData', rgbData);
};

/**
 * Handles the GET request to fetch stored RGB data.
 * @param {Request} request - The incoming request.
 * @returns {Promise<Response>} - A response containing the stored RGB data.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isCronJob = searchParams.get('cron') === 'true' || request.headers.get('x-cron-job') === 'true';

    if (isCronJob) {
      const imageUrl = 'https://portlandweather.com/assets/images/cameras/PortlandSpiritLiveCam.jpeg';
      const avgRGB = await extractAverageRGB(imageUrl);
      await saveRGBToKV(avgRGB);
      return NextResponse.json({ success: true });
    }

    const rgbData = (await kv.get('rgbData')) || [];
    return NextResponse.json(rgbData);
  } catch (error) {
    console.error('Error in GET /api/rgb:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Handles the POST request to extract RGB data from an image and save it to the KV store.
 * @returns {Promise<Response>} - A response indicating success or failure.
 */
export async function POST() {
  try {
    const imageUrl = 'https://portlandweather.com/assets/images/cameras/PortlandSpiritLiveCam.jpeg';
    const avgRGB = await extractAverageRGB(imageUrl);
    await saveRGBToKV(avgRGB);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/rgb:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
