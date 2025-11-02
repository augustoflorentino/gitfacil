import simpleGit from 'simple-git';
import { GITHUB_TOKEN } from '../config';

export async function pullCommand(options: { branch?: string }) {
  const git = simpleGit();

  try {
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      console.error('Erro: Não é um repositório Git');
      process.exit(1);
    }

    const remotes = await git.getRemotes(true);
    if (remotes.length === 0) {
      console.error('Erro: Nenhum remote configurado');
      process.exit(1);
    }

    const currentBranch = await git.branchLocal();
    const branch = options.branch || currentBranch.current;

    const remote = remotes[0];
    let fetchUrl = remote.refs.fetch;

    if (fetchUrl && fetchUrl.includes('github.com')) {
      if (fetchUrl.startsWith('https://')) {
        fetchUrl = fetchUrl.replace('https://', `https://${GITHUB_TOKEN}@`);
      } else if (fetchUrl.startsWith('git@')) {
        fetchUrl = fetchUrl
          .replace('git@github.com:', 'https://github.com/')
          .replace('https://', `https://${GITHUB_TOKEN}@`);
      }

      await git.removeRemote('origin');
      await git.addRemote('origin', fetchUrl);
    }

    console.log(`Fazendo pull de ${branch}...`);
    await git.pull('origin', branch);
    console.log(`Pull concluído de ${branch}`);

  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro:', error.message);
    } else {
      console.error('Erro desconhecido');
    }
    process.exit(1);
  }
}
