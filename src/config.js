const required = ['DATABASE_URL', 'SESSION_SECRET'];
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`missing ${missing.join(', ')}: see .env.example`);
  process.exit(1);
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  sessionSecret: process.env.SESSION_SECRET,
  publicBaseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:3000',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  modelName: process.env.MODEL_NAME || 'gemini-2.5-flash',
  mcpToken: process.env.MCP_TOKEN || '',
};