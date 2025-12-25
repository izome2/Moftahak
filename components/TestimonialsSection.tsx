'use client';

import React, { useRef } from 'react';
import { Quote, User } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
}

const TestimonialsSection: React.FC = () => {
  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'أحمد محمود',
      role: 'مالك وحدة فندقية',
      text: 'بفضل ربنا ثم عبد الله، الوحدة اشتغلت كنشاط فندقي حقيقي مش مجرد إيجار. النظام واضح والنتائج ظهرت بسرعة. الحجوزات بقت منتظمة والدخل ثابت.✨',
    },
    {
      id: 2,
      name: 'سارة عبد الرحمن',
      role: 'مستثمرة عقارية',
      text: 'عبد الله غيّر طريقة تفكيري في التشغيل بالكامل، كل قرار بقى مبني على أرقام مش اجتهاد. التحليلات اللي بيقدمها ساعدتني أحقق عائد أفضل على الاستثمار.📊',
    },
    {
      id: 3,
      name: 'محمد علي',
      role: 'مالك وحدات قصيرة الأجل',
      text: 'بعد تطبيق النظام، الدخل استقر والإدارة بقت أسهل بكتير. فرق واضح في الأداء وفي تعامل الضيوف، والتقييمات بقت أحسن بشكل ملحوظ.',
    },
    {
      id: 4,
      name: 'نورهان السيد',
      role: 'مضيفة Airbnb',
      text: 'توجيه عبد الله في تحسين تجربة الضيوف رفع التقييمات وزوّد الحجوزات بشكل ملحوظ. كل تفصيلة صغيرة بقت لها تأثير كبير على رضا الضيوف.',
    },
    {
      id: 5,
      name: 'خالد حسن',
      role: 'مضيف جديد',
      text: 'كنت تايه في التفاصيل، ومع خطة عبد الله التشغيل بقى بسيط وواضح. الخطوات المنظمة خلتني أبدأ صح من أول يوم وأتجنب أخطاء كتير.💡',
    },
    {
      id: 6,
      name: 'مريم أحمد',
      role: 'مديرة تشغيل',
      text: 'تنظيم التشغيل اليومي وتدريب الفريق فرق جدًا في مستوى الخدمة. الفريق بقى عارف دوره بالظبط وده انعكس على سرعة الاستجابة وجودة الخدمة.',
    },
    {
      id: 7,
      name: 'إسلام فتحي',
      role: 'مستثمر شقق فندقية',
      text: 'عبد الله اشتغل على الوحدة كأنها مشروع كامل مش مجرد شقة للإيجار. الاهتمام بكل التفاصيل من التسويق للتشغيل حوّل الوحدة لمشروع مربح فعلاً.🏆',
    },
    {
      id: 8,
      name: 'ياسر شوقي',
      role: 'مالك وحدة',
      text: 'من أول استشارة مع عبد الله كان واضح إن في خطة حقيقية قابلة للتنفيذ. مش بس كلام نظري، كل حاجة مدروسة ومبنية على تجربة عملية.',
    },
    {
      id: 9,
      name: 'دينا سمير',
      role: 'مضيفة قصيرة الأجل',
      text: 'التسعير بقى ذكي ومتغير حسب السوق، والنتيجة ظهرت مباشرة في الدخل. بدل ما كنت بحدد سعر ثابت، دلوقتي بستفيد من كل موسم وفترة.💰',
    },
    {
      id: 10,
      name: 'عمر خالد',
      role: 'شريك استثماري',
      text: 'الشفافية في الأرقام والمتابعة المستمرة خلتني مطمئن على الاستثمار. التقارير الدورية بتوضح كل حاجة، وده بيخليني واثق في القرارات.',
    },
    {
      id: 11,
      name: 'هشام فؤاد',
      role: 'مستثمر عقاري',
      text: 'اللي يميّز الخدمة إنها مبنية للتوسع، وده كان واضح في طريقة إدارة عبد الله. بدأت بوحدة واحدة ودلوقتي عندي خطة واضحة لإضافة وحدات تانية.🚀',
    },
    {
      id: 12,
      name: 'رانيا حسين',
      role: 'مالكة شقة فندقية',
      text: 'فرق شاسع بين قبل وبعد تطبيق نظام عبد الله. التشغيل بقى احترافي بالكامل، والضيوف بيلاحظوا الفرق في مستوى الخدمة والاهتمام بالتفاصيل.',
    },
  ];

  // تقسيم الشهادات إلى صفين
  const row1Testimonials = testimonials.filter((_, index) => index % 2 === 0);
  const row2Testimonials = testimonials.filter((_, index) => index % 2 !== 0);
  
  // تكرار كل صف لضمان حركة مستمرة
  const duplicatedRow1 = [...row1Testimonials, ...row1Testimonials, ...row1Testimonials];
  const duplicatedRow2 = [...row2Testimonials, ...row2Testimonials, ...row2Testimonials];

  return (
    <section className="py-20 bg-white overflow-hidden" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4 font-bristone flex items-center justify-center gap-3">
            آراء عملاء سابقين وتجارب حقيقية 
          </h2>
          <p className="text-lg text-secondary/70 max-w-2xl mx-auto">
            عملائي هم أفضل من يتحدث عن تجاربي
          </p>
        </div>

        {/* Scrolling Testimonials */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-white to-transparent z-10 pointer-events-none"></div>
          
          {/* First Row - Scrolling Left to Right */}
          <div className="overflow-hidden mb-6">
            <div 
              ref={scrollRef1}
              className="flex gap-6 animate-scroll-ltr"
            >
              {duplicatedRow1.map((testimonial, index) => (
                <div
                  key={`row1-${index}`}
                  className="relative shrink-0 w-125 rounded-2xl overflow-hidden bg-[#ead3b9]/20 p-8 border-2 border-[#ead3b9]"
                >
                  {/* Background Icon */}
                  <div className="absolute -top-8 -left-8 z-0 opacity-5">
                    <div className="text-secondary relative">
                      <Quote size={256} fill="currentColor" />
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <div className="relative z-10">
                    <p className="text-secondary/80 leading-relaxed mb-6 min-h-30">
                      {testimonial.text}
                    </p>

                    {/* Author Info with Avatar */}
                    <div className="pt-4 border-t-0 flex items-center justify-between relative">
                      {/* Gradient Border */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-secondary/10 to-transparent"></div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 border-2 border-secondary/20">
                          <User size={24} className="text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-secondary mb-1">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-secondary/60">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="text-secondary">
                        <Quote size={28} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Second Row - Scrolling Left to Right */}
          <div className="overflow-hidden">
            <div 
              ref={scrollRef2}
              className="flex gap-6 animate-scroll-ltr-delayed"
            >
              {duplicatedRow2.map((testimonial, index) => (
                <div
                  key={`row2-${index}`}
                  className="relative shrink-0 w-125 rounded-2xl overflow-hidden bg-[#ead3b9]/20 p-8 border-2 border-[#ead3b9]"
                >
                  {/* Background Icon */}
                  <div className="absolute -top-8 -left-8 z-0 opacity-5">
                    <div className="text-secondary relative">
                      <Quote size={256} fill="currentColor" />
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <div className="relative z-10">
                    <p className="text-secondary/80 leading-relaxed mb-6 min-h-30">
                      {testimonial.text}
                    </p>

                    {/* Author Info with Avatar */}
                    <div className="pt-4 border-t-0 flex items-center justify-between relative">
                      {/* Gradient Border */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-secondary/10 to-transparent"></div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 border-2 border-secondary/20">
                          <User size={24} className="text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-secondary mb-1">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-secondary/60">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="text-secondary">
                        <Quote size={28} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-ltr {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(50%));
          }
        }

        .animate-scroll-ltr {
          animation: scroll-ltr 10s linear infinite;
          will-change: transform;
        }

        .animate-scroll-ltr-delayed {
          animation: scroll-ltr 10s linear infinite;
          animation-delay: -5s;
          will-change: transform;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;
