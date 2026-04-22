import { useMemo } from 'react';
import { dailyIndex } from '../lib/utils';
import hskData from '../data/hsk_vocab.json';
import spanishData from '../data/spanish_vocab.json';

export interface GenericWordEntry {
  text: string;
  pronunciation: string;
  english: string;
}

type RawHskEntry = { hanzi: string; pinyin: string; english: string };
type RawSpanishEntry = { text: string; pronunciation: string; english: string };

type HskData = Record<string, RawHskEntry[]>;
type SpanishData = Record<string, RawSpanishEntry[]>;

export function useWordOfDay(language: 'mandarin' | 'spanish', level: string): GenericWordEntry {
  return useMemo(() => {
    if (language === 'spanish') {
      const words = (spanishData as SpanishData)[level] || (spanishData as SpanishData)['1'];
      if (!words || words.length === 0) {
        return { text: 'Hola', pronunciation: 'o-la', english: 'Hello' };
      }
      const idx = dailyIndex(words.length);
      return words[idx];
    } else {
      // Default to Mandarin
      const words = (hskData as HskData)[level] || (hskData as HskData)['1'];
      if (!words || words.length === 0) {
        return { text: '你好', pronunciation: 'nǐ hǎo', english: 'Hello' };
      }
      const idx = dailyIndex(words.length);
      const word = words[idx];
      return {
        text: word.hanzi,
        pronunciation: word.pinyin,
        english: word.english
      };
    }
  }, [language, level]);
}
