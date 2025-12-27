
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useMemo } from 'react';
import { Mic, Upload, Sparkles, AlertTriangle, Moon, Sun, AudioLines, Loader2 } from 'lucide-react';
import AudioRecorder from './components/AudioRecorder';
import FileUploader from './components/FileUploader';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import Button from './components/Button';
import SplashScreen from './components/SplashScreen';
import { transcribeAudio } from './services/geminiService';
import { AppStatus, AudioData, TranscriptionResponse } from './types';

// Internet Status Component with Blinking Green Dot
const InternetStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center space-x-2.5 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300">
      <div className="relative flex items-center justify-center">
        {isOnline ? (
          <>
            <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-green-400 opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
          </>
        ) : (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
        )}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isOnline ? 'Internet Connected' : 'Internet Not Connected'}
      </span>
    </div>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [mode, setMode] = useState<'record' | 'upload'>('record');
  const [status, setStatus] = useState<AppStatus>('idle');
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [result, setResult] = useState<TranscriptionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const isProcessing = status === 'processing';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const audioUrl = useMemo(() => {
    if (audioData?.blob) {
      return URL.createObjectURL(audioData.blob);
    }
    return null;
  }, [audioData]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleAudioReady = (data: AudioData) => {
    setAudioData(data);
    setError(null);
    setResult(null);
  };

  const handleTranscribe = async () => {
    if (!audioData) return;
    setStatus('processing');
    setError(null);
    try {
      const data = await transcribeAudio(audioData.base64, audioData.mimeType);
      setResult(data as TranscriptionResponse);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during transcription. Please try again.");
      setStatus('error');
    }
  };

  const handleReset = () => {
    setAudioData(null);
    setResult(null);
    setStatus('idle');
    setError(null);
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-500 animate-in fade-in duration-1000">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-2 rounded-lg text-white shadow-md">
              <AudioLines size={20} />
            </div>
            <h1 className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-purple-600">
              Agha-Voxify
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <InternetStatusIndicator />
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {!isSuccess && (
          <div className="text-center mb-10 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Powered <span className="text-gradient-brand">Audio Intelligence</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Professional transcription, speaker identification, and emotion analysis in seconds.
            </p>
          </div>
        )}

        {isError && error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 flex items-start text-red-700 dark:text-red-400 animate-in fade-in zoom-in-95">
            <AlertTriangle className="mr-3 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!result && !isProcessing && (
            <div className="bg-white dark:bg-slate-900 p-1 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 flex mb-8 max-w-xs mx-auto">
            <button
                onClick={() => { setMode('record'); handleReset(); }}
                className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'record' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
                <Mic size={14} className="mr-2" />
                Record
            </button>
            <button
                onClick={() => { setMode('upload'); handleReset(); }}
                className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'upload' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
                <Upload size={14} className="mr-2" />
                Upload
            </button>
            </div>
        )}

        <div className="space-y-6">
          {isProcessing ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={48} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold">Processing Audio...</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Our AI is transcribing and labeling speakers.</p>
              </div>
            </div>
          ) : result ? (
            <TranscriptionDisplay 
              data={result} 
              onReset={handleReset} 
              audioUrl={audioUrl}
              audioBlob={audioData?.blob}
            />
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-1">
                  {mode === 'record' ? (
                    <AudioRecorder onAudioCaptured={handleAudioReady} disabled={isProcessing} />
                  ) : (
                    <FileUploader onFileSelected={handleAudioReady} disabled={isProcessing} />
                  )}
                </div>

                {audioData && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                      <Sparkles size={16} className="text-blue-500" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">File attached successfully</span>
                    </div>
                    <Button 
                      onClick={handleTranscribe} 
                      isLoading={isProcessing}
                      className="w-full sm:w-auto text-sm py-2 px-8"
                    >
                      Transcribe Now
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
