
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { TranscriptionResponse, Emotion } from '../types';
import { User, Clock, Globe, Languages, Smile, Frown, AlertCircle, Meh, Edit3, Copy, Download } from 'lucide-react';
import Button from './Button';

interface TranscriptionDisplayProps {
  data: TranscriptionResponse;
  onReset: () => void;
  audioUrl: string | null;
  audioBlob?: Blob | null;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ data, onReset, audioUrl, audioBlob }) => {
  
  const getEmotionBadge = (emotion?: Emotion) => {
    if (!emotion) return null;
    const commonClasses = "flex items-center px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset transition-all duration-300";
    
    switch (emotion) {
      case Emotion.Happy:
        return (
          <div className={`${commonClasses} bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800`}>
            <Smile size={12} className="mr-1.5" />
            {emotion}
          </div>
        );
      case Emotion.Sad:
        return (
          <div className={`${commonClasses} bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 ring-sky-200 dark:ring-sky-800`}>
            <Frown size={12} className="mr-1.5" />
            {emotion}
          </div>
        );
      case Emotion.Angry:
        return (
          <div className={`${commonClasses} bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 ring-rose-200 dark:ring-rose-800`}>
            <AlertCircle size={12} className="mr-1.5" />
            {emotion}
          </div>
        );
      case Emotion.Neutral:
      default:
        return (
          <div className={`${commonClasses} bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-800`}>
            <Meh size={12} className="mr-1.5" />
            {emotion}
          </div>
        );
    }
  };

  const downloadFile = (content: string | Blob, fileName: string, contentType: string) => {
    const a = document.createElement('a');
    const file = content instanceof Blob ? content : new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportAsTxt = () => {
    let content = `Agha-Voxify Transcription\n\nSUMMARY:\n${data.summary}\n\nTRANSCRIPT:\n`;
    data.segments.forEach(s => {
      content += `[${s.timestamp}] ${s.speaker}: ${s.content}\n\n`;
    });
    downloadFile(content, 'transcript.txt', 'text/plain');
  };

  const copyTranscript = () => {
    const text = data.segments.map(s => `[${s.timestamp}] ${s.speaker}: ${s.content}`).join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      alert("Transcript copied to clipboard!");
    });
  };

  const downloadAudio = () => {
    if (audioBlob) {
      downloadFile(audioBlob, 'original_audio.webm', 'audio/webm');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 no-italic">
      
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Transcription Results</h2>
        <Button onClick={onReset} variant="secondary" className="px-4 py-1.5 text-sm rounded-lg bg-white border-slate-200 text-slate-700">
          Start Over
        </Button>
      </div>

      {audioUrl && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <audio controls src={audioUrl} className="w-full h-10 filter dark:invert" />
        </div>
      )}

      {/* Summary Section */}
      <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-6 sm:p-8 relative">
        <div className="absolute top-6 right-8 text-blue-200 dark:text-blue-900/50">
          <Edit3 size={32} />
        </div>
        <h3 className="text-blue-700 dark:text-blue-400 font-extrabold text-sm uppercase tracking-wider mb-3">Summary</h3>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base no-italic">
          {data.summary}
        </p>
      </div>

      {/* Detailed Transcript Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white px-1">Detailed Transcript</h3>
        
        {data.segments.map((segment, index) => {
          const isUrdu = segment.language?.toLowerCase().includes('urdu');
          return (
            <div 
              key={index} 
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all"
            >
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="flex items-center font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full text-[11px]">
                  <User size={12} className="mr-1.5" />
                  {segment.speaker}
                </div>
                <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 px-3 py-1 rounded-full text-[11px] font-bold text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                  <Clock size={12} className="mr-1.5" />
                  {segment.timestamp}
                </div>
                <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 px-3 py-1 rounded-full text-[11px] font-bold text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                  <Globe size={12} className="mr-1.5" />
                  {segment.language}
                </div>
                {segment.emotion && getEmotionBadge(segment.emotion)}
              </div>
              
              <p 
                className={`text-slate-700 dark:text-slate-300 leading-relaxed font-medium pl-1 no-italic ${isUrdu ? 'urdu-font text-right' : 'text-[16px]'}`}
                dir={isUrdu ? 'rtl' : 'ltr'}
              >
                {segment.content}
              </p>

              {segment.translation && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                   <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed no-italic">
                     <Languages size={14} className="inline mr-2 opacity-60" />
                     {segment.translation}
                   </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions Footer Bar */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
          <button onClick={exportAsTxt} className="flex items-center px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
            Export as TXT
          </button>
          <button onClick={copyTranscript} className="flex items-center px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
            <Copy size={14} className="mr-2" /> Copy Transcript
          </button>
          <button onClick={downloadAudio} className="flex items-center px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={14} className="mr-2" /> Download Audio
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionDisplay;
