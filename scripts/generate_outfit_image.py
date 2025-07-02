#!/usr/bin/env python3
"""
Stable Diffusion Image Generator for StyleAgent
Handles photo-realistic outfit image generation using diffusers pipeline
"""

import sys
import json
import os
import time
from pathlib import Path

try:
    import torch
    from diffusers import StableDiffusionPipeline
    DEPENDENCIES_AVAILABLE = True
except ImportError as e:
    DEPENDENCIES_AVAILABLE = False
    IMPORT_ERROR = str(e)

def test_availability():
    """Test if the Stable Diffusion pipeline is available"""
    if not DEPENDENCIES_AVAILABLE:
        return {
            "success": False,
            "error": f"Dependencies not available: {IMPORT_ERROR}",
            "available": False
        }
    
    try:
        # Check device availability
        if torch.backends.mps.is_available():
            device = "mps"
        elif torch.cuda.is_available():
            device = "cuda"
        else:
            device = "cpu"
        
        return {
            "success": True,
            "available": True,
            "device": device,
            "torch_version": torch.__version__
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "available": False
        }

def generate_image(params):
    """Generate outfit image using Stable Diffusion"""
    if not DEPENDENCIES_AVAILABLE:
        return {
            "success": False,
            "error": f"Dependencies not available: {IMPORT_ERROR}"
        }
    
    try:
        start_time = time.time()
        
        # Determine device
        if torch.backends.mps.is_available():
            device = "mps"
            torch_dtype = torch.float16
        elif torch.cuda.is_available():
            device = "cuda"
            torch_dtype = torch.float16
        else:
            device = "cpu"
            torch_dtype = torch.float32
        
        # Create pipeline
        model_id = params.get("model_id", "runwayml/stable-diffusion-v1-5")
        
        pipe = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=torch_dtype,
            safety_checker=None,
            requires_safety_checker=False
        )
        
        pipe = pipe.to(device)
        
        # Generate image
        image = pipe(
            prompt=params["prompt"],
            negative_prompt=params.get("negative_prompt", ""),
            height=params.get("height", 512),
            width=params.get("width", 512),
            num_inference_steps=params.get("steps", 20),
            guidance_scale=params.get("guidance_scale", 7.5),
            generator=torch.Generator(device=device).manual_seed(params.get("seed", -1)) if params.get("seed", -1) >= 0 else None
        ).images[0]
        
        # Ensure output directory exists
        output_dir = Path(params.get("output_dir", "./generated_outfits"))
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save image
        filename = params.get("filename", f"outfit_{int(time.time())}")
        if not filename.endswith('.png'):
            filename += '.png'
        
        image_path = output_dir / filename
        image.save(image_path)
        
        generation_time = time.time() - start_time
        
        return {
            "success": True,
            "image_path": str(image_path),
            "generation_time": round(generation_time, 2),
            "device": device,
            "model_id": model_id
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "traceback": str(e)
        }

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "No command provided. Use 'test_availability' or 'generate'"
        }))
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "test_availability":
        result = test_availability()
        print(json.dumps(result))
        
    elif command == "generate":
        if len(sys.argv) < 3:
            print(json.dumps({
                "success": False,
                "error": "No parameters provided for generation"
            }))
            sys.exit(1)
        
        try:
            params = json.loads(sys.argv[2])
            result = generate_image(params)
            print(json.dumps(result))
        except json.JSONDecodeError as e:
            print(json.dumps({
                "success": False,
                "error": f"Invalid JSON parameters: {str(e)}"
            }))
            sys.exit(1)
    
    else:
        print(json.dumps({
            "success": False,
            "error": f"Unknown command: {command}"
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()