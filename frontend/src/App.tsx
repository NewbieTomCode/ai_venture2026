import React, { useState, ChangeEvent } from 'react';
import { Upload, FileText, Film, Sparkles, X, CheckCircle, Clapperboard, Quote, Camera, Music, Eye, Timer } from 'lucide-react';

// TypeScript version of your Pydantic BaseClass
interface TrailerScene {
  video_prompt: string;
  camera_movement: string;
  audio_landscape: string;
  voiceover_script: string;
  visual_metaphor: string;
  mood: string;
  duration_seconds: number;
}

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(0); 
  const [scenes, setScenes] = useState<TrailerScene[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setStep(0);
      setScenes([]);
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
      setScenes(data.scenes);
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

      <div className="relative max-w-3xl w-full">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] p-8 md:p-10 border border-white/20">
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4 rotate-3">
              <Film className="text-white w-7 h-7" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">TrailerForge</h1>
            <p className="text-slate-500 mt-2 font-medium">Elevate your manuscript into cinema</p>
          </div>

          {!isProcessing && step !== 3 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <label className="group relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="p-4 bg-slate-50 rounded-full group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-600 font-semibold text-lg">Drop your book cover</p>
                    <p className="text-slate-400 text-sm">PNG, JPG, or PDF (Max 10MB)</p>
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
                      <p className="text-xs text-slate-400">Ready for analysis</p>
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
                <h3 className="text-xl font-bold text-slate-800">Directing your trailer...</h3>
                <p className="text-slate-500 animate-pulse">Vision AI is reading and Gemini is scripting</p>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center animate-in fade-in zoom-in">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4"><CheckCircle className="w-10 h-10 text-emerald-500" /></div>
                <h3 className="text-2xl font-bold text-slate-900">Script Complete</h3>
                <p className="text-slate-500">Your cinematic vision is ready for production</p>
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
              <span>{step === 3 ? "Trailer Generated" : "Create Masterpiece"}</span>
            </div>
          </button>
        </div>

        {step === 3 && scenes.length > 0 && (
          <div className="mt-8 space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-1000 fill-mode-both pb-20">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Director's Shot List</h2>
              <button onClick={() => {setStep(0); setSelectedFile(null);}} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">New Project</button>
            </div>

            <div className="grid gap-8">
              {scenes.map((scene, index) => (
                <div key={index} className="group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-900 text-white font-bold">{index + 1}</span>
                      <span className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600">{scene.mood}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                      <Timer className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">{scene.duration_seconds}s</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <Clapperboard className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Visual Prompt</p>
                          <p className="text-slate-800 font-medium leading-relaxed">{scene.video_prompt}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Camera className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Camera Movement</p>
                          <p className="text-slate-700">{scene.camera_movement}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Eye className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Visual Metaphor</p>
                          <p className="text-slate-600 italic text-sm">{scene.visual_metaphor}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 relative">
                        <Quote className="absolute -top-3 -left-1 w-8 h-8 text-indigo-200 -rotate-12" />
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Voiceover Script</p>
                        <p className="text-indigo-900 font-bold italic text-lg leading-snug">"{scene.voiceover_script}"</p>
                      </div>
                      <div className="flex gap-4 px-2">
                        <Music className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Audio Landscape</p>
                          <p className="text-slate-600 text-sm">{scene.audio_landscape}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}