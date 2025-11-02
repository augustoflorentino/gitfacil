import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const ENV_PATH = join(__dirname, '../../.env');

export async function configCommand(chave: string, valor?: string) {
  try {
    if (chave === 'token') {
      if (!valor) {
        console.error('Erro: Forneça o token');
        console.log('Uso: gf config token SEU_TOKEN_AQUI');
        process.exit(1);
      }

      let envContent = '';

      try {
        envContent = readFileSync(ENV_PATH, 'utf-8');
      } catch (error) {
        envContent = '';
      }

      const lines = envContent.split('\n').filter(line => !line.startsWith('GITHUB_TOKEN='));
      lines.push(`GITHUB_TOKEN=${valor}`);

      writeFileSync(ENV_PATH, lines.join('\n'));
      console.log('Token do GitHub configurado com sucesso');

    } else {
      console.error(`Erro: Chave '${chave}' não reconhecida`);
      console.log('Chaves disponíveis: token');
      process.exit(1);
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro:', error.message);
    } else {
      console.error('Erro desconhecido');
    }
    process.exit(1);
  }
}
