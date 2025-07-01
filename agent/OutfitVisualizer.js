class OutfitVisualizer {
  constructor() {
    this.width = 300;
    this.height = 400;
    this.colors = {
      // Color mapping for common color names
      white: '#ffffff',
      black: '#000000',
      blue: '#3b82f6',
      red: '#ef4444',
      green: '#10b981',
      yellow: '#f59e0b',
      purple: '#8b5cf6',
      pink: '#ec4899',
      gray: '#6b7280',
      grey: '#6b7280',
      brown: '#92400e',
      orange: '#f97316',
      navy: '#1e3a8a',
      cream: '#fef3c7',
      beige: '#d2b48c',
      maroon: '#7f1d1d',
      teal: '#0d9488',
      olive: '#65a30d',
      silver: '#d1d5db',
      gold: '#f59e0b',
      dark: '#374151'
    };
  }

  generateOutfitSVG(items) {
    // Find items by category
    const top = items.find(item => item.category === 'tops');
    const bottom = items.find(item => item.category === 'bottoms');
    const shoes = items.find(item => item.category === 'shoes');
    const outerwear = items.find(item => item.category === 'outerwear');
    const accessories = items.filter(item => item.category === 'accessories');

    let svgContent = `
      <svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.1)"/>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="${this.width}" height="${this.height}" fill="url(#backgroundGradient)"/>
        
        <!-- Body outline (subtle) -->
        <ellipse cx="150" cy="120" rx="45" ry="60" fill="none" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3"/>
    `;

    // Add outerwear if present (rendered first, behind other items)
    if (outerwear) {
      svgContent += this.renderOuterwear(outerwear);
    }

    // Add top
    if (top) {
      svgContent += this.renderTop(top);
    }

    // Add bottom
    if (bottom) {
      svgContent += this.renderBottom(bottom);
    }

    // Add shoes
    if (shoes) {
      svgContent += this.renderShoes(shoes);
    }

    // Add accessories
    accessories.forEach((accessory, index) => {
      svgContent += this.renderAccessory(accessory, index);
    });

    // Add item labels
    svgContent += this.renderItemLabels(items);

    svgContent += '</svg>';

    return svgContent;
  }

  renderTop(item) {
    const colors = Array.isArray(item.color) ? item.color : [item.color || 'gray'];
    const color = this.getColor(colors[0]);
    const hasPattern = colors.length > 1;
    
    return `
      <g filter="url(#shadow)">
        <!-- Top/Shirt -->
        <path d="M 120 100 Q 120 95 125 95 L 175 95 Q 180 95 180 100 L 180 160 Q 180 165 175 165 L 125 165 Q 120 165 120 160 Z" 
              fill="${color}" stroke="#333" stroke-width="1"/>
        
        <!-- Sleeves -->
        <ellipse cx="110" cy="115" rx="12" ry="25" fill="${color}" stroke="#333" stroke-width="1"/>
        <ellipse cx="190" cy="115" rx="12" ry="25" fill="${color}" stroke="#333" stroke-width="1"/>
        
        ${hasPattern ? this.addPattern(125, 100, 50, 60, colors[1]) : ''}
        
        <!-- Collar -->
        <path d="M 140 95 Q 150 90 160 95" fill="none" stroke="#333" stroke-width="1"/>
      </g>
    `;
  }

  renderBottom(item) {
    const colors = Array.isArray(item.color) ? item.color : [item.color || 'gray'];
    const color = this.getColor(colors[0]);
    const itemName = item.name || '';
    const isDress = itemName.toLowerCase().includes('dress') || itemName.toLowerCase().includes('skirt');
    
    if (isDress) {
      return `
        <g filter="url(#shadow)">
          <!-- Dress/Skirt -->
          <path d="M 125 160 L 175 160 Q 180 240 185 280 L 115 280 Q 120 240 125 160 Z" 
                fill="${color}" stroke="#333" stroke-width="1"/>
        </g>
      `;
    } else {
      return `
        <g filter="url(#shadow)">
          <!-- Pants/Jeans -->
          <rect x="125" y="165" width="50" height="120" rx="5" fill="${color}" stroke="#333" stroke-width="1"/>
          
          <!-- Left leg -->
          <rect x="125" y="200" width="22" height="85" rx="3" fill="${color}" stroke="#333" stroke-width="1"/>
          
          <!-- Right leg -->
          <rect x="153" y="200" width="22" height="85" rx="3" fill="${color}" stroke="#333" stroke-width="1"/>
          
          ${item.material && Array.isArray(item.material) && item.material.includes('denim') ? this.addDenimDetails() : ''}
        </g>
      `;
    }
  }

  renderShoes(item) {
    const colors = Array.isArray(item.color) ? item.color : [item.color || 'gray'];
    const color = this.getColor(colors[0]);
    const itemName = item.name || '';
    const isBoots = itemName.toLowerCase().includes('boot');
    const isSneakers = itemName.toLowerCase().includes('sneaker') || itemName.toLowerCase().includes('tennis');
    
    if (isBoots) {
      return `
        <g filter="url(#shadow)">
          <!-- Boots -->
          <ellipse cx="138" cy="300" rx="15" ry="20" fill="${color}" stroke="#333" stroke-width="1"/>
          <ellipse cx="162" cy="300" rx="15" ry="20" fill="${color}" stroke="#333" stroke-width="1"/>
          
          <!-- Boot shafts -->
          <rect x="123" y="280" width="30" height="25" rx="5" fill="${color}" stroke="#333" stroke-width="1"/>
          <rect x="147" y="280" width="30" height="25" rx="5" fill="${color}" stroke="#333" stroke-width="1"/>
        </g>
      `;
    } else if (isSneakers) {
      return `
        <g filter="url(#shadow)">
          <!-- Sneakers -->
          <ellipse cx="138" cy="295" rx="18" ry="12" fill="${color}" stroke="#333" stroke-width="1"/>
          <ellipse cx="162" cy="295" rx="18" ry="12" fill="${color}" stroke="#333" stroke-width="1"/>
          
          <!-- Sneaker soles -->
          <ellipse cx="138" cy="300" rx="20" ry="8" fill="#ffffff" stroke="#333" stroke-width="1"/>
          <ellipse cx="162" cy="300" rx="20" ry="8" fill="#ffffff" stroke="#333" stroke-width="1"/>
          
          <!-- Laces -->
          <line x1="132" y1="290" x2="144" y2="290" stroke="#333" stroke-width="1"/>
          <line x1="156" y1="290" x2="168" y2="290" stroke="#333" stroke-width="1"/>
        </g>
      `;
    } else {
      return `
        <g filter="url(#shadow)">
          <!-- Regular shoes -->
          <ellipse cx="138" cy="295" rx="16" ry="10" fill="${color}" stroke="#333" stroke-width="1"/>
          <ellipse cx="162" cy="295" rx="16" ry="10" fill="${color}" stroke="#333" stroke-width="1"/>
        </g>
      `;
    }
  }

  renderOuterwear(item) {
    const colors = Array.isArray(item.color) ? item.color : [item.color || 'gray'];
    const color = this.getColor(colors[0]);
    
    return `
      <g filter="url(#shadow)">
        <!-- Jacket/Coat -->
        <path d="M 115 95 Q 115 90 120 90 L 180 90 Q 185 90 185 95 L 185 180 Q 185 185 180 185 L 120 185 Q 115 185 115 180 Z" 
              fill="${color}" stroke="#333" stroke-width="1.5" opacity="0.9"/>
        
        <!-- Lapels -->
        <path d="M 120 90 L 135 110 L 120 130" fill="none" stroke="#333" stroke-width="1"/>
        <path d="M 180 90 L 165 110 L 180 130" fill="none" stroke="#333" stroke-width="1"/>
        
        <!-- Buttons -->
        <circle cx="150" cy="110" r="2" fill="#666"/>
        <circle cx="150" cy="130" r="2" fill="#666"/>
        <circle cx="150" cy="150" r="2" fill="#666"/>
      </g>
    `;
  }

  renderAccessory(item, index) {
    const colors = Array.isArray(item.color) ? item.color : [item.color || 'gray'];
    const color = this.getColor(colors[0]);
    const yOffset = index * 15;
    const itemName = item.name || '';
    
    if (itemName.toLowerCase().includes('bag') || itemName.toLowerCase().includes('purse')) {
      return `
        <g filter="url(#shadow)">
          <!-- Bag -->
          <rect x="190" y="${140 + yOffset}" width="25" height="20" rx="3" fill="${color}" stroke="#333" stroke-width="1"/>
          <path d="M 195 ${140 + yOffset} Q 200 ${135 + yOffset} 205 ${140 + yOffset}" fill="none" stroke="#333" stroke-width="1"/>
        </g>
      `;
    } else if (itemName.toLowerCase().includes('hat') || itemName.toLowerCase().includes('cap')) {
      return `
        <g filter="url(#shadow)">
          <!-- Hat -->
          <ellipse cx="150" cy="75" rx="35" ry="12" fill="${color}" stroke="#333" stroke-width="1"/>
          <ellipse cx="150" cy="70" rx="25" ry="8" fill="${color}" stroke="#333" stroke-width="1"/>
        </g>
      `;
    } else if (itemName.toLowerCase().includes('scarf')) {
      return `
        <g filter="url(#shadow)">
          <!-- Scarf -->
          <path d="M 130 95 Q 150 85 170 95 Q 175 110 170 125 Q 150 135 130 125 Q 125 110 130 95" 
                fill="${color}" stroke="#333" stroke-width="1" opacity="0.8"/>
        </g>
      `;
    } else {
      return `
        <g filter="url(#shadow)">
          <!-- Generic accessory -->
          <circle cx="${80 + index * 20}" cy="${120 + yOffset}" r="8" fill="${color}" stroke="#333" stroke-width="1"/>
        </g>
      `;
    }
  }

  renderItemLabels(items) {
    let labels = `
      <g opacity="0.8">
        <rect x="10" y="320" width="280" height="70" rx="8" fill="rgba(255,255,255,0.9)" stroke="#e2e8f0"/>
        <text x="20" y="340" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#374151">
          Outfit Components:
        </text>
    `;
    
    let yPos = 355;
    items.forEach((item, index) => {
      if (index < 4) { // Limit to 4 items to fit
        const emoji = this.getCategoryEmoji(item.category);
        const colors = Array.isArray(item.color) ? item.color.join(', ') : (item.color || 'No color');
        labels += `
          <text x="20" y="${yPos}" font-family="Arial, sans-serif" font-size="10" fill="#6b7280">
            ${emoji} ${item.name || 'Unnamed item'} - ${colors}
          </text>
        `;
        yPos += 12;
      }
    });
    
    if (items.length > 4) {
      labels += `
        <text x="20" y="${yPos}" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">
          + ${items.length - 4} more items
        </text>
      `;
    }
    
    labels += '</g>';
    return labels;
  }

  addPattern(x, y, width, height, patternColor) {
    const color = this.getColor(patternColor);
    return `
      <g opacity="0.3">
        <circle cx="${x + 15}" cy="${y + 15}" r="3" fill="${color}"/>
        <circle cx="${x + 35}" cy="${y + 25}" r="3" fill="${color}"/>
        <circle cx="${x + 25}" cy="${y + 40}" r="3" fill="${color}"/>
      </g>
    `;
  }

  addDenimDetails() {
    return `
      <g opacity="0.6">
        <!-- Denim stitching -->
        <line x1="130" y1="170" x2="170" y2="170" stroke="#f59e0b" stroke-width="0.5"/>
        <line x1="135" y1="200" x2="140" y2="280" stroke="#f59e0b" stroke-width="0.5"/>
        <line x1="160" y1="200" x2="165" y2="280" stroke="#f59e0b" stroke-width="0.5"/>
        
        <!-- Pocket -->
        <rect x="155" y="175" width="12" height="15" rx="2" fill="none" stroke="#f59e0b" stroke-width="0.5"/>
      </g>
    `;
  }

  getColor(colorName) {
    if (!colorName) return '#6b7280';
    
    const name = colorName.toLowerCase().trim();
    
    // Check if it's already a hex color
    if (name.startsWith('#')) return name;
    
    // Return mapped color or default
    return this.colors[name] || '#6b7280';
  }

  getCategoryEmoji(category) {
    const emojis = {
      tops: '👕',
      bottoms: '👖',
      shoes: '👟',
      accessories: '👜',
      outerwear: '🧥',
      underwear: '🩲',
      sleepwear: '🛌',
      activewear: '🏃'
    };
    
    return emojis[category] || '👔';
  }

  generateOutfitPreview(items, size = 'small') {
    const dimensions = size === 'small' ? { width: 150, height: 200 } : { width: 300, height: 400 };
    
    this.width = dimensions.width;
    this.height = dimensions.height;
    
    return this.generateOutfitSVG(items);
  }

  generateDataURL(svgString) {
    try {
      // Use Buffer for proper UTF-8 encoding in Node.js environment
      const base64 = Buffer.from(svgString, 'utf8').toString('base64');
      return `data:image/svg+xml;base64,${base64}`;
    } catch (error) {
      console.error('Error encoding SVG to base64:', error);
      // Fallback: return SVG as data URL without base64 encoding
      const encoded = encodeURIComponent(svgString);
      return `data:image/svg+xml,${encoded}`;
    }
  }
}

module.exports = OutfitVisualizer;