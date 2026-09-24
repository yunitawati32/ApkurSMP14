/**
 * Image processing utilities for SI-ARKUR
 * Resizes and compresses logos for optimal Firestore storage and crisp display
 */

export const DEFAULT_PEMDA_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" width="120" height="150"><defs><linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="50%" stop-color="%23047857"/><stop offset="100%" stop-color="%23064e3b"/></linearGradient><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fef08a"/><stop offset="50%" stop-color="%23eab308"/><stop offset="100%" stop-color="%23ca8a04"/></linearGradient></defs><path d="M60 5 L110 25 L110 85 Q110 135 60 148 Q10 135 10 85 L10 25 Z" fill="url(%23shieldGrad)" stroke="url(%23goldGrad)" stroke-width="5"/><path d="M60 13 L102 30 L102 83 Q102 127 60 140 Q18 127 18 83 L18 30 Z" fill="none" stroke="%23ffffff" stroke-width="1.5" opacity="0.6"/><path d="M35 55 L42 42 L52 50 L60 32 L68 50 L78 42 L85 55 Q60 62 35 55 Z" fill="url(%23goldGrad)" stroke="%23b45309" stroke-width="1"/><circle cx="60" cy="80" r="18" fill="%23ffffff" stroke="url(%23goldGrad)" stroke-width="2"/><circle cx="60" cy="80" r="14" fill="%230284c7"/><path d="M60 68 L63 76 L71 76 L65 81 L67 89 L60 84 L53 89 L55 81 L49 76 L57 76 Z" fill="url(%23goldGrad)"/><rect x="25" y="106" width="70" height="15" rx="3" fill="%23ffffff" stroke="%23d97706" stroke-width="1.5"/><text x="60" y="117" font-size="7" font-family="sans-serif" font-weight="900" fill="%230f172a" text-anchor="middle" letter-spacing="0.5">TUBABA</text><text x="60" y="24" font-size="5.5" font-family="sans-serif" font-weight="800" fill="%23fef08a" text-anchor="middle" letter-spacing="0.5">LAMPUNG</text></svg>`;

export const DEFAULT_SCHOOL_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="140" height="140"><defs><linearGradient id="scGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23059669"/><stop offset="100%" stop-color="%230f766e"/></linearGradient><linearGradient id="gGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fde047"/><stop offset="100%" stop-color="%23d97706"/></linearGradient></defs><circle cx="70" cy="70" r="65" fill="%23ffffff" stroke="url(%23gGrad)" stroke-width="5"/><circle cx="70" cy="70" r="58" fill="url(%23scGrad)" stroke="%23ffffff" stroke-width="2"/><path d="M70 20 L76 34 L90 35 L80 46 L82 60 L70 52 L58 60 L60 46 L50 35 L64 34 Z" fill="url(%23gGrad)"/><path d="M38 78 Q54 66 70 76 Q86 66 102 78 L102 96 Q86 86 70 96 Q54 86 38 96 Z" fill="%23ffffff" stroke="%230f172a" stroke-width="1.5"/><line x1="70" y1="76" x2="70" y2="96" stroke="%23059669" stroke-width="2"/><path d="M67 52 L73 52 L71 68 L69 68 Z" fill="%23ea580c"/><circle cx="70" cy="48" r="4" fill="%23f97316"/><path d="M70 42 Q75 36 70 32 Q65 36 70 42" fill="%23facc15"/><text x="70" y="112" font-size="7.5" font-family="sans-serif" font-weight="900" fill="%23fef08a" text-anchor="middle" letter-spacing="0.5">SMPN 14 TUBABA</text><text x="70" y="122" font-size="5" font-family="sans-serif" font-weight="700" fill="%23ffffff" text-anchor="middle">TUT WURI HANDAYANI</text></svg>`;

/**
 * Optimizes an uploaded image file:
 * - Resizes max dimensions to maxWidth/maxHeight (default 260px)
 * - Compresses as JPEG or PNG Data URL
 * - Limits size to ~20-50KB for fast Firestore and localStorage sync
 */
export async function optimizeImageFile(
  file: File,
  maxWidth = 260,
  maxHeight = 260
): Promise<string> {
  // If it's an SVG, read directly as text or data URL
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw image on canvas
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer PNG if transparency is used, otherwise JPEG 0.85
        try {
          const dataUrl = canvas.toDataURL('image/png', 0.88);
          // If PNG is over 150KB, fall back to JPEG to preserve Firestore doc limit
          if (dataUrl.length > 150000) {
            const jpegUrl = canvas.toDataURL('image/jpeg', 0.82);
            resolve(jpegUrl);
          } else {
            resolve(dataUrl);
          }
        } catch {
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
