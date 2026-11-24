import * as THREE from 'three';

/**
 * Generates a tileable diamond-pattern knurling bump/roughness CanvasTexture
 * for the Olympic barbell grip shaft — zero external assets.
 */
export function createKnurlingTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 0, size, size);

    const step = 8;
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        // Raised diamond pyramid peak
        ctx.fillStyle = '#d4d4d4';
        ctx.beginPath();
        ctx.moveTo(x + step * 0.5, y + 1);
        ctx.lineTo(x + step - 1, y + step * 0.5);
        ctx.lineTo(x + step * 0.5, y + step - 1);
        ctx.lineTo(x + 1, y + step * 0.5);
        ctx.closePath();
        ctx.fill();

        // Crisp dark crosshatch groove
        ctx.strokeStyle = '#141414';
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 22);
  texture.anisotropy = Math.min(maxAnisotropy, 4);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a fine machined radial/linear brushed steel bump texture
 * for sleeves and calibrated plate rims.
 */
export function createBrushedSteelTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    // Deterministic fine lathe-turned micro-grooves
    for (let y = 0; y < size; y++) {
      const wave = Math.sin(y * 1.9) * 18 + Math.cos(y * 5.3) * 10;
      const v = Math.round(128 + wave);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(0, y, size, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 6);
  texture.anisotropy = Math.min(maxAnisotropy, 4);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a subtle radial elliptical contact shadow texture for soft studio grounding.
 */
export function createSoftShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createRadialGradient(
      size * 0.5,
      size * 0.5,
      size * 0.04,
      size * 0.5,
      size * 0.5,
      size * 0.5
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.92)');
    grad.addColorStop(0.45, 'rgba(0, 0, 0, 0.55)');
    grad.addColorStop(0.75, 'rgba(0, 0, 0, 0.16)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a soft circular dust/ember particle texture for minimal floating chalk motes.
 */
export function createDustMoteTexture(): THREE.CanvasTexture {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createRadialGradient(
      size * 0.5,
      size * 0.5,
      0,
      size * 0.5,
      size * 0.5,
      size * 0.5
    );
    grad.addColorStop(0, 'rgba(255, 224, 200, 1)');
    grad.addColorStop(0.4, 'rgba(255, 130, 75, 0.45)');
    grad.addColorStop(1, 'rgba(255, 77, 28, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
