const sharp = require('sharp');
const https = require('https');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'public', 'images', 'hero');

// إنشاء المجلد
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// الصور الأربعة (سيتم حفظها يدوياً أولاً في المجلد)
const images = [
  'hero-1.jpg', // cairo-sunset
  'hero-2.jpg', // cairo-night
  'hero-3.jpg', // pyramids-hotel
  'hero-4.jpg'  // pyramids-villas
];

async function compressImage(inputPath, outputPath, targetSizeKB = 200) {
  console.log(`\n📸 معالجة: ${path.basename(inputPath)}`);
  
  try {
    const metadata = await sharp(inputPath).metadata();
    console.log(`   الحجم الأصلي: ${(fs.statSync(inputPath).size / 1024).toFixed(2)} KB`);
    console.log(`   الأبعاد: ${metadata.width}x${metadata.height}`);
    
    let quality = 85;
    let scale = 1.0;
    let bestOutput = null;
    
    // نبدأ بتقليل الجودة
    for (let q = 85; q >= 60; q -= 5) {
      const tempOutput = outputPath + '.temp';
      
      await sharp(inputPath)
        .resize(Math.round(metadata.width * scale), Math.round(metadata.height * scale), {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: q,
          progressive: true,
          mozjpeg: true
        })
        .toFile(tempOutput);
      
      const size = fs.statSync(tempOutput).size;
      const sizeKB = size / 1024;
      
      console.log(`   جودة ${q}%: ${sizeKB.toFixed(2)} KB`);
      
      if (sizeKB <= targetSizeKB) {
        bestOutput = tempOutput;
        break;
      }
      
      fs.unlinkSync(tempOutput);
    }
    
    // إذا لم نصل للحجم، نقلل الأبعاد
    if (!bestOutput) {
      console.log(`   🔄 تقليل الأبعاد...`);
      
      for (let s = 0.95; s >= 0.6; s -= 0.05) {
        const tempOutput = outputPath + '.temp';
        const newWidth = Math.round(metadata.width * s);
        const newHeight = Math.round(metadata.height * s);
        
        await sharp(inputPath)
          .resize(newWidth, newHeight, {
            fit: 'inside'
          })
          .jpeg({
            quality: 80,
            progressive: true,
            mozjpeg: true
          })
          .toFile(tempOutput);
        
        const size = fs.statSync(tempOutput).size;
        const sizeKB = size / 1024;
        
        console.log(`   ${newWidth}x${newHeight} (80%): ${sizeKB.toFixed(2)} KB`);
        
        if (sizeKB <= targetSizeKB) {
          bestOutput = tempOutput;
          break;
        }
        
        fs.unlinkSync(tempOutput);
      }
    }
    
    if (bestOutput) {
      fs.renameSync(bestOutput, outputPath);
      const finalSize = fs.statSync(outputPath).size;
      console.log(`   ✅ النتيجة النهائية: ${(finalSize / 1024).toFixed(2)} KB`);
      return finalSize;
    } else {
      throw new Error('لم نتمكن من الوصول للحجم المطلوب');
    }
    
  } catch (error) {
    console.error(`   ❌ خطأ: ${error.message}`);
    throw error;
  }
}

async function processImages() {
  console.log('🎨 ضغط صور الهيرو إلى أقل من 200KB\n');
  console.log('════════════════════════════════════════\n');
  
  let totalOriginal = 0;
  let totalCompressed = 0;
  let count = 0;
  
  for (const imageName of images) {
    const inputPath = path.join(outputDir, imageName);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  الصورة غير موجودة: ${imageName}`);
      continue;
    }
    
    const originalSize = fs.statSync(inputPath).size;
    totalOriginal += originalSize;
    
    const tempOutput = path.join(outputDir, `compressed-${imageName}`);
    
    try {
      const compressedSize = await compressImage(inputPath, tempOutput, 200);
      totalCompressed += compressedSize;
      
      // استبدال الملف الأصلي
      fs.unlinkSync(inputPath);
      fs.renameSync(tempOutput, inputPath);
      
      count++;
    } catch (error) {
      console.error(`فشل ضغط ${imageName}`);
      if (fs.existsSync(tempOutput)) {
        fs.unlinkSync(tempOutput);
      }
    }
  }
  
  console.log('\n════════════════════════════════════════');
  console.log('\n📊 الإحصائيات:\n');
  console.log(`   الصور المعالجة: ${count}`);
  console.log(`   الحجم الأصلي: ${(totalOriginal / 1024).toFixed(2)} KB`);
  console.log(`   الحجم المضغوط: ${(totalCompressed / 1024).toFixed(2)} KB`);
  console.log(`   التوفير: ${((1 - totalCompressed / totalOriginal) * 100).toFixed(1)}%`);
  console.log(`\n✅ تم الحفظ في: ${outputDir}\n`);
}

processImages().catch(console.error);
