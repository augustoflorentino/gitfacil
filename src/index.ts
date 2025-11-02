#!/usr/bin/env node

import { Command } from 'commander';
import { commitCommand } from './commands/commit';
import { cloneCommand } from './commands/clone';
import { pushCommand } from './commands/push';
import { pullCommand } from './commands/pull';
import { branchCommand } from './commands/branch';
import { statusCommand } from './commands/status';
import { syncCommand } from './commands/sync';
import { undoCommand } from './commands/undo';
import { amendCommand } from './commands/amend';
import { configCommand } from './commands/config';
import { initCommand } from './commands/init';

const program = new Command();

program
  .name('gf')
  .description('CLI para facilitar operações Git')
  .version('1.0.0');

program
  .command('commit')
  .alias('c')
  .description('Add, commit e push em um único comando')
  .argument('<mensagem>', 'Mensagem do commit')
  .option('-a, --all', 'Add all files automaticamente')
  .action(commitCommand);

program
  .command('clone')
  .description('Clonar repositório usando token do GitHub')
  .argument('<url>', 'URL do repositório')
  .option('-d, --dir <directory>', 'Diretório de destino')
  .action(cloneCommand);

program
  .command('push')
  .alias('p')
  .description('Push para o repositório remoto')
  .option('-b, --branch <branch>', 'Branch específica')
  .action(pushCommand);

program
  .command('pull')
  .alias('pl')
  .description('Pull do repositório remoto')
  .option('-b, --branch <branch>', 'Branch específica')
  .action(pullCommand);

program
  .command('branch')
  .description('Listar ou trocar de branch')
  .argument('[nome]', 'Nome da branch para trocar')
  .option('-n, --new', 'Criar nova branch')
  .action(branchCommand);

program
  .command('status')
  .alias('s')
  .description('Ver status do repositório')
  .action(statusCommand);

program
  .command('sync')
  .description('Pull + Push automático')
  .option('-b, --branch <branch>', 'Branch específica')
  .action(syncCommand);

program
  .command('undo')
  .description('Desfazer último commit (mantém alterações)')
  .action(undoCommand);

program
  .command('amend')
  .description('Editar último commit')
  .argument('<mensagem>', 'Nova mensagem do commit')
  .action(amendCommand);

program
  .command('config')
  .description('Configurar token do GitHub')
  .argument('<chave>', 'Chave de configuração (token)')
  .argument('[valor]', 'Valor da configuração')
  .action(configCommand);

program
  .command('init')
  .description('Criar novo repositório no GitHub')
  .argument('<nome>', 'Nome do repositório')
  .option('-p, --private', 'Criar repositório privado')
  .action(initCommand);

program.parse();
