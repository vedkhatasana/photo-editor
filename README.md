# 🖼️ Photo Editor Web App

## ✨ Features

- **9 Real-time Filters** — Brightness, Contrast, Saturation, Hue Rotation, Blur, Grayscale, Sepia, Opacity, Invert
- **10 One-click Presets** — Vintage, Cinematic, B&W, Cold, Warm, Dramatic, Soft Glow, Nightmare, Faded
- **Image Transformations** — Flip horizontal, Flip vertical, Rotate 90°, Zoom in/out
- **Drag & Drop Upload** — Drop any image directly onto the canvas
- **Live Slider UI** — Each filter shows real-time value as you drag
- **PNG Download** — Export your edited image instantly
- **Dark Theme UI** — Clean, modern interface inspired by professional editors

---

## 🛠️ Built With

- HTML5 Canvas API
- CSS3 (Custom Properties, Flexbox, Grid)
- Vanilla JavaScript (ES6+)
- RemixIcon

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/vedkhatasana/photo-editor.git

# Open in browser
cd photo-editor
open index.html
```

No install needed. Just open `index.html` in any modern browser.

---

## 📁 Project Structure

```
photo-editor/
├── index.html      # App structure
├── style.css       # Layout and component styles
├── theme.css       # CSS variables and design tokens
└── script.js       # Canvas logic, filters, presets
```

---

## 💡 How It Works

- Filters are applied via `canvasCtx.filter` using CSS filter functions
- **Opacity** uses `canvasCtx.globalAlpha` (not supported in canvas filter string)
- **Invert** uses pixel-level manipulation via `getImageData` / `putImageData`
- **Transformations** (flip, rotate) use canvas matrix methods: `translate`, `scale`, `rotate`
- Presets update all filter values at once and re-render the canvas

---

## 📸 Screenshots

> Add screenshots here after deploying

---

## 👤 Author

**Ved Patel**
- GitHub: [@vedkhatasana](https://github.com/vedkhatasana)
- LinkedIn: [ved-patel-a7989b2a7](https://linkedin.com/in/ved-patel-a7989b2a7)
