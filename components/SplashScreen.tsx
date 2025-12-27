
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { AudioLines } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const [loaderText, setLoaderText] = useState('Initializing AI Engine…');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Sequence of loader prompts spread over 6 seconds
    const t1 = setTimeout(() => setLoaderText('Calibrating Audio Intelligence…'), 1500);
    const t2 = setTimeout(() => setLoaderText('Preparing Your Workspace…'), 3000);
    const t3 = setTimeout(() => setLoaderText('Almost Ready…'), 4500);
    
    // Start fading out slightly before the 6s mark to make the transition smooth
    const fadeTimeout = setTimeout(() => setIsFadingOut(true), 5700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(fadeTimeout);
    };
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
      style={{
        background: 'linear-gradient(135deg, #1DA1F2 0%, #4F46E5 50%, #7C3AED 100%)'
      }}
    >
      <div className="flex flex-col items-center text-center max-w-lg px-6 space-y-6 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Logo Icon */}
        <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-md shadow-2xl border border-white/30 mb-2">
          <AudioLines size={64} className="text-white" />
        </div>

        {/* App Name */}
        <h1 className="text-4xl md:text-5xl font-[700] text-[#FFFFFF] tracking-tight">
          Agha-Voxify
        </h1>

        {/* Slogans */}
        <div className="space-y-3">
          <p className="text-xl md:text-2xl font-[600] text-[rgba(255,255,255,0.95)] leading-tight">
            Turn Every Word Into Actionable Text
          </p>
          <p className="text-sm md:text-base font-[400] text-[rgba(255,255,255,0.85)] leading-relaxed max-w-sm mx-auto">
            Fast, accurate speech-to-text with speaker detection, timestamps, and automatic language recognition.
          </p>
        </div>

        {/* Animated Equalizer Bars */}
        <div className="flex items-end justify-center space-x-1.5 h-16 pt-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2.5 rounded-full animate-equalizer shadow-equalizer"
              style={{
                background: 'linear-gradient(180deg, #38BDF8, #6366F1, #A855F7)',
                height: `${40 + (i % 2 === 0 ? 30 : 50)}%`,
                animationDelay: `${i * 0.15}s`
              }}
            />
          ))}
        </div>

        {/* Loader Prompt Text */}
        <p className="text-sm font-[400] text-[rgba(255,255,255,0.75)] min-h-[1.5rem] transition-all duration-300 text-center px-4">
          {loaderText}
        </p>
      </div>

      {/* Footer Line */}
      <div className="absolute bottom-10 text-xs font-[400] text-[rgba(255,255,255,0.60)] tracking-widest uppercase">
        Powered by Agha-Voxify Intelligence
      </div>
    </div>
  );
};

export default SplashScreen;
