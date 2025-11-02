import simpleGit from 'simple-git';
import { GITHUB_TOKEN } from '../config';

export async function syncCommand(options: { branch?: string }) {
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
    let remoteUrl = remote.refs.fetch;

    if (remoteUrl && remoteUrl.includes('github.com')) {
      if (remoteUrl.startsWith('https://')) {
        remoteUrl = remoteUrl.replace('https://', `https://${GITHUB_TOKEN}@`);
      } else if (remoteUrl.startsWith('git@')) {
        remoteUrl = remoteUrl
          .replace('git@github.com:', 'https://github.com/')
          .replace('https://', `https://${GITHUB_TOKEN}@`);
      }

      await git.removeRemote('origin');
      await git.addRemote('origin', remoteUrl);
    }

    console.log(`Sincronizando branch ${branch}...`);

    console.log('Fazendo pull...');
    await git.pull('origin', branch);

    console.log('Fazendo push...');
    await git.push('origin', branch);

    console.log('Sincronização concluída');

  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro:', error.message);
    } else {
      console.error('Erro desconhecido');
    }
    process.exit(1);
  }
}
