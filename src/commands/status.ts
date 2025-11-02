import simpleGit from 'simple-git';

export async function statusCommand() {
  const git = simpleGit();

  try {
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      console.error('Erro: Não é um repositório Git');
      process.exit(1);
    }

    const status = await git.status();

    console.log(`Branch: ${status.current}`);
    console.log(`Commits à frente: ${status.ahead}`);
    console.log(`Commits atrás: ${status.behind}`);

    if (status.files.length === 0) {
      console.log('\nNenhuma alteração');
      return;
    }

    console.log('\nArquivos modificados:');
    status.files.forEach((file) => {
      const status = file.working_dir === 'M' ? 'modificado' :
                     file.working_dir === 'D' ? 'deletado' :
                     file.working_dir === '?' ? 'não rastreado' : 'alterado';
      console.log(`  ${file.path} (${status})`);
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro:', error.message);
    } else {
      console.error('Erro desconhecido');
    }
    process.exit(1);
  }
}
