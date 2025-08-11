import { NextResponse } from 'next/server';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Extracts the average RGB values from an image URL.
 * @param {string} url - The URL of the image.
 * @returns {Promise<number[]>} - A promise that resolves to an array containing the average RGB values.
 */
const extractAverageRGB = async (url) => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const img = await loadImage(Buffer.from(arrayBuffer));
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 200, 200);

  const imageData = ctx.getImageData(0, 0, 200, 200);
  const data = imageData.data; // Uint8ClampedArray in RGBA order

  let r = 0, g = 0, b = 0;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  const pixelCount = data.length / 4;
  r = Math.round(r / pixelCount);
  g = Math.round(g / pixelCount);
  b = Math.round(b / pixelCount);

  return [r, g, b];
};


// File-based storage (JSON Lines)
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'rgb.jsonl');

/**
 * Appends an RGB record to the JSON Lines file.
 */
const appendRGBToFile = async (avgRGB) => {
  const timestamp = new Date().toISOString();
  const record = { timestamp, rgb: avgRGB };
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(DATA_FILE, `${JSON.stringify(record)}\n`, 'utf8');
};

/**
 * Reads all RGB records from the JSON Lines file.
 */
const readAllRGBFromFile = async () => {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf8');
    const lines = content.split('\n');
    const records = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        records.push(JSON.parse(trimmed));
      } catch (_e) {
        // Ignore partially written or corrupt lines
      }
    }
    return records;
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

/**
 * Handles the GET request to fetch stored RGB data from the local file.
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
      await appendRGBToFile(avgRGB);
      return NextResponse.json({ success: true });
    }

    const rgbData = await readAllRGBFromFile();
    return NextResponse.json(rgbData);
  } catch (error) {
    console.error('Error in GET /api/rgb:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Handles the POST request to extract RGB data from an image and append it to the local file.
 * @returns {Promise<Response>} - A response indicating success or failure.
 */
export async function POST() {
  try {
    const imageUrl = 'https://portlandweather.com/assets/images/cameras/PortlandSpiritLiveCam.jpeg';
    const avgRGB = await extractAverageRGB(imageUrl);
    await appendRGBToFile(avgRGB);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/rgb:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
