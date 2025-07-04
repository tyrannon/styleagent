#!/bin/bash

echo "🎨 Installing Open Source High-Quality Models"
echo "============================================="

# Create models directory
mkdir -p /Users/kaiyakramer/styleagent/models/diffusion

# Activate virtual environment
cd /Users/kaiyakramer/styleagent/stable-diffusion-webui
source venv/bin/activate

echo "📥 Installing open, high-quality models..."

# 1. SDXL Juggernaut XL v9 - Excellent fashion photography
echo "📥 Downloading SDXL Juggernaut XL v9 (Fashion Photography)..."
nohup huggingface-cli download RunDiffusion/Juggernaut-XL-v9 \
  --local-dir /Users/kaiyakramer/styleagent/models/diffusion/juggernaut-xl \
  --local-dir-use-symlinks False > juggernaut_download.log 2>&1 &

# 2. RealVisXL V4.0 - Amazing for realistic humans
echo "📥 Downloading RealVisXL V4.0 (Realistic Humans)..."
nohup huggingface-cli download SG161222/RealVisXL_V4.0 \
  --local-dir /Users/kaiyakramer/styleagent/models/diffusion/realvis-xl \
  --local-dir-use-symlinks False > realvis_download.log 2>&1 &

# 3. SDXL Lightning - Ultra fast generation
echo "📥 Downloading SDXL Lightning (Speed)..."
nohup huggingface-cli download ByteDance/SDXL-Lightning \
  --local-dir /Users/kaiyakramer/styleagent/models/diffusion/sdxl-lightning \
  --local-dir-use-symlinks False > lightning_download.log 2>&1 &

echo ""
echo "✅ Downloads started for 3 amazing models!"
echo ""
echo "📊 Check progress with:"
echo "   tail -f juggernaut_download.log"
echo "   tail -f realvis_download.log" 
echo "   tail -f lightning_download.log"
echo ""
echo "🚀 These models will give us incredible quality!"
echo "   • Juggernaut XL: Professional fashion photography"
echo "   • RealVisXL: Ultra-realistic human faces"
echo "   • SDXL Lightning: Super fast generation"