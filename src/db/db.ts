#!/usr/bin/env node
import '@technobuddha/project/env';

import fs from 'node:fs/promises';
import path from 'node:path';

import { toError } from '@technobuddha/library';
import { err, locatePackageRoot, out, spawnPromise } from '@technobuddha/library/node';
import chalk from 'chalk';
import { Argument, program } from 'commander';

async function main(): Promise<void> {
  const here = path.join(import.meta.dirname, '..', '..');
  const root = await locatePackageRoot();

  if (!root) {
    err(chalk.red('Unable to locate the package root directory\n'));
    process.exit(1);
  }

  const packageJson = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf-8'));

  program
    .name('db')
    .description('Technobuddha PostgreSQL utility')
    .version(packageJson.version ?? 'unknown', '-v, --version', 'output the current version');

  program
    .command('init')
    .description('Initialize the database')
    .action(async () => {
      if (!packageJson.scripts?.migrate) {
        packageJson.scripts ??= {};
        packageJson.scripts.migrate = 'npx db migrate';

        await fs.writeFile(
          path.join(root, 'package.json'),
          `${JSON.stringify(packageJson, null, 2)}\n`,
          'utf-8',
        );
        out(chalk.green('Added migrate script to package.json'), '\n');
      }

      await create('initial', { root, here, template: 'initial_template' }).catch((e) => {
        err(chalk.red('Error creating initial migration:'), toError(e).message, '\n');
      });

      await migrate('up', '1');
    });

  program
    .command('create')
    .description('Create a new migration file')
    .addArgument(new Argument('<name>', 'Name of the new migration'))
    .action(async (name: string) => create(name, { root, here }));

  program
    .command('migrate')
    .addArgument(
      new Argument('<direction>', 'Migration direction (up or down)').choices([
        'up',
        'down',
        'redo',
      ]),
    )
    .addArgument(new Argument('[steps]', 'Number of steps to migrate').default(''))
    .action(async (direction: string, steps: string) => migrate(direction, steps));

  program.parse();
}

type CreateOptions = {
  root: string;
  here: string;
  template?: string;
};

async function create(
  name: string,
  { root, here, template = 'migration_template' }: CreateOptions,
): Promise<void> {
  const templatePath = path.relative(root, path.join(here, 'templates', `${template}.ts`));

  const options = [
    '--migration-file-language',
    'ts',
    '--template-file-name',
    templatePath,
    '--migration-filename-format',
    'utc',
  ];

  void (await spawnPromise(
    'npx',
    ['dotenvx', 'run', '--quiet', '--', 'npx', 'node-pg-migrate', 'create', ...options, name],
    { stdio: 'inherit' },
  ));
}

async function migrate(direction: string, steps: string): Promise<void> {
  const options = ['--ignore-pattern', 'tsconfig.json|tsdoc.json'];

  void (await spawnPromise(
    'npx',
    ['dotenvx', 'run', '--quiet', '--', 'npx', 'node-pg-migrate', direction, steps, ...options],
    { stdio: 'inherit' },
  ));
}

await main();
