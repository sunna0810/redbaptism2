/**
 * Gemini API Module
 * Client-side integration using directly inputted user API key.
 * If user does not provide a key, static text backups are used automatically.
 */
export const Gemini = {
  async generate(geminiKey: string, systemPrompt: string, userMessage: string): Promise<string | null> {
    if (!geminiKey) return null;
    
    // Using recommended gemini-3.5-flash model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`;
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.85,
            topP: 0.9,
          },
        }),
      });

      if (!res.ok) {
        console.warn('Gemini API response warning:', res.status, res.statusText);
        return null;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return text || null;
    } catch (e) {
      console.warn('Gemini generate helper error:', e);
      return null;
    }
  },
};
