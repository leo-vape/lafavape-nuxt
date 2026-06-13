import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const srcDir = '/Users/leomac/lafavape-nuxt/lafa 产品图/图片';
const outDir = '/Users/leomac/lafavape-nuxt/public/uploads';

fs.mkdirSync(outDir, { recursive: true });

async function processImage(inputPath, outputName) {
  const webpPath = path.join(outDir, outputName.replace(/\.(jpg|png|jpeg)$/i, '.webp'));
  const smallPath = path.join(outDir, outputName.replace(/\.(jpg|png|jpeg)$/i, '_small.webp'));

  try {
    await sharp(inputPath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(webpPath);

    await sharp(inputPath)
      .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(smallPath);

    console.log(`  OK ${outputName}`);
  } catch (e) {
    console.error(`  ERR ${outputName}: ${e.message}`);
  }
}

const productDir = path.join(srcDir, '31330-产品图');
for (let i = 1; i <= 6; i++) {
  const f = path.join(productDir, `${i}.jpg`);
  if (fs.existsSync(f)) await processImage(f, `device-${i}.jpg`);
}

const flavors = fs.readdirSync(productDir).filter(f => f.startsWith('口味图'));
for (const f of flavors) await processImage(path.join(productDir, f), f);

const whiteDir = path.join(srcDir, '31330-白底图');
for (const f of fs.readdirSync(whiteDir).filter(f => /\.(jpg|png)$/i.test(f))) {
  await processImage(path.join(whiteDir, f), `white-${f}`);
}

const detailDir = path.join(srcDir, '产品详情images');
for (const f of fs.readdirSync(detailDir).filter(f => /\.jpg$/i.test(f))) {
  await processImage(path.join(detailDir, f), `detail-${f}`);
}

console.log(`\nTotal: ${fs.readdirSync(outDir).length} files in public/uploads`);
