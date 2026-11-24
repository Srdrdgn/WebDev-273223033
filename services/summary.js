export async function summarizeNotes(notes, client = null, timeoutMs = 3000) {
  if (!notes) return '';
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey && !client) {
      return notes; // Fallback
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    if (client) {
      const result = await client.generate(notes, { signal: controller.signal });
      clearTimeout(timeoutId);
      return result;
    }

    clearTimeout(timeoutId);
    return notes;
  } catch (err) {
    console.warn('Model feature failed or timed out, falling back to raw notes:', err.message);
    return notes; // Fallback
  }
}