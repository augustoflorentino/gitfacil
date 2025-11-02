import simpleGit from 'simple-git';
import { GITHUB_TOKEN } from '../config';

export async function commitCommand(mensagem: string, options: { all?: boolean }) {
  const git = simpleGit();

  try {
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      console.error('Erro: Não é um repositório Git');
      process.exit(1);
    }

    const status = await git.status();

    if (status.files.length === 0) {
      console.log('Nenhuma alteração para commitar');
      return;
    }

    await git.add('.');
    console.log('Arquivos adicionados ao stage');

    await git.commit(mensagem);
    console.log(`Commit criado: ${mensagem}`);

    const remotes = await git.getRemotes(true);
    if (remotes.length === 0) {
      console.log('Commit criado (sem remote configurado)');
      return;
    }

    const currentBranch = await git.branchLocal();
    const branch = currentBranch.current;

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
