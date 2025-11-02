import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(__dirname, '../.env') });

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

if (!GITHUB_TOKEN) {
  console.error('Erro: GITHUB_TOKEN não configurado no arquivo .env');
  process.exit(1);
}
