import { GITHUB_TOKEN } from '../config';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CACHE_FILE = join(homedir(), '.gf-repos.json');

interface RepoCache {
  id: number;
  name: string;
  description: string;
  private: boolean;
  url: string;
  stars: number;
  updated: string;
}

async function fetchAllRepos(): Promise<any[]> {
  let allRepos: any[] = [];
  let page = 1;
  const perPage = 100;

  console.log('Buscando repositórios do GitHub...');

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
    console.log(`Buscados ${allRepos.length} repositórios...`);

    if (repos.length < perPage) break;

    page++;
  }

  return allRepos;
}

function saveCache(repos: any[]) {
  const cache: RepoCache[] = repos.map((repo, index) => ({
    id: index + 1,
    name: repo.name,
    description: repo.description || '',
    private: repo.private,
    url: repo.html_url,
    stars: repo.stargazers_count,
    updated: repo.updated_at,
  }));

  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  console.log(`\nCache atualizado: ${cache.length} repositórios`);
  console.log(`Arquivo: ${CACHE_FILE}`);
}

function loadCache(): RepoCache[] {
  if (!existsSync(CACHE_FILE)) {
    return [];
  }

  const data = readFileSync(CACHE_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function reposCommand(action?: string, term?: string) {
  try {
    if (action === 'update') {
      const repos = await fetchAllRepos();
      saveCache(repos);
      return;
    }

    const cache = loadCache();

    if (cache.length === 0) {
      console.log('Cache vazio. Execute: gf repos update');
      return;
    }

    if (action === 'search' && term) {
      const termLower = term.toLowerCase();
      const filtered = cache.filter(r =>
        r.name.toLowerCase().includes(termLower) ||
        r.description.toLowerCase().includes(termLower)
      );

      if (filtered.length === 0) {
        console.log('Nenhum repositório encontrado');
        return;
      }

      console.log(`\nEncontrados ${filtered.length} repositórios:\n`);
      filtered.forEach(repo => {
        const privacy = repo.private ? '🔒' : '📂';
        const stars = repo.stars > 0 ? ` ⭐ ${repo.stars}` : '';
        console.log(`[${repo.id}] ${privacy} ${repo.name}${stars}`);
        if (repo.description) {
          console.log(`    ${repo.description}`);
        }
      });
      return;
    }

    if (action && action !== 'update' && action !== 'search') {
      const termLower = action.toLowerCase();
      const filtered = cache.filter(r => r.name.toLowerCase().startsWith(termLower));

      if (filtered.length === 0) {
        console.log('Nenhum repositório encontrado');
        return;
      }

      console.log(`\nRepositórios que começam com "${action}":\n`);
      filtered.forEach(repo => {
        const privacy = repo.private ? '🔒' : '📂';
        const stars = repo.stars > 0 ? ` ⭐ ${repo.stars}` : '';
        console.log(`[${repo.id}] ${privacy} ${repo.name}${stars}`);
        if (repo.description) {
          console.log(`    ${repo.description}`);
        }
      });
      return;
    }

    console.log(`\nTotal: ${cache.length} repositórios\n`);
    console.log('Primeiros 20:\n');

    cache.slice(0, 20).forEach(repo => {
      const privacy = repo.private ? '🔒' : '📂';
      const stars = repo.stars > 0 ? ` ⭐ ${repo.stars}` : '';
      console.log(`[${repo.id}] ${privacy} ${repo.name}${stars}`);
      if (repo.description) {
        console.log(`    ${repo.description}`);
      }
    });

    console.log('\nComandos:');
    console.log('  gf repos              - Listar (primeiros 20)');
    console.log('  gf repos a            - Começam com "a"');
    console.log('  gf repos search api   - Buscar "api"');
    console.log('  gf repos update       - Atualizar cache');
    console.log('  gf clone [ID]         - Clonar por ID');

  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro:', error.message);
    } else {
      console.error('Erro desconhecido');
    }
    process.exit(1);
  }
}

export function getRepoById(id: number): RepoCache | null {
  const cache = loadCache();
  return cache.find(r => r.id === id) || null;
}
