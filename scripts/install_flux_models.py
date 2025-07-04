#!/usr/bin/env python3
"""
FLUX.1 Model Installation Script for StyleAgent
Downloads and sets up FLUX.1 [dev] and backup models for local generation
"""

import os
import sys
import subprocess
import json
from pathlib import Path
import requests
import time

def check_requirements():
    """Check if required packages are installed"""
    try:
        import torch
        import diffusers
        import transformers
        import huggingface_hub
        print("✅ All required packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing package: {e}")
        return False

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    packages = [
        "torch>=2.0.0",
        "diffusers>=0.30.0", 
        "transformers>=4.40.0",
        "huggingface-hub>=0.20.0",
        "accelerate>=0.26.0",
        "safetensors>=0.4.0",
        "Pillow>=9.0.0",
        "numpy>=1.21.0"
    ]
    
    for package in packages:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ Installed {package}")
        except subprocess.CalledProcessError:
            print(f"❌ Failed to install {package}")
            return False
    return True

def get_system_info():
    """Get system information for model selection"""
    try:
        import torch
        import psutil
        
        # Get available memory
        ram_gb = psutil.virtual_memory().total / (1024**3)
        
        # Check for MPS/CUDA
        device = "cpu"
        vram_gb = 0
        
        if torch.backends.mps.is_available():
            device = "mps"
            # Apple Silicon unified memory - estimate VRAM as 60% of total RAM
            vram_gb = ram_gb * 0.6
        elif torch.cuda.is_available():
            device = "cuda"
            vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        
        print(f"🖥️  System Info:")
        print(f"   Device: {device}")
        print(f"   RAM: {ram_gb:.1f}GB")
        print(f"   Estimated VRAM: {vram_gb:.1f}GB")
        
        return {
            "device": device,
            "ram_gb": ram_gb,
            "vram_gb": vram_gb
        }
    except Exception as e:
        print(f"❌ Error getting system info: {e}")
        return None

def download_model(model_id, local_dir, description=""):
    """Download a model from Hugging Face"""
    try:
        print(f"📥 Downloading {description or model_id}...")
        
        # Create directory if it doesn't exist
        os.makedirs(local_dir, exist_ok=True)
        
        # Use huggingface-cli for reliable downloads
        cmd = [
            "huggingface-cli", "download", 
            model_id,
            "--local-dir", local_dir,
            "--local-dir-use-symlinks", "False"
        ]
        
        # Execute download
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ Successfully downloaded {description or model_id}")
            return True
        else:
            print(f"❌ Failed to download {model_id}")
            print(f"Error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error downloading {model_id}: {e}")
        return False

def download_flux_models(models_dir, system_info):
    """Download FLUX.1 models based on system capabilities"""
    
    models_to_download = []
    
    # Determine which models to download based on VRAM
    vram_gb = system_info["vram_gb"]
    
    if vram_gb >= 24:
        print("🚀 High VRAM detected - downloading FLUX.1 [dev] full precision")
        models_to_download.append({
            "id": "black-forest-labs/FLUX.1-dev",
            "dir": os.path.join(models_dir, "flux-dev"),
            "description": "FLUX.1 [dev] - Ultra High Quality"
        })
    elif vram_gb >= 12:
        print("⚡ Medium VRAM detected - downloading FLUX.1 [schnell] for speed")
        models_to_download.append({
            "id": "black-forest-labs/FLUX.1-schnell",
            "dir": os.path.join(models_dir, "flux-schnell"),
            "description": "FLUX.1 [schnell] - Fast Generation"
        })
    else:
        print("💡 Lower VRAM detected - will use SDXL models")
    
    # Always download SDXL backup models
    models_to_download.extend([
        {
            "id": "RunDiffusion/Juggernaut-XL-v9",
            "dir": os.path.join(models_dir, "juggernaut-xl"),
            "description": "SDXL Juggernaut XL - Fashion Photography"
        },
        {
            "id": "ByteDance/SDXL-Lightning",
            "dir": os.path.join(models_dir, "sdxl-lightning"),
            "description": "SDXL Lightning - Ultra Fast"
        }
    ])
    
    # Download models
    success_count = 0
    for model in models_to_download:
        if download_model(model["id"], model["dir"], model["description"]):
            success_count += 1
        time.sleep(1)  # Brief pause between downloads
    
    return success_count, len(models_to_download)

def create_model_config(models_dir, system_info):
    """Create model configuration file"""
    config = {
        "system_info": system_info,
        "models": {
            "flux_dev": {
                "path": os.path.join(models_dir, "flux-dev"),
                "type": "flux",
                "quality": "ultra_high",
                "speed": "slow",
                "vram_required": 24,
                "resolution": "1024x1024+"
            },
            "flux_schnell": {
                "path": os.path.join(models_dir, "flux-schnell"),
                "type": "flux",
                "quality": "high",
                "speed": "very_fast",
                "vram_required": 12,
                "resolution": "1024x1024"
            },
            "juggernaut_xl": {
                "path": os.path.join(models_dir, "juggernaut-xl"),
                "type": "sdxl",
                "quality": "high",
                "speed": "medium",
                "vram_required": 8,
                "resolution": "1024x1024"
            },
            "sdxl_lightning": {
                "path": os.path.join(models_dir, "sdxl-lightning"),
                "type": "sdxl",
                "quality": "medium",
                "speed": "ultra_fast",
                "vram_required": 6,
                "resolution": "1024x1024"
            }
        },
        "recommended_model": "auto"  # Will be determined by system capabilities
    }
    
    # Save config
    config_path = os.path.join(models_dir, "model_config.json")
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)
    
    print(f"✅ Model configuration saved to {config_path}")
    return config_path

def main():
    """Main installation function"""
    print("🎨 StyleAgent FLUX.1 Model Installation")
    print("=" * 50)
    
    # Check if we're in the right directory
    base_dir = Path(__file__).parent.parent
    models_dir = base_dir / "models" / "diffusion"
    
    print(f"📁 Installation directory: {models_dir}")
    
    # Create models directory
    models_dir.mkdir(parents=True, exist_ok=True)
    
    # Check requirements
    if not check_requirements():
        print("📦 Installing missing packages...")
        if not install_requirements():
            print("❌ Failed to install requirements")
            sys.exit(1)
    
    # Get system info
    system_info = get_system_info()
    if not system_info:
        print("❌ Could not determine system capabilities")
        sys.exit(1)
    
    # Download models
    print("\n📥 Starting model downloads...")
    success_count, total_count = download_flux_models(str(models_dir), system_info)
    
    if success_count == 0:
        print("❌ No models were downloaded successfully")
        sys.exit(1)
    
    print(f"\n✅ Successfully downloaded {success_count}/{total_count} models")
    
    # Create configuration
    config_path = create_model_config(str(models_dir), system_info)
    
    # Final summary
    print("\n🎉 Installation Complete!")
    print("=" * 50)
    print(f"✅ Models installed in: {models_dir}")
    print(f"✅ Configuration saved: {config_path}")
    print(f"✅ System optimized for: {system_info['device'].upper()}")
    
    if system_info["vram_gb"] >= 24:
        print("🚀 You're ready for ULTRA HIGH QUALITY generation with FLUX.1 [dev]!")
    elif system_info["vram_gb"] >= 12:
        print("⚡ You're ready for HIGH QUALITY fast generation with FLUX.1 [schnell]!")
    else:
        print("💡 You're ready for GOOD QUALITY generation with SDXL models!")
    
    print("\nNext steps:")
    print("1. Run the test script to verify installation")
    print("2. Start generating amazing fashion images!")

if __name__ == "__main__":
    main()