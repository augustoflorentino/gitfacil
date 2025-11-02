import simpleGit from 'simple-git';

export async function branchCommand(nome?: string, options?: { new?: boolean }) {
  const git = simpleGit();

  try {
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      console.error('Erro: Não é um repositório Git');
      process.exit(1);
    }

    if (!nome) {
      const branches = await git.branchLocal();
      console.log('Branches disponíveis:');
      branches.all.forEach((branch) => {
        const marker = branch === branches.current ? '* ' : '  ';
        console.log(`${marker}${branch}`);
      });
      return;
    }

    if (options?.new) {
      await git.checkoutLocalBranch(nome);
      console.log(`Branch '${nome}' criada e selecionada`);
    } else {
      await git.checkout(nome);
      console.log(`Trocado para branch '${nome}'`);
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
