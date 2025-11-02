import { GITHUB_TOKEN } from '../config';

export async function listCommand(options: { sort?: string; limit?: string }) {
  try {
    const sortBy = options.sort || 'updated';
    const perPage = options.limit ? parseInt(options.limit) : 30;

    console.log('Buscando repositórios...');

    const response = await fetch(`https://api.github.com/user/repos?sort=${sortBy}&per_page=${perPage}&affiliation=owner,collaborator,organization_member`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar repositórios');
    }

    const repos = await response.json();

    if (repos.length === 0) {
      console.log('Nenhum repositório encontrado');
      return;
    }

    console.log(`\nEncontrados ${repos.length} repositórios:\n`);

    repos.forEach((repo: any) => {
      const privacy = repo.private ? '🔒' : '📂';
      const stars = repo.stargazers_count > 0 ? ` ⭐ ${repo.stargazers_count}` : '';
      console.log(`${privacy} ${repo.name}${stars}`);
      if (repo.description) {
        console.log(`   ${repo.description}`);
      }
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
