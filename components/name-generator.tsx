"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { generateChineseName } from '@/lib/deepseek';
import type { NameSuggestion } from '@/lib/types';
import { Download, Heart, Loader2, Sparkles, User, Volume2 } from 'lucide-react';
import { useState } from 'react';

export default function NameGenerator() {
  const [englishName, setEnglishName] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<NameSuggestion[]>([]);
  const [favorites, setFavorites] = useState<NameSuggestion[]>([]);
  const [speaking, setSpeaking] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await generateChineseName(englishName, interests);
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error('Error generating names:', error);
    }
    setLoading(false);
  };

  const toggleFavorite = (suggestion: NameSuggestion) => {
    if (favorites.some(fav => fav.chineseName === suggestion.chineseName)) {
      setFavorites(favorites.filter(fav => fav.chineseName !== suggestion.chineseName));
    } else {
      setFavorites([...favorites, suggestion]);
    }
  };

  const exportFavorites = () => {
    const content = favorites.map(fav => `
Chinese Name: ${fav.chineseName}
Pinyin: ${fav.pinyin}
Individual Meanings: ${fav.explanation.individual.join(', ')}
Overall Meaning: ${fav.explanation.overall}
Cultural Significance: ${fav.explanation.cultural}
Personality Traits: ${fav.explanation.personality}
    `).join('\n---\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chinese-names.txt';
    link.click();
    
    // Clean up the URL after a short delay to ensure the download starts
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  };

  const speakName = (name: string, pinyin: string) => {
    if (!window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    // Set speaking state for UI feedback
    setSpeaking(name);
    
    // Create utterance for Chinese name
    const utterance = new SpeechSynthesisUtterance(name);
    utterance.lang = 'zh-CN';
    
    // When finished speaking Chinese, speak the pinyin
    utterance.onend = () => {
      const pinyinUtterance = new SpeechSynthesisUtterance(pinyin);
      pinyinUtterance.lang = 'zh-CN';
      pinyinUtterance.onend = () => setSpeaking(null);
      window.speechSynthesis.speak(pinyinUtterance);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-8">
      <Card className="glass-card">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Your English name"
                  value={englishName}
                  onChange={(e) => setEnglishName(e.target.value)}
                  className="pl-10 h-12 text-lg"
                  required
                />
                <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              </div>
              <div className="relative">
                <Input
                  placeholder="Your interests (e.g., travel, photography)"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="pl-10 h-12 text-lg"
                  required
                />
                <Sparkles className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating names...
                </>
              ) : (
                'Generate Chinese Names'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <div className="grid gap-6 md:grid-cols-3">
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="glass-card transform hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                      {suggestion.chineseName}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => speakName(suggestion.chineseName, suggestion.pinyin)}
                      className={`hover:scale-110 transition-transform duration-200 ${
                        speaking === suggestion.chineseName ? 'text-primary animate-pulse' : ''
                      }`}
                    >
                      <Volume2 className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(suggestion)}
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors duration-200 ${
                        favorites.some(fav => fav.chineseName === suggestion.chineseName)
                          ? 'fill-current text-red-500'
                          : ''
                      }`}
                    />
                  </Button>
                </CardTitle>
                <p className="text-lg text-muted-foreground">{suggestion.pinyin}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary mb-1">Characters & Meanings</h4>
                  <div className="space-y-2">
                    {suggestion.explanation.individual.map((meaning, i) => (
                      <p key={i}>
                        <span className="text-xl font-medium">{suggestion.chineseName[i]}</span> - {meaning}
                      </p>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-1">Name Connection</h4>
                  <p>{suggestion.explanation.overall}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-1">Personality & Traits</h4>
                  <p>{suggestion.explanation.personality}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {favorites.length > 0 && (
        <div className="pt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Favorites
            </h2>
            <Button onClick={exportFavorites} variant="outline" className="glass-card">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {favorites.map((favorite, index) => (
              <Card key={index} className="glass-card transform hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                      {favorite.chineseName}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(favorite)}
                      className="hover:scale-110 transition-transform duration-200"
                    >
                      <Heart className="h-5 w-5 fill-current text-red-500" />
                    </Button>
                  </CardTitle>
                  <p className="text-lg text-muted-foreground">{favorite.pinyin}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Characters</h4>
                    <p>{favorite.explanation.individual.join(', ')}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Meaning</h4>
                    <p>{favorite.explanation.overall}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}