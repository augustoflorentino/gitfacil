import { GITHUB_TOKEN } from '../config';
import { exec } from 'child_process';

export async function openCommand(nomeRepo: string) {
  try {
    console.log(`Buscando repositório "${nomeRepo}"...`);

    let allRepos: any[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await fetch(`https://api.github.com/user/repos?per_page=${perPage}&page=${page}&affiliation=owner,collaborator,organization_member`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar repositórios');
      }

      const repos = await response.json();

      if (repos.length === 0) break;

      allRepos = allRepos.concat(repos);

      if (repos.length < perPage) break;

      page++;
    }

    const repos = allRepos;
    const repo = repos.find((r: any) => r.name.toLowerCase() === nomeRepo.toLowerCase());

    if (!repo) {
      console.error(`Repositório "${nomeRepo}" não encontrado`);
      process.exit(1);
    }

    const url = repo.html_url;
    console.log(`Abrindo ${url}...`);

    const command = process.platform === 'darwin' ? 'open' :
                   process.platform === 'win32' ? 'start' : 'xdg-open';

    exec(`${command} ${url}`, (error) => {
      if (error) {
        console.error('Erro ao abrir navegador:', error.message);
        console.log(`URL: ${url}`);
      }
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
