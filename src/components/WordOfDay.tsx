import { useWordOfDay } from '../hooks/useWordOfDay';
import { BookOpen } from 'lucide-react';

interface WordOfDayProps {
  hskLevel: string;
  language: 'mandarin' | 'spanish';
}

export function WordOfDay({ hskLevel, language }: WordOfDayProps) {
  const word = useWordOfDay(language, hskLevel);

  return (
    <div className="glass rounded-2xl p-5 max-w-xs animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-blue-400" />
        <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
          Word of the Day
        </span>
        <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 uppercase">
          {language === 'mandarin' ? `HSK ${hskLevel}` : `Lvl ${hskLevel}`}
        </span>
      </div>

      <div className="text-center py-2">
        <p
          className={`text-5xl font-bold text-white mb-2 ${language === 'spanish' ? 'tracking-tight' : ''}`}
          style={language === 'mandarin' ? { fontFamily: "'Noto Serif SC', serif" } : {}}
        >
          {word.text}
        </p>
        <p className="text-base text-blue-300 font-medium tracking-wide">
          {word.pronunciation}
        </p>
        <p className="mt-1 text-sm text-white/50">
          {word.english}
        </p>
      </div>
    </div>
  );
}
