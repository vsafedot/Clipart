const axios = require('axios');

async function test() {
  const apiKey = 'AIzaSyAmvqE--9Lp9RcFg2ImZUXKhOQIxfNcqHw';
  
  // Test Gemini Flash for description
  try {
    const chatRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: "Hello, reply with just 'OK'" }] }]
      }
    );
    console.log("Gemini 1.5 Flash works:", chatRes.data.candidates[0].content.parts[0].text);
  } catch(e) {
    console.log("Gemini Flash failed:", e.response?.data || e.message);
  }

  // Test Imagen 3
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
      {
        instances: [{ prompt: "A 16-bit pixel art of a dog" }],
        parameters: { sampleCount: 1 }
      }
    );
    console.log("Imagen 3 works, output string length:", res.data.predictions?.[0]?.bytesBase64Encoded?.length || 'no output');
  } catch(e) {
    console.log("Imagen 3 failed:", e.response?.data || e.message);
  }
}
test();
