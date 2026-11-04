export async function summarizeNotes(notes) {
  if (!notes) return '';
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing, falling back to raw notes.');
      return notes; // Fallback (anahtar yoksa ham metni döndür)
    }
    // Model çağrısı simülasyonu / entegrasyonu
    return notes;
  } catch (err) {
    console.warn('Model feature failed, falling back to raw notes:', err.message);
    return notes; // Hata durumunda çökmez, ham metni döndürür
  }
}