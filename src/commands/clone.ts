import simpleGit from 'simple-git';
import path from 'path';
import { GITHUB_TOKEN } from '../config';

export async function cloneCommand(urlOrName: string, options: { dir?: string }) {
  const git = simpleGit();

  try {
    let cloneUrl = urlOrName;
    let repoName = '';

    if (!urlOrName.includes('/') && !urlOrName.includes('github.com')) {
      console.log(`Buscando repositório "${urlOrName}"...`);

      const response = await fetch('https://api.github.com/user/repos?per_page=100&affiliation=owner', {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar repositórios');
      }

      const repos = await response.json();
      const repo = repos.find((r: any) => r.name.toLowerCase() === urlOrName.toLowerCase());

      if (!repo) {
        console.error(`Repositório "${urlOrName}" não encontrado`);
        process.exit(1);
      }

      cloneUrl = repo.clone_url;
      repoName = repo.name;
    }

    if (cloneUrl.includes('github.com')) {
      if (cloneUrl.startsWith('https://')) {
        cloneUrl = cloneUrl.replace('https://', `https://${GITHUB_TOKEN}@`);
      } else if (cloneUrl.startsWith('git@')) {
        cloneUrl = cloneUrl
          .replace('git@github.com:', 'https://github.com/')
          .replace('https://', `https://${GITHUB_TOKEN}@`);
      }
    }

    let targetDir: string;

    if (options.dir) {
      targetDir = options.dir;
    } else if (repoName) {
      targetDir = repoName;
    } else {
      const match = urlOrName.match(/\/([^\/]+?)(\.git)?$/);
      targetDir = match ? match[1] : path.basename(urlOrName, '.git');
    }

    console.log(`Clonando ${repoName || urlOrName}...`);
    await git.clone(cloneUrl, targetDir);
    console.log(`Repositório clonado em: ${targetDir}`);

  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro:', error.message);
    } else {
      console.error('Erro ao clonar repositório');
    }
    process.exit(1);
  }
}
