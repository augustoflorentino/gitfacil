import { GITHUB_TOKEN } from '../config';

export async function searchCommand(termo: string, options: { description?: boolean }) {
  try {
    console.log(`Buscando repositórios com "${termo}"...`);

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
    const termoLower = termo.toLowerCase();

    const filtered = repos.filter((repo: any) => {
      const nameMatch = repo.name.toLowerCase().includes(termoLower);
      const descMatch = options.description && repo.description && repo.description.toLowerCase().includes(termoLower);
      return nameMatch || descMatch;
    });

    if (filtered.length === 0) {
      console.log('Nenhum repositório encontrado');
      return;
    }

    console.log(`\nEncontrados ${filtered.length} repositórios:\n`);

    filtered.forEach((repo: any) => {
      const privacy = repo.private ? '🔒' : '📂';
      const stars = repo.stargazers_count > 0 ? ` ⭐ ${repo.stargazers_count}` : '';
      console.log(`${privacy} ${repo.name}${stars}`);
      if (repo.description) {
        console.log(`   ${repo.description}`);
      }
      console.log(`   ${repo.html_url}`);
      console.log('');
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
