const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

// Rate Limiting (Basic in-memory for proxy)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 5;

const checkRateLimit = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  if (rateLimit.has(ip)) {
    const userRequests = rateLimit.get(ip);
    const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
    if (recentRequests.length >= MAX_REQUESTS) {
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }
    recentRequests.push(now);
    rateLimit.set(ip, recentRequests);
  } else {
    rateLimit.set(ip, [now]);
  }
  next();
};

const predictionsDb = new Map();

app.post('/api/generate', checkRateLimit, async (req, res) => {
  try {
    const { image, style } = req.body; // Expecting image to be base64 Data URI

    if (!image || !style) {
      return res.status(400).json({ error: 'Image and style are required.' });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      console.warn("REPLICATE_API_TOKEN is not set.");
      const dummyId = `dummy_${Date.now()}`;
      predictionsDb.set(dummyId, {
        status: 'succeeded',
        output: ['https://via.placeholder.com/512x512.png?text=' + encodeURIComponent(style)]
      });
      return res.json({ predictionId: dummyId });
    }

    // Return prediction ID immediately so client can poll, processing async
    const predictionId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    predictionsDb.set(predictionId, { status: 'processing', output: [] });
    res.json({ predictionId });

    // --- Async Generation Pipeline ---
    (async () => {
      try {
        // Build style transformation prompt
        let stylePrompt = '';
        switch (style.toLowerCase()) {
          case 'cartoon':
            stylePrompt = 'Transform this into a vibrant Pixar/Disney 3D cartoon style. Keep the person\'s face and features recognizable. Bold colors, smooth shading, expressive cartoon aesthetic.';
            break;
          case 'anime':
            stylePrompt = 'Transform this into a beautiful anime illustration style. Studio Ghibli aesthetic, large expressive eyes, clean lines, soft watercolor shading, keep the person recognizable.';
            break;
          case 'pixel art':
            stylePrompt = 'Transform this into retro 16-bit pixel art style. Sharp pixels, limited color palette, classic video game aesthetic. Keep the subject recognizable.';
            break;
          case 'sketch':
            stylePrompt = 'Transform this into a detailed pencil sketch. Black and white, fine crosshatching, artistic charcoal/graphite texture, expressive hand-drawn lines.';
            break;
          case 'flat illustration':
            stylePrompt = 'Transform this into a clean flat vector illustration. Minimalist design, solid bold colors, no gradients, modern graphic design aesthetic.';
            break;
          default:
            stylePrompt = `Transform this image into a ${style} style artwork. High quality, artistic, detailed.`;
        }

        const Replicate = require('replicate');
        const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

        const input = {
          prompt: stylePrompt,
          input_image: image,       // flux-kontext-pro accepts base64 data URIs directly
          output_format: 'jpg',
          safety_tolerance: 2,
        };

        const output = await replicate.run('black-forest-labs/flux-kontext-pro', { input });

        // Extract URL from output — flux-kontext-pro returns a FileOutput object
        let imageUrl = '';
        if (output && typeof output.url === 'function') {
          imageUrl = await output.url();
          imageUrl = imageUrl.toString();
        } else if (Array.isArray(output) && output.length > 0) {
          const item = output[0];
          imageUrl = typeof item.url === 'function' ? (await item.url()).toString() : String(item);
        } else if (typeof output === 'string') {
          imageUrl = output;
        } else {
          imageUrl = String(output);
        }

        if (!imageUrl) throw new Error('No image URL returned by Replicate');

        console.log('Generation succeeded:', imageUrl);
        predictionsDb.set(predictionId, { status: 'succeeded', output: [imageUrl] });
      } catch (err) {
        console.error('Async Generation Pipeline Error:', err.message);
        predictionsDb.set(predictionId, {
          status: 'failed',
          error: err.message,
        });
      }
    })();

  } catch (error) {
    console.error("Error starting generation:", error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate image', details: error.response?.data || error.message });
  }
});

app.get('/api/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prediction = predictionsDb.get(id);

    if (!prediction) {
      if (!process.env.REPLICATE_API_TOKEN) {
        return res.json({ status: 'succeeded', output: ['https://via.placeholder.com/512x512.png?text=Generated'] });
      }
      return res.status(404).json({ error: 'Prediction not found' });
    }

    res.json({ status: prediction.status, output: prediction.output, error: prediction.error });
  } catch (error) {
    console.error("Error fetching status:", error.message);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

app.listen(port, () => {
  console.log(`Backend proxy running on port ${port}`);
});
