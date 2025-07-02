# 🎨 Photo-Realistic Outfit Generation Setup Guide

StyleAgent now supports **photo-realistic outfit generation** using local Stable Diffusion! This guide will help you set up the pipeline to generate beautiful, realistic outfit images like StyleMuse.

## 🎯 What You'll Get

- **Photo-realistic outfit images** instead of stick-figure SVGs
- **Multiple style variations** (flat lay, model shots, product photography)
- **AI-enhanced prompts** using TinyLlama for better descriptions
- **Local generation** - complete privacy and control
- **Automatic fallback** to SVG if Stable Diffusion isn't available

## 📋 Prerequisites

- **GPU with 6-8GB VRAM** (recommended for optimal performance)
- **Python 3.8+** 
- **Git**
- **15-20GB free disk space** (for models and software)

## 🚀 Installation Steps

### Step 1: Install Automatic1111 WebUI

```bash
# Clone the repository
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui

# Install (this will download Python dependencies and a base model)
# On macOS/Linux:
./webui.sh

# On Windows:
./webui-user.bat
```

### Step 2: Download Fashion-Optimized Models

Place these models in `stable-diffusion-webui/models/Stable-diffusion/`:

**Recommended Models:**
1. **Realistic Vision** - Great for realistic fashion photography
   - Download: [Realistic Vision v6.0](https://civitai.com/models/4201/realistic-vision-v60-b1)

2. **Deliberate** - Versatile for various styles  
   - Download: [Deliberate v2](https://civitai.com/models/4823/deliberate)

3. **DreamShaper** - Good for artistic fashion shots
   - Download: [DreamShaper 8](https://civitai.com/models/4384/dreamshaper)

### Step 3: Start WebUI with API

**Important:** Start with the `--api` flag to enable StyleAgent integration:

```bash
# Navigate to your stable-diffusion-webui folder
cd path/to/stable-diffusion-webui

# Start with API enabled
./webui.sh --api

# Or on Windows:
./webui-user.bat --api
```

The WebUI should start at `http://127.0.0.1:7860`

### Step 4: Verify Setup

1. **Check WebUI**: Open http://127.0.0.1:7860 in your browser
2. **Test API**: Visit http://127.0.0.1:7860/docs to see API documentation
3. **Start StyleAgent**: Run `npm run dev` - you should see:
   ```
   🎨 PhotoRealistic Visualizer initialized successfully
   ```

## 🎨 Using Photo-Realistic Generation

Once set up, StyleAgent will automatically:

1. **Try photo-realistic generation first** when creating outfits
2. **Use TinyLlama** to create detailed, professional prompts
3. **Generate realistic images** via Stable Diffusion
4. **Fall back to SVG** if Stable Diffusion isn't available

### Generation Styles Available:

- **Flat Lay**: Professional product photography style
- **Model**: Outfits worn by models
- **Product**: E-commerce style photography

## ⚙️ Configuration Options

### Default Settings (Optimized for Fashion):
- **Resolution**: 512x512 (fast generation)
- **Steps**: 20 (good quality/speed balance)  
- **CFG Scale**: 7 (follows prompts well)
- **Sampler**: DPM++ 2M Karras (high quality)

### Performance Tips:
- **Lower resolution** for faster generation (256x256)
- **Reduce steps** to 10-15 for speed
- **Use smaller models** if VRAM is limited

## 🔧 Troubleshooting

### Common Issues:

**"PhotoRealistic Visualizer not available"**
- ✅ Ensure Automatic1111 is running with `--api` flag
- ✅ Check http://127.0.0.1:7860 is accessible
- ✅ No firewall blocking port 7860

**"Out of memory" errors**
- ✅ Lower resolution to 256x256 or 384x384
- ✅ Reduce batch size to 1
- ✅ Close other GPU-intensive applications
- ✅ Try `--lowvram` flag when starting WebUI

**Slow generation**
- ✅ Reduce steps to 10-15
- ✅ Use smaller, optimized models
- ✅ Enable xformers: `--xformers` flag

**Poor quality images**
- ✅ Try different models (RealisticVision recommended)
- ✅ Increase steps to 25-30
- ✅ Adjust CFG scale (try 5-9 range)

## 🎯 Advanced Usage

### Custom Model Setup:
1. Download `.safetensors` model files
2. Place in `stable-diffusion-webui/models/Stable-diffusion/`
3. Restart WebUI
4. Select model in StyleAgent settings (when available)

### Prompt Engineering:
StyleAgent uses TinyLlama to automatically generate optimized prompts, but you can enhance them by:
- Adding specific fashion brands to your wardrobe items
- Including detailed material descriptions
- Setting specific occasions and moods

## 🚧 Fallback Behavior

**StyleAgent is designed to always work**, even without Stable Diffusion:

- ✅ **Stable Diffusion available**: Photo-realistic images
- ✅ **Stable Diffusion unavailable**: Graceful fallback to SVG
- ✅ **No interruption**: Outfit generation continues regardless

## 📞 Support

If you encounter issues:

1. **Check logs** in the terminal running StyleAgent
2. **Verify API** at http://127.0.0.1:7860/docs
3. **Test simple generation** in WebUI interface first
4. **Check GPU resources** (Activity Monitor/Task Manager)

## 🎉 What's Next?

Once you have photo-realistic generation working:
- Experiment with different models for various styles
- Try different resolutions and quality settings
- Generate outfit variations for the same items
- Enjoy beautiful, realistic outfit visualizations!

---

**Remember**: The goal is to work smarter, not harder! This setup gives you StyleMuse-quality results while keeping everything local and private. 🎨✨