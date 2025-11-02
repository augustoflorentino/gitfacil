import simpleGit from 'simple-git';
import path from 'path';
import { GITHUB_TOKEN } from '../config';

export async function cloneCommand(url: string, options: { dir?: string }) {
  const git = simpleGit();

  try {
    let cloneUrl = url;

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
    } else {
      const match = url.match(/\/([^\/]+?)(\.git)?$/);
      targetDir = match ? match[1] : path.basename(url, '.git');
    }

    console.log(`Clonando ${url}...`);
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
