export interface NameSuggestion {
  chineseName: string;
  pinyin: string;
  explanation: {
    individual: string[];
    overall: string;
    cultural: string;
    personality: string;
  };
}

export interface GenerateNameResponse {
  suggestions: NameSuggestion[];
}