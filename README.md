# Clipart Studio 🎨

A production-quality Android application that transforms user photos into stunning AI-generated clipart artwork. Built with React Native (Expo) and a custom Node.js/Express backend hitting the Replicate API.

## 🔗 Submission Links
* **[📱 APK Download (Google Drive)](#)** https://drive.google.com/file/d/1-su_X56D4SPlGKyYzMsydxOkw8rWFkdY/view?usp=sharing
* **[🎥 Screen Recording](#)** https://drive.google.com/file/d/19Qltb7JSzWMzhy9PoD4MQQq1zMfLPV91/view?usp=sharing

---

## 🛠️ Features
- **Universal Capture**: Take a new photo or select one from the gallery.
- **5 Premium Art Styles**: Cartoon 3D, Anime, Pixel Art, Pencil Sketch, Flat Vector.
- **AI-Powered**: Uses `black-forest-labs/flux-kontext-pro` for true image-to-image AI styling.
- **Save & Share**: Native integration to download images to device gallery or use the Android share sheet.
- **Premium UI/UX**: Custom typography, dynamic animations, gradient backgrounds, and soft modern shadows.

---

## 🏗️ Technical Decisions & Architecture

### Frontend (React Native + Expo)
- **Expo Framework**: Chosen for rapid iteration and built-in access to device capabilities (`expo-camera`, `expo-image-picker`, `expo-media-library`, `expo-sharing`).
- **Style Overlays & Animations**: Used React Native's built-in `Animated` API instead of heavy third-party animation libraries to ensure smooth 60fps performance during processing states and UI transitions.
- **Local Image Compression**: Used `expo-image-manipulator` to downscale and compress images client-side before sending them to the backend. This drastically reduces payload size, prevents `413 Payload Too Large` errors, and saves user bandwidth.

### Backend (Node.js + Express)
- **Proxy Server**: Built a lightweight Express proxy to securely handle requests to the Replicate API, keeping API keys completely hidden from the client codebase.
- **Asynchronous Processing**: The Replicate image-to-image model can take ~10-40 seconds to process. The backend immediately returns a `predictionId`, and the frontend polls for the result, avoiding HTTP timeout crashes.
- **Vercel Deployment**: The backend is completely serverless via Vercel (`vercel.json`), providing autoscaling out-of-the-box and uncoupling the Android app from localhost networking.

---

## ⚖️ Tradeoffs Made

1. **Polling vs. WebSockets**: I opted for a simple REST polling mechanism (client checks status every 2 seconds) rather than setting up a persistent WebSocket connection. WebSockets provide real-time updates but introduce significant backend complexity and scaling challenges, which were unnecessary for a simple asynchronous generation flow.
2. **Replicate vs. On-Device AI**: Running a large diffusion model locally on the phone is impossible for older hardware. Sending images to a cloud GPU (Replicate) introduces network dependency but guarantees high-quality, fast results across all supported Android devices.
3. **Expo Go vs. Bare React Native**: I used Managed Expo to avoid dealing with complex native Android gradle builds until the very end (via EAS Build), allowing for faster UI iteration.

---

## 💻 Setup & Installation (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/vsafedot/Clipart.git
cd Clipart
```

### 2. Setup Backend
```bash
cd backend
npm install
# Create a .env file and add your REPLICATE_API_TOKEN
node server.js
```

### 3. Setup Frontend
```bash
cd ../app
npm install
# Start the Expo development server
npx expo start
```

*(To test on a physical Android device, use the Expo Go app and scan the QR code).*
