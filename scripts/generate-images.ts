/**
 * HAYAATI WEB TECHNOLOGY — BULK IMAGE GENERATION SCRIPT
 *
 * PURPOSE:
 * Run ONCE on the site owner's computer to generate all photorealistic `.webp`
 * images from prompts defined in data/future.ts and data/places.ts.
 *
 * NEVER RUN BY VISITORS. NEVER RUN AT PAGE LOAD.
 *
 * HOW TO RUN:
 * 1. Ensure GEMINI_API_KEY is set in your .env or environment.
 * 2. Run: npx tsx scripts/generate-images.ts
 */

import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { timelineEras, techCatalogue } from '../data/future';
import { placesData } from '../data/places';

interface ImageTask {
  id: string;
  targetPath: string;
  prompt: string;
  aspectRatio: '16:9' | '4:3' | '1:1' | '3:4' | '9:16';
}

// 1. Gather all tasks from data files
function gatherImageTasks(): ImageTask[] {
  const tasks: ImageTask[] = [];

  // Hero Image
  tasks.push({
    id: 'hero-main',
    targetPath: '/images/hero/hero-main.webp',
    prompt:
      'Cinematic wide-angle view of a futuristic metropolis in the year 2045 at twilight, towering crystalline hyperstructures with glowing amber and cyan accents, subtle atmospheric haze, autonomous transit sky-corridors in the distance, high-end film still photography, photorealistic, natural lighting, ultra-detailed architectural textures, 8k resolution, no text, no logos, no watermark, no cartoon, no CGI artifacts.',
    aspectRatio: '16:9',
  });

  // Era Banners
  for (const era of timelineEras) {
    tasks.push({
      id: `${era.id}-banner`,
      targetPath: era.bannerImage,
      prompt: era.bannerImagePrompt,
      aspectRatio: '16:9',
    });

    // Timeline Cards
    for (const card of era.cards) {
      if (!tasks.some((t) => t.targetPath === card.image)) {
        tasks.push({
          id: card.id,
          targetPath: card.image,
          prompt: card.imagePrompt,
          aspectRatio: '16:9',
        });
      }
    }
  }

  // Tech Catalogue Cards
  for (const card of techCatalogue) {
    if (!tasks.some((t) => t.targetPath === card.image)) {
      tasks.push({
        id: card.id,
        targetPath: card.image,
        prompt: card.imagePrompt,
        aspectRatio: '16:9',
      });
    }
  }

  // Cities & Places Cards
  for (const place of placesData) {
    if (!tasks.some((t) => t.targetPath === place.image)) {
      tasks.push({
        id: place.id,
        targetPath: place.image,
        prompt: place.imagePrompt,
        aspectRatio: '16:9',
      });
    }
  }

  return tasks;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('====================================================');
  console.log('HAYAATI WEB TECHNOLOGY — BULK IMAGE GENERATOR');
  console.log('====================================================\n');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY environment variable is missing.');
    console.error('Please export GEMINI_API_KEY="your-api-key" or add it to .env');
    process.exit(1);
  }

  const modelName = 'imagen-3.0-generate-002';
  const ai = new GoogleGenAI({ apiKey });

  const tasks = gatherImageTasks();
  console.log(`Identified ${tasks.length} total image specifications.\n`);

  let generatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const absolutePath = path.join(process.cwd(), 'public', task.targetPath);
    const progress = `[${i + 1}/${tasks.length}]`;

    // 1. Check if file already exists (Skip rule per Section 1)
    if (fs.existsSync(absolutePath)) {
      console.log(`${progress} [SKIP] Already exists: ${task.targetPath}`);
      skippedCount++;
      continue;
    }

    console.log(`${progress} [GENERATING] ${task.targetPath}...`);

    try {
      // Ensure target folder exists
      const dir = path.dirname(absolutePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 2. Call Image Generation Model
      const response = await ai.models.generateImages({
        model: modelName,
        prompt: task.prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: task.aspectRatio,
          outputMimeType: 'image/jpeg',
        },
      });

      const base64Bytes = response.generatedImages?.[0]?.image?.imageBytes;

      if (!base64Bytes) {
        throw new Error('No image bytes returned in API response.');
      }

      const buffer = Buffer.from(base64Bytes, 'base64');
      fs.writeFileSync(absolutePath, buffer);

      console.log(`   --> [SAVED] ${task.targetPath} (${Math.round(buffer.length / 1024)} KB)`);
      generatedCount++;

      // Pause briefly between calls to respect rate limits
      await sleep(2500);
    } catch (err: unknown) {
      console.error(`   --> [FAILED] ${task.targetPath}:`, err instanceof Error ? err.message : err);
      failedCount++;
      // Wait longer on error in case of rate limit
      await sleep(5000);
    }
  }

  console.log('\n====================================================');
  console.log('IMAGE GENERATION BATCH RUN COMPLETED');
  console.log(`Summary: Generated: ${generatedCount} | Skipped: ${skippedCount} | Failed: ${failedCount}`);
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
