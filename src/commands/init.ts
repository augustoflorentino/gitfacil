import simpleGit from 'simple-git';
import { GITHUB_TOKEN } from '../config';

export async function initCommand(nome: string, options: { private?: boolean }) {
  const git = simpleGit();

  try {
    console.log('Inicializando repositório local...');
    await git.init();

    console.log('Criando repositório no GitHub...');
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: nome,
        private: options.private || false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar repositório no GitHub');
    }

    const repo = await response.json();
    const remoteUrl = repo.clone_url.replace('https://', `https://${GITHUB_TOKEN}@`);

    await git.addRemote('origin', remoteUrl);

    console.log(`Repositório '${nome}' criado com sucesso`);
    console.log(`URL: ${repo.html_url}`);

  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro:', error.message);
    } else {
      console.error('Erro desconhecido');
    }
    process.exit(1);
  }
}
