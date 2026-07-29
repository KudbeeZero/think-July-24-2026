export async function routeLLMRequest(
  message: string,
  model: string = 'grok-3-fast',
  systemPrompt: string = '',
  proxy: string = '',
  extra_data: any = null
) {
  // Multi-tier LLM fallback router (6-tier: xAI→proxy→Groq→DeepSeek→Gemini→sim)
  
  // Tier 1: xAI
  const xaiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  if (xaiKey) {
    try {
      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${xaiKey}`,
        },
        body: JSON.stringify({
          model: model.includes('grok-4') ? 'grok-2-latest' : 'grok-beta',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ]
        })
      });
      if (res.ok) {
        const data = await res.json();
        return { status: 'success', response: data.choices[0].message.content, mode: 'xai_direct_api', extra_data };
      }
    } catch (e) {
      console.warn("xAI direct failed, falling back");
    }
  }

  // Tier 2: proxy
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('http://127.0.0.1:6969/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proxy, message, model, extra_data }),
      signal: controller.signal
    }).catch(() => null);
    clearTimeout(timeoutId);
    if (res && res.ok) {
      const data = await res.json();
      return { ...data, mode: 'python_proxy' };
    }
  } catch (e) {}

  // Tier 3: Groq
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        return { status: 'success', response: data.choices[0].message.content, mode: 'groq_fallback', extra_data };
      }
    } catch (e) {}
  }

  // Tier 4: DeepSeek
  const dsKey = process.env.DEEPSEEK_API_KEY;
  if (dsKey) {
    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dsKey}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        return { status: 'success', response: data.choices[0].message.content, mode: 'deepseek_fallback', extra_data };
      }
    } catch (e) {}
  }

  // Tier 5: Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + '\n' + message }] }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        return { status: 'success', response: data.candidates[0].content.parts[0].text, mode: 'gemini_fallback', extra_data };
      }
    } catch (e) {}
  }

  // Tier 6: sim (simulation fallback)
  return {
    status: 'success',
    response: 'Simulation fallback: Simulated response generated.',
    mode: 'simulation',
    extra_data
  };
}
