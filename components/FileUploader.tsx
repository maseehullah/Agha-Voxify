
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, X, AlertCircle } from 'lucide-react';
import { AudioData } from '../types';

interface FileUploaderProps {
  onFileSelected: (audioData: AudioData) => void;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  const processFile = (file: File) => {
    setError(null);
    
    // Robust validation for audio/video files
    const isAudio = file.type.startsWith('audio/');
    const isVideo = file.type.startsWith('video/');
    const isWavExtension = file.name.toLowerCase().endsWith('.wav');
    
    if (!isAudio && !isVideo && !isWavExtension) {
      setError("Please upload a valid audio or video file (MP3, WAV, M4A, etc.).");
      return;
    }

    // Size validation
    if (file.size > MAX_FILE_SIZE) {
      setError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 10MB.`);
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64 = base64String.split(',')[1];
      
      // If MIME type is missing or generic, fallback to audio/wav for .wav files
      const effectiveMimeType = (file.type && file.type !== 'application/octet-stream') 
        ? file.type 
        : (isWavExtension ? 'audio/wav' : 'audio/mpeg');

      onFileSelected({
        blob: file,
        base64,
        mimeType: effectiveMimeType
      });
    };
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="audio/wav,audio/x-wav,audio/wave,audio/*,video/*,.wav"
        onChange={handleChange}
        disabled={disabled}
      />
      
      {!fileName ? (
        <div className="space-y-4">
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label="Upload audio file"
            className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 ${
              dragActive 
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" 
                : error 
                  ? "border-red-300 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/5 hover:border-red-400"
                  : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/80"
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !disabled && inputRef.current?.click()}
            onKeyDown={handleKeyDown}
          >
            <div className={`p-4 rounded-full mb-4 transition-colors ${error ? 'bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400'}`}>
              <UploadCloud size={32} />
            </div>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-1">
              {error ? "Try another file" : "Click to upload or drag & drop"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              MP3, WAV, M4A, WEBM (Max 10MB)
            </p>
          </div>
          
          {error && (
            <div className="flex items-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={18} className="mr-2.5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex items-center justify-between shadow-sm transition-colors duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <FileAudio size={24} />
            </div>
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-md">{fileName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ready to transcribe</p>
            </div>
          </div>
          <button 
            onClick={handleClear}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={disabled}
            aria-label="Remove file"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
