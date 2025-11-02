import simpleGit from 'simple-git';
import path from 'path';
import { GITHUB_TOKEN } from '../config';

export async function cloneCommand(urlOrName: string, options: { dir?: string; latest?: boolean }) {
  const git = simpleGit();

  try {
    let cloneUrl = urlOrName;
    let repoName = '';

    if (!urlOrName.includes('/') && !urlOrName.includes('github.com')) {
      console.log(`Buscando repositório "${urlOrName}"...`);

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

    if (options.latest) {
      console.log('\nTrocando para branch mais recente...');
      const repoGit = simpleGit(targetDir);

      await repoGit.fetch();

      const branches = await repoGit.raw([
        'for-each-ref',
        '--sort=-committerdate',
        '--format=%(refname:short)',
        'refs/remotes/origin'
      ]);

      const branchList = branches.split('\n').filter(b => b && !b.includes('HEAD') && b.startsWith('origin/'));

      if (branchList.length > 0) {
        const latestBranch = branchList[0].replace('origin/', '');

        const localBranches = await repoGit.branchLocal();
        if (localBranches.all.includes(latestBranch)) {
          await repoGit.checkout(latestBranch);
        } else {
          await repoGit.checkoutBranch(latestBranch, `origin/${latestBranch}`);
        }
        console.log(`Trocado para branch '${latestBranch}'`);
      }
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro:', error.message);
    } else {
      console.error('Erro ao clonar repositório');
    }
    process.exit(1);
  }
}
