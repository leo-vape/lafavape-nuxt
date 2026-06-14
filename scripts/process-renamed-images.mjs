import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const srcDir = '/Users/leomac/lafavape-nuxt/lafa 产品图/图片/31330-产品图';
const outDir = '/Users/leomac/lafavape-nuxt/public/uploads';

fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(srcDir).filter(f => /\.(jpg|png)$/i.test(f));

console.log(`Processing ${files.length} renamed images...\n`);

for (const f of files) {
  const inputPath = path.join(srcDir, f);
  const baseName = f.replace(/\.(jpg|png|jpeg)$/i, '');
  
  try {
    await sharp(inputPath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(outDir, `${baseName}.webp`));
    
    await sharp(inputPath)
      .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(path.join(outDir, `${baseName}_small.webp`));
    
    console.log(`  ✓ ${baseName}`);
  } catch (e) {
    console.error(`  ✗ ${f}: ${e.message}`);
  }
}

console.log(`\nDone! ${fs.readdirSync(outDir).filter(f => f.endsWith('.webp')).length} webp files total.`);
