import React, { useState, ChangeEvent } from 'react';
import { Upload, FileText, Film, Sparkles, X, CheckCircle, Clapperboard, Quote, Camera, Music, Eye, Timer, Zap } from 'lucide-react';

// 1. Updated Interface to reflect a single, 30s scene evolution
interface TrailerScene {
  video_prompt: string;
  camera_choreography: string; // Renamed for complexity
  audio_landscape: string;
  voiceover_script: string;
  visual_metaphor: string;
  lighting_evolution: string; // New field from our system prompt
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

      // 3. Update to access the single 'scene' key from your FastAPI response
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
      {/* Background Blobs */}
      <div className="fixed top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="fixed top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative max-w-4xl w-full">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] p-8 md:p-10 border border-white/20">
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4 rotate-3">
              <Film className="text-white w-7 h-7" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">TrailerForge</h1>
            <p className="text-slate-500 mt-2 font-medium">One Shot. One Vision. Total Immersion.</p>
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
                    <p className="text-slate-400 text-sm">PDF or Image (parsed by Vision AI)</p>
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
                      <p className="text-xs text-slate-400">Contextualizing Narrative...</p>
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
                <h3 className="text-xl font-bold text-slate-800">Directing the Long Take...</h3>
                <p className="text-slate-500 animate-pulse">Calculating 30-second camera choreography</p>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center animate-in fade-in zoom-in">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4"><CheckCircle className="w-10 h-10 text-emerald-500" /></div>
                <h3 className="text-2xl font-bold text-slate-900">Cinematic Masterpiece Ready</h3>
                <p className="text-slate-500">One continuous shot generated from your text</p>
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
              <span>{step === 3 ? "Script Lock" : "Generate 30s Trailer"}</span>
            </div>
          </button>
        </div>

        {/* 4. Displaying the Single Scene Evolution */}
        {step === 3 && scene && (
          <div className="mt-8 space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-1000 fill-mode-both pb-20">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Director's Shot List</h2>
              <button onClick={() => { setStep(0); setSelectedFile(null); setVideoUrl(null); }} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">New Project</button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl relative overflow-hidden">
              {/* Watermark for 30s logic */}
              <div className="absolute top-10 right-[-40px] rotate-45 bg-indigo-600 text-white px-12 py-1 text-[10px] font-black tracking-[0.3em] uppercase">
                30 Seconds Continuous
              </div>

              {/* VIDEO PLAYER SECTION */}
              {videoUrl && (
                <div className="mb-10 rounded-2xl overflow-hidden shadow-lg border-4 border-slate-900 aspect-[9/16] max-w-sm mx-auto bg-black">
                  <video controls autoPlay className="w-full h-full object-cover">
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              <div className="flex items-center gap-4 mb-10">
                <span className="flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black tracking-widest uppercase">The Sequence</span>
                <span className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-indigo-600" /> {scene.mood}
                </span>
              </div>

              <div className="grid lg:grid-cols-5 gap-10">
                {/* Visual Narrative Column */}
                <div className="lg:col-span-3 space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-3 text-slate-400">
                      <Clapperboard className="w-5 h-5" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Visual Narrative Arc</p>
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed text-lg italic">"{scene.video_prompt}"</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <Camera className="w-4 h-4" />
                        <p className="text-[9px] font-black uppercase tracking-widest">Choreography</p>
                      </div>
                      <p className="text-slate-700 text-sm font-semibold">{scene.camera_choreography}</p>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <Sparkles className="w-4 h-4" />
                        <p className="text-[9px] font-black uppercase tracking-widest">Lighting Evolution</p>
                      </div>
                      <p className="text-slate-700 text-sm font-semibold">{scene.lighting_evolution}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100">
                    <Eye className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                    <div>
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Metaphoric Anchor (Anti-Spoiler)</p>
                      <p className="text-emerald-900 text-sm italic">{scene.visual_metaphor}</p>
                    </div>
                  </div>
                </div>

                {/* Audio & Script Column */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="p-8 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-100 relative">
                    <Quote className="absolute top-4 right-4 w-10 h-10 text-white/10" />
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-4">Voiceover Fragments</p>
                    <p className="text-xl font-serif italic leading-snug">"{scene.voiceover_script}"</p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-3 text-slate-400">
                      <Music className="w-5 h-5" />
                      <p className="text-[10px] font-black uppercase tracking-widest">30s Soundscape</p>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{scene.audio_landscape}</p>
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