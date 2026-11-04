export async function summarizeNotes(notes, client = null) {
  if (!notes) return '';
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey && !client) {
      return notes; // Fallback
    }

    // Timeout mekanizması (AbortController)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // Eğer test için fake client verildiyse onu kullan
    if (client) {
      clearTimeout(timeoutId);
      return await client.generate(notes);
    }

    clearTimeout(timeoutId);
    return notes;
  } catch (err) {
    console.warn('Model feature failed or timed out, falling back to raw notes:', err.message);
    return notes; // Fallback
  }
}