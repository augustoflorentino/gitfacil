import simpleGit from 'simple-git';
import { GITHUB_TOKEN } from '../config';

export async function pushCommand(options: { branch?: string }) {
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
    let pushUrl = remote.refs.push;

    if (pushUrl && pushUrl.includes('github.com')) {
      if (pushUrl.startsWith('https://')) {
        pushUrl = pushUrl.replace('https://', `https://${GITHUB_TOKEN}@`);
      } else if (pushUrl.startsWith('git@')) {
        pushUrl = pushUrl
          .replace('git@github.com:', 'https://github.com/')
          .replace('https://', `https://${GITHUB_TOKEN}@`);
      }

      await git.removeRemote('origin');
      await git.addRemote('origin', pushUrl);
    }

    console.log(`Fazendo push para ${branch}...`);
    await git.push('origin', branch);
    console.log(`Push concluído para ${branch}`);

  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro:', error.message);
    } else {
      console.error('Erro desconhecido');
    }
    process.exit(1);
  }
}
