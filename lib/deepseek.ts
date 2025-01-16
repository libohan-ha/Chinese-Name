import type { NameSuggestion } from './types';

if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY) {
  throw new Error('NEXT_PUBLIC_DEEPSEEK_API_KEY is not defined in environment variables');
}

const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;

export async function generateChineseName(englishName: string, interests: string): Promise<{ suggestions: NameSuggestion[] }> {
  const prompt = `Create 3 elegant and poetic Chinese names for someone named "${englishName}" who is interested in ${interests}.

  Key requirements:
  1. Create beautiful phonetic matches to "${englishName}" using elegant characters
     Example: For "Emily" -> 艾琳 (Ai Lin) - graceful and similar sound
  2. Create poetic names inspired by their interests in ${interests}
     Example: For photography -> 慕影 (Mu Ying) - "yearning for images"
  3. Focus on aesthetic beauty and artistic meaning
  4. Use characters that create a sense of elegance and depth
  
  For each name, provide:
  - Chinese characters (2-3 characters)
  - Pinyin (with tone marks)
  - Individual character meanings (poetic interpretation of each character)
  - Overall meaning (the artistic connection to their personality and interests)
  - Personality traits (the elegant qualities this name suggests)
  
  Return ONLY a valid JSON object with this exact structure, no other text:
  {
    "suggestions": [
      {
        "chineseName": "艾琳",
        "pinyin": "Ài Lín",
        "explanation": {
          "individual": ["艾 - graceful, elegant", "琳 - beautiful jade, tinkling sound"],
          "overall": "A name that captures both the sound of Emily and the elegance of jade",
          "cultural": "Combines beauty and grace in a melodic way",
          "personality": "Elegant, refined, and naturally graceful"
        }
      }
    ]
  }`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in Chinese naming and culture, creating names for English speakers. All explanations must be in English. Respond only with the exact JSON format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error Response:', errorData);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid API response:', data);
      throw new Error('Invalid API response format');
    }

    let content = data.choices[0].message.content;
    
    // Try to extract JSON if it's wrapped in other text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    try {
      const parsedContent = JSON.parse(content);
      
      if (!parsedContent.suggestions || !Array.isArray(parsedContent.suggestions)) {
        console.error('Invalid response structure:', parsedContent);
        throw new Error('Invalid response structure');
      }

      // Validate each suggestion
      parsedContent.suggestions.forEach((suggestion: any, index: number) => {
        if (!suggestion.chineseName || !suggestion.pinyin || !suggestion.explanation) {
          console.error(`Invalid suggestion at index ${index}:`, suggestion);
          throw new Error('Invalid suggestion format');
        }
      });

      return parsedContent;
    } catch (parseError) {
      console.error('Failed to parse API response:', content);
      throw new Error('Failed to parse name suggestions');
    }
  } catch (error) {
    console.error('API request failed:', error);
    throw new Error('Failed to generate names. Please try again.');
  }
}