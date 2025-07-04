#!/bin/bash

echo "🚀 StyleAgent FLUX.1 Quick Install"
echo "=================================="

# Create models directory
mkdir -p /Users/kaiyakramer/styleagent/models/diffusion

# Activate virtual environment
cd /Users/kaiyakramer/styleagent/stable-diffusion-webui
source venv/bin/activate

# Install huggingface-cli if not present
pip install -q huggingface_hub

echo "📥 Starting FLUX.1 model download in background..."
echo "This will take 20-30 minutes for ~25GB download"

# Start background download of FLUX.1 schnell (faster, smaller)
nohup huggingface-cli download black-forest-labs/FLUX.1-schnell \
  --local-dir /Users/kaiyakramer/styleagent/models/diffusion/flux-schnell \
  --local-dir-use-symlinks False > flux_download.log 2>&1 &

FLUX_PID=$!
echo "📥 FLUX.1 downloading in background (PID: $FLUX_PID)"

# Also start SDXL Juggernaut XL download
nohup huggingface-cli download RunDiffusion/Juggernaut-XL-v9 \
  --local-dir /Users/kaiyakramer/styleagent/models/diffusion/juggernaut-xl \
  --local-dir-use-symlinks False > juggernaut_download.log 2>&1 &

SDXL_PID=$!
echo "📥 SDXL Juggernaut XL downloading in background (PID: $SDXL_PID)"

echo ""
echo "✅ Downloads started! While they run, we'll set up the enhanced prompts."
echo ""
echo "📊 To check download progress:"
echo "   tail -f flux_download.log"
echo "   tail -f juggernaut_download.log"
echo ""
echo "📁 Models will be saved to:"
echo "   /Users/kaiyakramer/styleagent/models/diffusion/"