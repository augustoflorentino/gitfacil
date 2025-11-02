import simpleGit from 'simple-git';

export async function latestCommand() {
  const git = simpleGit();

  try {
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      console.error('Erro: Não é um repositório Git');
      process.exit(1);
    }

    console.log('Buscando branch mais recente...');

    await git.fetch();

    const branches = await git.raw([
      'for-each-ref',
      '--sort=-committerdate',
      '--format=%(refname:short)',
      'refs/remotes/origin'
    ]);

    const branchList = branches.split('\n').filter(b => b && !b.includes('HEAD') && b.startsWith('origin/') && b !== 'origin');

    if (branchList.length === 0) {
      console.error('Nenhuma branch remota encontrada');
      process.exit(1);
    }

    const latestBranch = branchList[0].replace('origin/', '');

    console.log(`Branch mais recente: ${latestBranch}`);

    const localBranches = await git.branchLocal();

    if (localBranches.all.includes(latestBranch)) {
      await git.checkout(latestBranch);
    } else {
      await git.checkoutBranch(latestBranch, `origin/${latestBranch}`);
    }

    await git.pull('origin', latestBranch);

    const log = await git.log(['-1']);
    console.log(`Trocado para '${latestBranch}'`);
    console.log(`Último commit: ${log.latest?.message}`);

  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro:', error.message);
    } else {
      console.error('Erro desconhecido');
    }
    process.exit(1);
  }
}
