import React, { useState, ChangeEvent } from 'react';
import { Upload, FileText, Film, Sparkles, X, CheckCircle, Clapperboard, Quote, Zap } from 'lucide-react';

interface TrailerScene {
  video_prompt: string;
  camera_choreography: string;
  audio_landscape: string;
  voiceover_script: string;
  visual_metaphor: string;
  lighting_evolution: string;
  mood: string;
}

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(0); 
  const [scene, setScene] = useState<TrailerScene | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setStep(0);
      setScene(null);
      setVideoUrl(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setStep(1);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8000/processing/generate-trailer', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error("Backend response failed");
      const data = await response.json();

      setScene(data.scene);
      if (data.video_blob) {
        setVideoUrl(`http://localhost:8000/media/video/${data.video_blob}`);
      }
      setStep(3);
    } catch (error) {
      console.error("Pipeline error:", error);
      alert("AI pipeline failed. Check if your backend is running!");
      setStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center p-4 md:p-12 selection:bg-indigo-100">
      <div className="fixed top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="fixed top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative max-w-4xl w-full">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] p-8 md:p-10 border border-white/20">
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4 rotate-3">
              <Film className="text-white w-7 h-7" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SceneForge</h1>
            <p className="text-slate-500 mt-2 font-medium">15 Seconds. Pure Narrative. Total Immersion.</p>
          </div>

          {!isProcessing && step !== 3 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <label className="group relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="p-4 bg-slate-50 rounded-full group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-600 font-semibold text-lg">Upload Manuscript Source</p>
                    <p className="text-slate-400 text-sm">PDF or Image for 15s Teaser</p>
                  </div>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
              </label>

              {selectedFile && (
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><FileText className="w-5 h-5" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 truncate w-48">{selectedFile.name}</p>
                      <p className="text-xs text-slate-400">Ready for 15s generation...</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="p-2 text-slate-300 hover:text-red-400"><X className="w-5 h-5" /></button>
                </div>
              )}
            </div>
          ) : isProcessing ? (
            <div className="py-12 space-y-8 text-center animate-in fade-in zoom-in">
              <div className="relative flex justify-center">
                <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" /></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Directing 15s Narrative...</h3>
                <p className="text-slate-500 animate-pulse">Processing cinematic continuous shot</p>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center animate-in fade-in zoom-in">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4"><CheckCircle className="w-10 h-10 text-emerald-500" /></div>
                <h3 className="text-2xl font-bold text-slate-900">15s Masterpiece Ready</h3>
                <p className="text-slate-500">Directly inspired by your source material</p>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!selectedFile || isProcessing || step === 3}
            className="group relative w-full mt-8 overflow-hidden bg-slate-900 rounded-2xl py-4 font-bold text-white shadow-xl hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 transition-all active:scale-[0.98]"
          >
            <div className="relative flex items-center justify-center gap-2">
              {step === 3 ? <CheckCircle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              <span>{step === 3 ? "Shot Complete" : "Generate 15s Teaser"}</span>
            </div>
          </button>
        </div>

        {step === 3 && scene && (
          <div className="mt-8 space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-1000 fill-mode-both pb-20">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Final Cut</h2>
              <button onClick={() => { setStep(0); setSelectedFile(null); setVideoUrl(null); }} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">New Teaser</button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl relative overflow-hidden">
              <div className="absolute top-10 right-[-40px] rotate-45 bg-indigo-600 text-white px-12 py-1 text-[10px] font-black tracking-[0.3em] uppercase">
                15 Seconds
              </div>

              {videoUrl && (
                <div className="mb-10 rounded-2xl overflow-hidden shadow-lg border-4 border-slate-900 aspect-[9/16] max-w-sm mx-auto bg-black">
                  <video controls autoPlay className="w-full h-full object-cover">
                    <source src={videoUrl} type="video/mp4" />
                  </video>
                </div>
              )}

              <div className="space-y-10">
                {/* Unified Visual & Script Section */}
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <Clapperboard className="w-5 h-5" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Visual Narrative Arc</p>
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed text-xl italic px-4">
                      "{scene.video_prompt}"
                    </p>
                  </div>

                  <div className="relative p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200">
                    <Quote className="absolute -top-4 -left-2 w-12 h-12 text-white/20" />
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-4 h-4 fill-indigo-300 text-indigo-300" />
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Voiceover Fragment</p>
                    </div>
                    <p className="text-2xl font-serif italic leading-snug text-center">
                      "{scene.voiceover_script}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}