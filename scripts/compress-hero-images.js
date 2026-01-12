const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// صور الهيرو المرفقة
const images = [
  { name: 'cairo-sunset.jpg', buffer: null }, // الصورة الأولى (غروب القاهرة)
  { name: 'cairo-night.jpg', buffer: null },  // الصورة الثانية (ليل القاهرة)
  { name: 'pyramids-hotel.jpg', buffer: null }, // الصورة الثالثة (فندق الأهرامات)
  { name: 'pyramids-villas.jpg', buffer: null } // الصورة الرابعة (فلل الأهرامات)
];

const outputDir = path.join(__dirname, '..', 'public', 'images', 'hero');

// إنشاء المجلد إذا لم يكن موجوداً
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function compressImage(inputPath, outputPath, targetSizeKB = 200) {
  console.log(`\n📸 معالجة: ${path.basename(inputPath)}`);
  
  try {
    // قراءة الصورة الأصلية
    const metadata = await sharp(inputPath).metadata();
    console.log(`   الحجم الأصلي: ${(metadata.size / 1024).toFixed(2)} KB`);
    console.log(`   الأبعاد: ${metadata.width}x${metadata.height}`);
    
    let quality = 85;
    let currentSize = Infinity;
    let attempt = 0;
    const maxAttempts = 10;
    
    // تجربة ضغط بجودات مختلفة حتى نصل للحجم المطلوب
    while (currentSize > targetSizeKB * 1024 && attempt < maxAttempts) {
      await sharp(inputPath)
        .resize(metadata.width, metadata.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: quality,
          progressive: true,
          mozjpeg: true
        })
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      currentSize = stats.size;
      
      console.log(`   محاولة ${attempt + 1}: جودة ${quality}% = ${(currentSize / 1024).toFixed(2)} KB`);
      
      if (currentSize > targetSizeKB * 1024) {
        quality -= 5;
        attempt++;
      }
    }
    
    // إذا لم نصل للحجم المطلوب، نقلل الأبعاد
    if (currentSize > targetSizeKB * 1024) {
      console.log(`   🔄 تقليل الأبعاد...`);
      let scale = 0.9;
      
      while (currentSize > targetSizeKB * 1024 && scale > 0.5) {
        const newWidth = Math.round(metadata.width * scale);
        const newHeight = Math.round(metadata.height * scale);
        
        await sharp(inputPath)
          .resize(newWidth, newHeight, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({
            quality: 80,
            progressive: true,
            mozjpeg: true
          })
          .toFile(outputPath);
        
        const stats = fs.statSync(outputPath);
        currentSize = stats.size;
        
        console.log(`   أبعاد جديدة ${newWidth}x${newHeight}: ${(currentSize / 1024).toFixed(2)} KB`);
        
        scale -= 0.05;
      }
    }
    
    const finalStats = fs.statSync(outputPath);
    const compressionRatio = ((1 - (finalStats.size / metadata.size)) * 100).toFixed(1);
    
    console.log(`   ✅ تم الحفظ: ${(finalStats.size / 1024).toFixed(2)} KB`);
    console.log(`   📉 نسبة الضغط: ${compressionRatio}%`);
    
    return finalStats.size;
  } catch (error) {
    console.error(`   ❌ خطأ: ${error.message}`);
    throw error;
  }
}

async function processAllImages() {
  console.log('🎨 بدء ضغط صور الهيرو...\n');
  console.log('════════════════════════════════════════\n');
  
  // البحث عن الصور في مجلد المشروع
  const possibleNames = [
    'cairo-sunset.jpg',
    'cairo-night.jpg', 
    'pyramids-hotel.jpg',
    'pyramids-villas.jpg',
    'hero-1.jpg',
    'hero-2.jpg',
    'hero-3.jpg',
    'hero-4.jpg'
  ];
  
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  let processedCount = 0;
  
  // البحث في المجلدات المحتملة
  const searchDirs = [
    path.join(__dirname, '..', 'public', 'images', 'hero'),
    path.join(__dirname, '..', 'public', 'images'),
    __dirname
  ];
  
  for (const searchDir of searchDirs) {
    if (!fs.existsSync(searchDir)) continue;
    
    const files = fs.readdirSync(searchDir);
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        const inputPath = path.join(searchDir, file);
        const outputName = `hero-${processedCount + 1}.jpg`;
        const outputPath = path.join(outputDir, outputName);
        
        try {
          const originalStats = fs.statSync(inputPath);
          totalOriginalSize += originalStats.size;
          
          const compressedSize = await compressImage(inputPath, outputPath, 200);
          totalCompressedSize += compressedSize;
          processedCount++;
          
          if (processedCount >= 4) break;
        } catch (error) {
          console.error(`خطأ في معالجة ${file}:`, error.message);
        }
      }
    }
    
    if (processedCount >= 4) break;
  }
  
  console.log('\n════════════════════════════════════════');
  console.log('\n📊 النتائج النهائية:\n');
  console.log(`   عدد الصور المعالجة: ${processedCount}`);
  console.log(`   الحجم الأصلي الإجمالي: ${(totalOriginalSize / 1024).toFixed(2)} KB`);
  console.log(`   الحجم المضغوط الإجمالي: ${(totalCompressedSize / 1024).toFixed(2)} KB`);
  console.log(`   نسبة التوفير: ${((1 - (totalCompressedSize / totalOriginalSize)) * 100).toFixed(1)}%`);
  console.log(`\n✨ تم حفظ الصور في: ${outputDir}\n`);
}

// تشغيل السكريبت
processAllImages().catch(console.error);
