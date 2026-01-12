const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const heroDir = path.join(__dirname, '..', 'public', 'images', 'hero');

async function convertAndCompress(file) {
  const inputPath = path.join(heroDir, file);
  const baseName = path.parse(file).name;
  const outputPath = path.join(heroDir, `${baseName}-compressed.jpg`);
  
  console.log(`\n📸 ${file}`);
  const originalSize = fs.statSync(inputPath).size;
  console.log(`   الأصلي: ${(originalSize / 1024).toFixed(2)} KB`);
  
  await sharp(inputPath)
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .toFile(outputPath);
  
  const newSize = fs.statSync(outputPath).size;
  console.log(`   المضغوط: ${(newSize / 1024).toFixed(2)} KB`);
  
  // حذف الأصلي واستبداله
  fs.unlinkSync(inputPath);
  fs.renameSync(outputPath, path.join(heroDir, `${baseName}.jpg`));
}

async function main() {
  const pngFiles = fs.readdirSync(heroDir).filter(f => f.endsWith('.png'));
  
  for (const file of pngFiles) {
    await convertAndCompress(file);
  }
  
  console.log('\n✅ تم تحويل كل PNG إلى JPG مضغوط!\n');
}

main().catch(console.error);
