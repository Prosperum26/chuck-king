/**
 * LLMClient - wrapper gọi API text cho nhiều provider.
 * - OpenAI / OpenAI-compatible: POST chat/completions (Bearer token)
 * - Gemini: POST models/*:generateContent (x-goog-api-key header)
 */

function safeParseUrl(url) {
    try {
        return new URL(url);
    } catch (_) {
        return null;
    }
}

export function detectProvider(endpoint) {
    const ep = (endpoint || '').toString();
    if (ep.includes('generativelanguage.googleapis.com') || ep.includes(':generateContent')) {
        return 'gemini';
    }
    return 'openai';
}

function buildGeminiUrl(endpoint) {
    const urlObj = safeParseUrl(endpoint);
    return urlObj ? urlObj.toString() : endpoint;
}

function extractGeminiText(data) {
    const parts = data?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts) && parts.length > 0) {
        return parts.map((p) => p?.text).filter(Boolean).join('');
    }
    return null;
}

function extractOpenAIText(data) {
    return data?.choices?.[0]?.message?.content || null;
}

export async function callLLMText({
    endpoint,
    apiKey,
    model = 'gpt-3.5-turbo',
    prompt,
    maxTokens = 40,
    temperature = 0.8,
    timeoutMs = 15000
}) {
    if (!endpoint || !prompt) {
        return { success: false, message: 'Missing endpoint/prompt' };
    }

    const provider = detectProvider(endpoint);

    const controller = new AbortController();
    const effectiveTimeoutMs = provider === 'gemini' ? Math.max(timeoutMs, 30000) : timeoutMs;
    const timeoutId = setTimeout(() => controller.abort(), effectiveTimeoutMs);

    try {
        let response;
        if (provider === 'gemini') {
            const url = buildGeminiUrl(endpoint);
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(apiKey ? { 'x-goog-api-key': apiKey } : {})
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature,
                        maxOutputTokens: maxTokens
                    }
                }),
                signal: controller.signal
            });
        } else {
            // OpenAI / OpenAI-compatible chat completions
            response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: maxTokens,
                    temperature
                }),
                signal: controller.signal
            });
        }

        clearTimeout(timeoutId);

        if (!response.ok) {
            let details = '';
            try {
                const errJson = await response.json();
                details = JSON.stringify(errJson);
            } catch (_) {
                try {
                    details = await response.text();
                } catch (_) {}
            }
            return {
                success: false,
                message: `HTTP ${response.status}`,
                provider,
                details
            };
        }

        const data = await response.json();
        const content = provider === 'gemini' ? extractGeminiText(data) : extractOpenAIText(data);
        if (!content || typeof content !== 'string') {
            return {
                success: false,
                message: 'Empty/invalid response',
                provider
            };
        }

        return { success: true, content: content.trim(), provider };
    } catch (error) {
        clearTimeout(timeoutId);
        if (error?.name === 'AbortError') {
            return { success: false, message: 'TIMEOUT', provider };
        }
        return { success: false, message: error?.message || 'UNKNOWN_ERROR', provider };
    }
}

