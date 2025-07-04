# VISUALFIX.CLAUDE.MD

## Purpose
Fix visual display issues in StyleAgent including aspect ratio problems, zoom/crop functionality, image fill inconsistencies, and responsive layout bugs. Handles both CSS styling and JavaScript image manipulation.

## Trigger Examples
- `//visualfix` - Fix general visual layout issues
- `//visualfix aspect ratio` - Fix image aspect ratio problems
- `//visualfix crop` - Fix image cropping functionality
- `//visualfix zoom` - Fix zoom and pan functionality
- `//visualfix modal` - Fix modal display issues
- `use visualfix.claude.md to fix images not displaying properly`

## Claude Strategy

### Step 1: Identify Visual Issue Type
- **Aspect Ratio**: Images stretched, squished, or incorrectly sized
- **Cropping**: Images not centered or poorly cropped
- **Zoom/Pan**: Interactive image viewer problems
- **Layout**: Responsive design breaks or alignment issues
- **Modal Display**: Overlays, z-index, or fullscreen problems

### Step 2: Locate Problem Source
- Check CSS styles in `ui/styles.css` for layout rules
- Examine image handling in `ui/app.js` for JavaScript logic
- Verify data URLs and image paths in wardrobe data
- Test across different screen sizes and zoom levels

### Step 3: Apply Targeted Fixes
- **CSS**: Update flexbox, grid, aspect-ratio properties
- **JavaScript**: Fix image processing and modal logic
- **HTML**: Adjust container structures and classes
- **Data**: Ensure proper image format and size

### Step 4: Test Visual Consistency
- Verify fix across all image sizes and types
- Test responsive behavior on mobile/desktop
- Check modal interactions and zoom functionality
- Validate with real user-uploaded images

### Step 5: Performance Optimization
- Optimize image loading and caching
- Implement lazy loading for large image sets
- Add loading states and error fallbacks
- Ensure smooth animations and transitions

## Dev Tips (Electron/JS/CSS Specific)

### Aspect Ratio Fixes
```css
/* Maintain aspect ratio while fitting container */
.clothing-item-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  object-position: center;
  aspect-ratio: 1;
}

/* Responsive aspect ratio */
.outfit-image {
  aspect-ratio: 3/4;
  width: 100%;
  height: auto;
}
```

### Image Cropping & Centering
```javascript
// Center crop for clothing items
function centerCropImage(canvas, ctx, img, size) {
  const scale = Math.max(size / img.width, size / img.height);
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;
  
  const x = (size - scaledWidth) / 2;
  const y = (size - scaledHeight) / 2;
  
  ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
}
```

### Modal Zoom/Pan Implementation
```javascript
// Image viewer with zoom and pan
class ImageViewer {
  constructor(imageElement) {
    this.image = imageElement;
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    this.setupEvents();
  }
  
  zoom(factor, centerX, centerY) {
    const newScale = Math.max(1, Math.min(5, this.scale * factor));
    this.scale = newScale;
    this.updateTransform();
  }
  
  updateTransform() {
    this.image.style.transform = 
      `scale(${this.scale}) translate(${this.panX}px, ${this.panY}px)`;
  }
}
```

### Responsive Layout Fixes
```css
/* Fix modal responsiveness */
@media (max-width: 768px) {
  .modal-content {
    width: 95vw;
    height: 90vh;
    margin: 5vh auto;
  }
  
  .clothing-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
}
```

### Image Loading States
```javascript
// Improved image loading with fallbacks
function loadImageWithFallback(src, fallbackSrc) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      if (fallbackSrc) {
        img.src = fallbackSrc;
      } else {
        reject(new Error('Image failed to load'));
      }
    };
    img.src = src;
  });
}
```

## Output Formatting

### Aspect Ratio Fix
```
🖼️ **Image Aspect Ratio Fixed**

**Issue:** Clothing images stretched in grid view
**Root Cause:** Missing object-fit: cover property
**Files Modified:** ui/styles.css:245-252

**Applied Fix:**
```css
.clothing-item-image {
  object-fit: cover;
  aspect-ratio: 1;
}
```

**Result:** ✅ Images now maintain proper proportions
```

### Zoom/Pan Fix
```
🔍 **Image Viewer Zoom Fixed**

**Issue:** Zoom functionality not working in outfit modal
**Root Cause:** Event listeners not properly bound
**Files Modified:** ui/app.js:890-925

**Applied Fix:**
- Added proper wheel event handling
- Implemented touch gesture support
- Fixed pan boundary calculations

**Test:** ✅ Zoom and pan now work smoothly
```

### Layout Responsiveness Fix
```
📱 **Responsive Layout Fixed**

**Issue:** UI breaks on mobile screen sizes
**Root Cause:** Fixed width values and missing media queries
**Files Modified:** ui/styles.css:150-200, 800-850

**Applied Fixes:**
- Converted fixed widths to responsive units
- Added mobile-specific grid layouts
- Fixed modal sizing for small screens

**Tested On:**
• iPhone (375px width) ✅
• iPad (768px width) ✅
• Desktop (1200px+ width) ✅
```

### Image Processing Fix
```
🎨 **Image Processing Fixed**

**Issue:** Generated outfit images have wrong dimensions
**Root Cause:** Canvas sizing calculation error
**Files Modified:** llm/PhotoRealisticVisualizer.js:156-189

**Applied Fix:**
```javascript
// Fixed canvas aspect ratio calculation
const aspectRatio = 3/4; // Standard portrait
canvas.width = Math.floor(width);
canvas.height = Math.floor(width / aspectRatio);
```

**Result:** ✅ Outfit images now display correctly
```

### Performance Optimization
```
⚡ **Visual Performance Optimized**

**Improvements Applied:**
• Added lazy loading for wardrobe images
• Implemented image caching strategy
• Optimized CSS animations (60fps)
• Added loading placeholders

**Performance Gains:**
• Page load time: 2.3s → 1.1s
• Memory usage: -35%
• Smoother scrolling and transitions

**Files Modified:** 
- ui/app.js (lazy loading)
- ui/styles.css (animation optimization)
```