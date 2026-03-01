const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const heroDir = path.join(__dirname, '..', 'public', 'images', 'hero');

async function compressToTarget(inputPath, outputPath, targetKB = 200) {
  console.log(`\n📸 ${path.basename(inputPath)}`);
  
  const originalSize = fs.statSync(inputPath).size;
  console.log(`   الحجم الأصلي: ${(originalSize / 1024).toFixed(2)} KB`);
  
  const metadata = await sharp(inputPath).metadata();
  let width = metadata.width;
  let height = metadata.height;
  let quality = 82;
  let scale = 1.0;
  
  // استراتيجية أكثر قوة
  const attempts = [
    // محاولة 1: جودة 80%
    { scale: 1.0, quality: 80 },
    // محاولة 2: جودة 72%
    { scale: 1.0, quality: 72 },
    // محاولة 3: جودة 65%
    { scale: 1.0, quality: 65 },
    // محاولة 4: تصغير 10% + جودة 72%
    { scale: 0.9, quality: 72 },
    // محاولة 5: تصغير 20% + جودة 72%
    { scale: 0.8, quality: 72 },
    // محاولة 6: تصغير 25% + جودة 70%
    { scale: 0.75, quality: 70 },
    // محاولة 7: تصغير 30% + جودة 68%
    { scale: 0.7, quality: 68 },
    // محاولة 8: تصغير 35% + جودة 68%
    { scale: 0.65, quality: 68 },
    // محاولة 9: تصغير 40% + جودة 68%
    { scale: 0.6, quality: 68 },
    // محاولة 10: تصغير 45% + جودة 65%
    { scale: 0.55, quality: 65 },
  ];
  
  let bestSize = Infinity;
  let bestAttempt = null;
  
  for (const attempt of attempts) {
    const tempPath = outputPath + '.tmp';
    const newWidth = Math.round(metadata.width * attempt.scale);
    const newHeight = Math.round(metadata.height * attempt.scale);
    
    await sharp(inputPath)
      .resize(newWidth, newHeight, { fit: 'inside' })
      .jpeg({ 
        quality: attempt.quality, 
        progressive: true, 
        mozjpeg: true 
      })
      .toFile(tempPath);
    
    const size = fs.statSync(tempPath).size;
    const sizeKB = size / 1024;
    
    // إذا وصلنا للهدف أو أفضل
    if (sizeKB <= targetKB) {
      fs.renameSync(tempPath, outputPath);
      const saved = ((1 - size / originalSize) * 100).toFixed(1);
      console.log(`   ✅ ${sizeKB.toFixed(2)} KB (جودة ${attempt.quality}%, مقياس ${(attempt.scale * 100).toFixed(0)}%) - توفير ${saved}%`);
      return size;
    }
    
    // احتفظ بأفضل محاولة
    if (size < bestSize) {
      bestSize = size;
      bestAttempt = { ...attempt, size };
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      fs.renameSync(tempPath, outputPath);
    } else {
      fs.unlinkSync(tempPath);
    }
  }
  
  // إذا لم نصل للهدف، استخدم أفضل محاولة
  const sizeKB = bestSize / 1024;
  const saved = ((1 - bestSize / originalSize) * 100).toFixed(1);
  console.log(`   ⚠️  ${sizeKB.toFixed(2)} KB (أفضل نتيجة) - توفير ${saved}%`);
  
  return bestSize;
}

async function main() {
  console.log('🎨 ضغط صور الهيرو\n');
  
  const files = fs.readdirSync(heroDir)
    .filter(f => f.match(/\.(jpg|jpeg|png)$/i))
    .sort();
  
  let totalOriginal = 0;
  let totalCompressed = 0;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputPath = path.join(heroDir, file);
    const outputPath = path.join(heroDir, `hero-${i + 1}.jpg`);
    
    totalOriginal += fs.statSync(inputPath).size;
    const compressed = await compressToTarget(inputPath, outputPath, 200);
    totalCompressed += compressed;
  }
  
  console.log('\n════════════════════════════════════════');
  console.log(`\n✅ تم! التوفير الإجمالي: ${((1 - totalCompressed / totalOriginal) * 100).toFixed(1)}%\n`);
}

main().catch(console.error);
