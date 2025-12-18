
import React, { useState } from 'react';
import { 
  CheckCircle, 
  Loader2, 
  AlertTriangle,
  FileDown,
  Info,
  BookOpen,
  History,
  Languages,
  RefreshCw,
  Sparkles,
  Zap,
  Layout,
  User
} from 'lucide-react';
import { ProcessingStatus, StructuredDocument } from './types';
import { analyzeText } from './services/geminiService';
import { generateSaudiDocx } from './services/docxService';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState('');

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    
    setStatus(ProcessingStatus.ANALYZING);
    setErrorMessage('');
    
    try {
      const structuredData = await analyzeText(inputText);
      setStatus(ProcessingStatus.GENERATING);
      const blob = await generateSaudiDocx(structuredData);
      
      const url = URL.createObjectURL(blob);
      const safeDate = new Date().toLocaleDateString('ar-SA').replace(/[\/\s]/g, '-');
      const fileName = `بحث_منسق_${safeDate}.docx`;
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 300);
      
      setStatus(ProcessingStatus.SUCCESS);
    } catch (error: any) {
      console.error("Critical Processing Error:", error);
      setErrorMessage(error.message || 'حدث خطأ تقني غير متوقع. يرجى المحاولة لاحقاً.');
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const handleReset = () => {
    setInputText('');
    setStatus(ProcessingStatus.IDLE);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#fcfdfd] flex flex-col items-center py-10 px-4 select-none" dir="rtl">
      {/* Platform Header */}
      <header className="w-full max-w-5xl text-center mb-8">
        <div className="flex flex-col items-center gap-4 mb-2">
          <div className="bg-[#1a4731] p-5 rounded-3xl shadow-2xl border-b-4 border-amber-600 mb-2">
            <BookOpen className="text-amber-400 w-12 h-12" />
          </div>
          <div className="relative">
            <h1 className="text-4xl lg:text-5xl font-black text-[#1a4731] mb-2 tracking-tight">
              منصة تنسيق البحوث الأكاديمية
            </h1>
            <span className="absolute -top-4 -left-12 lg:-left-16 bg-amber-500 text-white text-[10px] lg:text-xs font-black px-3 py-1 rounded-full shadow-sm animate-pulse">
              إصدار تجريبي
            </span>
          </div>
          <p className="text-slate-500 font-bold text-lg flex items-center gap-2">
            <Languages className="w-5 h-5 text-amber-600" />
            الأداة الذكية الأولى لتنسيق البحوث وفق معايير الجامعات السعودية
          </p>
        </div>
      </header>

      <main className="w-full max-w-5xl space-y-6">
        {/* Service Introduction Section */}
        <section className="bg-white border border-emerald-100 rounded-[2rem] p-6 lg:p-8 shadow-sm flex flex-col lg:flex-row gap-6 items-start">
          <div className="bg-emerald-50 p-4 rounded-2xl shrink-0">
            <Sparkles className="w-8 h-8 text-[#1a4731]" />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-black text-[#1a4731]">ماذا تقدم لك المنصة؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex gap-3">
                <div className="mt-1 bg-amber-100 p-1.5 rounded-lg h-fit"><Zap className="w-4 h-4 text-amber-700" /></div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">تحويل النصوص الخام إلى مستندات Word احترافية خلال ثوانٍ معدودة.</p>
              </div>
              <div className="flex gap-3">
                <div className="mt-1 bg-emerald-100 p-1.5 rounded-lg h-fit"><Layout className="w-4 h-4 text-emerald-700" /></div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">ضبط الهوامش، العناوين، وخطوط Traditional Arabic المعتمدة أكاديمياً.</p>
              </div>
              <div className="flex gap-3">
                <div className="mt-1 bg-blue-100 p-1.5 rounded-lg h-fit"><Info className="w-4 h-4 text-blue-700" /></div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">معالجة الحواشي السفلية وربطها آلياً بمكانها الصحيح في كل صفحة.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-white rounded-[2.5rem] shadow-[0_25px_70px_-15px_rgba(26,71,49,0.12)] border border-slate-100 overflow-hidden relative">
          
          {/* Status Notification Bar */}
          {status !== ProcessingStatus.IDLE && (
            <div className={`px-10 py-6 flex items-center justify-between border-b-2 transition-all duration-500 ${
              status === ProcessingStatus.ANALYZING || status === ProcessingStatus.GENERATING ? 'bg-amber-50 border-amber-200 text-amber-900' :
              status === ProcessingStatus.SUCCESS ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              <div className="flex items-center gap-4 text-lg font-black">
                {(status === ProcessingStatus.ANALYZING || status === ProcessingStatus.GENERATING) && <Loader2 className="w-7 h-7 animate-spin text-amber-600" />}
                {status === ProcessingStatus.ANALYZING && "جاري معالجة الهيكل الأكاديمي..."}
                {status === ProcessingStatus.GENERATING && "جاري حقن التنسيقات في ملف Word..."}
                {status === ProcessingStatus.SUCCESS && <><CheckCircle className="w-7 h-7 text-emerald-600" /> تم التنسيق والتصدير بنجاح!</>}
                {status === ProcessingStatus.ERROR && <><AlertTriangle className="w-7 h-7" /> {errorMessage}</>}
              </div>
              {status === ProcessingStatus.SUCCESS && (
                <button onClick={handleReset} className="flex items-center gap-2 bg-[#1a4731] text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#123323] transition-all">
                  <RefreshCw className="w-4 h-4" /> بحث جديد
                </button>
              )}
            </div>
          )}

          <div className="p-10">
            <div className="flex items-center justify-between mb-6">
              <label className="text-2xl font-black text-[#1a4731] flex items-center gap-3">
                <History className="w-7 h-7 text-amber-600" />
                مسودة البحث الخام
              </label>
              <div className="text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                جاهز للمعالجة الفورية
              </div>
            </div>

            <textarea
              className="w-full h-[450px] p-10 bg-[#f9fafb] border-2 border-slate-100 rounded-[2.5rem] focus:ring-8 focus:ring-emerald-50/50 focus:border-[#1a4731] outline-none transition-all text-right arabic-academic text-2xl leading-[1.9] shadow-inner font-medium placeholder:text-slate-300"
              placeholder="الصق نص البحث هنا... اترك الباقي لخبير التنسيق."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={status === ProcessingStatus.ANALYZING || status === ProcessingStatus.GENERATING}
            />

            <div className="mt-10 flex flex-col lg:flex-row gap-8 items-center">
              <div className="flex-grow bg-[#f0f7f3] rounded-[2rem] p-8 border border-[#1a4731]/5 w-full">
                <h3 className="text-xl font-black text-[#1a4731] mb-4 flex items-center gap-3">
                  <Info className="w-6 h-6 text-amber-600" />
                  بروتوكول التصدير المعتمد
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-md text-[#1a4731]/70 font-bold">
                  <div className="flex items-center gap-2">• هامش التجليد (3سم يمين)</div>
                  <div className="flex items-center gap-2">• أرقام عربية شرقية (١٢٣)</div>
                  <div className="flex items-center gap-2">• خط Traditional Arabic (١٦)</div>
                  <div className="flex items-center gap-2">• إعادة ترقيم الحواشي لكل صفحة</div>
                </div>
              </div>

              <button
                onClick={handleProcess}
                disabled={!inputText.trim() || status === ProcessingStatus.ANALYZING || status === ProcessingStatus.GENERATING}
                className={`lg:w-80 w-full relative py-8 px-10 rounded-[2.5rem] font-black text-2xl text-white transition-all shadow-2xl flex flex-col items-center justify-center gap-3 ${
                  !inputText.trim() || status === ProcessingStatus.ANALYZING || status === ProcessingStatus.GENERATING
                    ? 'bg-slate-300'
                    : 'bg-[#1a4731] hover:bg-[#123323] active:scale-95 shadow-[#1a4731]/25'
                }`}
              >
                {status === ProcessingStatus.ANALYZING || status === ProcessingStatus.GENERATING ? (
                  <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
                ) : (
                  <>
                    <FileDown className="w-10 h-10 text-amber-400" />
                    <span>تنسيق وتصدير</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Professional Credits & Footer */}
        <footer className="mt-12 text-center pb-8">
          <div className="inline-flex items-center gap-3 bg-[#1a4731]/5 px-8 py-3 rounded-full border border-[#1a4731]/10 mb-6">
            <User className="w-5 h-5 text-amber-600" />
            <span className="text-[#1a4731] font-black text-lg">فكرة إعداد: د. عبدالغني نصر</span>
          </div>
          <p className="text-[#1a4731]/40 font-bold text-sm mb-4">متوافق مع أدلة تنسيق الرسائل العلمية في جامعات المملكة</p>
          <div className="text-slate-400 font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-4">
            <span>SA-DocX Professional v2.9</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Beta Engine</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
