const sharp = require('sharp');

// Create a white square for icon.png (1024x1024)
sharp({
  create: {
    width: 1024,
    height: 1024,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  }
})
.png()
.toFile('assets/icon.png')
.then(() => console.log('Created icon.png'))
.catch(err => console.error('Error creating icon.png:', err));

// Create a white square for adaptive-icon.png (1024x1024)
sharp({
  create: {
    width: 1024,
    height: 1024,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  }
})
.png()
.toFile('assets/adaptive-icon.png')
.then(() => console.log('Created adaptive-icon.png'))
.catch(err => console.error('Error creating adaptive-icon.png:', err));

// Create a white square for favicon.png (192x192)
sharp({
  create: {
    width: 192,
    height: 192,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  }
})
.png()
.toFile('assets/favicon.png')
.then(() => console.log('Created favicon.png'))
.catch(err => console.error('Error creating favicon.png:', err)); 