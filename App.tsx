
import React, { useState, useRef, useCallback } from 'react';
import { Cycle, EvaluationResult } from './types';
import { CYCLE_LABELS } from './constants';
import { evaluateText, FileData } from './services/geminiService';
import { Button } from './components/Button';
import { EvaluationCard } from './components/EvaluationCard';

const App: React.FC = () => {
  const [cycle, setCycle] = useState<Cycle | ''>('');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile({
          base64: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("No s'ha pogut accedir a la càmera. Si us plau, revisa els permisos del navegador.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg');
        setSelectedFile({
          base64: base64,
          mimeType: 'image/jpeg'
        });
        stopCamera();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycle || (!text.trim() && !selectedFile)) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await evaluateText(text, cycle as Cycle, selectedFile || undefined);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('S\'ha produït un error en analitzar el contingut. Si us plau, torna-ho a provar d\'aquí a uns moments.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setText('');
    setCycle('');
    setSelectedFile(null);
    setError(null);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 max-w-5xl mx-auto pt-10">
      <header className="text-center mb-12">
        <div className="inline-block p-3 rounded-2xl bg-indigo-600 text-white mb-6 shadow-xl shadow-indigo-200">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
          Corrector d'Expressió Escrita
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Eina d'assessorament pedagògic per a l'avaluació competencial de l'expressió escrita. Importa PDF, fotos de quaderns o escriu directament el text.
        </p>
      </header>

      {!result ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10 space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
              1. Selecciona el cicle educatiu
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.keys(CYCLE_LABELS) as Cycle[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCycle(c)}
                  className={`px-4 py-3 rounded-xl border-2 transition-all text-sm font-semibold flex items-center justify-between
                    ${cycle === c 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/20' 
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                    }`}
                >
                  {CYCLE_LABELS[c]}
                  {cycle === c && (
                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider flex justify-between items-center">
              2. Contingut de l'alumne o alumna
              <span className="text-[10px] font-normal normal-case text-slate-400">Pots escriure o pujar un fitxer</span>
            </label>
            
            <div className="space-y-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escriu aquí el text o adjunta una foto del treball..."
                className="w-full min-h-[200px] p-6 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none text-slate-800 leading-relaxed"
              />

              <div className="flex flex-wrap gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Importar PDF / Imatge
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Fer una foto
                </button>
                
                {selectedFile && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-sm animate-in fade-in zoom-in duration-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="max-w-[150px] truncate">Document preparat</span>
                    <button type="button" onClick={removeFile} className="text-indigo-400 hover:text-indigo-600 ml-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 pt-4 border-t border-slate-100">
            <Button 
              type="submit" 
              isLoading={isLoading} 
              disabled={!cycle || (!text.trim() && !selectedFile)}
              className="w-full md:w-auto min-w-[200px]"
            >
              Començar l'avaluació
            </Button>
            <p className="text-xs text-slate-400 italic">
              L'IA analitzarà el contingut basant-se en les rúbriques oficials. S'accepten captures d'imatge i fitxers PDF.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                {CYCLE_LABELS[cycle as Cycle]}
              </span>
              <h2 className="text-slate-500 text-sm font-medium">Anàlisi competencial completada</h2>
            </div>
            <Button variant="outline" onClick={handleReset} className="py-2 px-4 text-xs">
              Nova correcció
            </Button>
          </div>
          <EvaluationCard result={result} />
        </div>
      )}

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Captura el treball</h3>
              <button onClick={stopCamera} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative aspect-video bg-black">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 flex justify-center gap-4">
              <Button onClick={capturePhoto} className="min-w-[150px]">
                Capturar
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                Cancel·lar
              </Button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}

      <footer className="mt-20 border-t border-slate-200 pt-8 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Assessor Pedagògic - Pau Casals</p>
      </footer>
    </div>
  );
};

export default App;
