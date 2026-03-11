// 🚨
// 🚨 CHANGES TO THIS FILE WILL BE OVERRIDDEN
// 🚨
// @ts-check
import { app } from '@technobuddha/project';

/** @type import('eslint').Linter.Config[] */
const config = [
  { ignores: ['coverage', 'dist'] },
  // .
  app.lint({ files: ['*.config.js'], ignores: [], environment: 'node' }),
  // migrations
  app.lint({
    files: ['migrations/**/*.ts'],
    ignores: [],
    environment: 'node',
    tsConfig: 'migrations/tsconfig.json',
  }),
  // src
  app.lint({
    files: ['src/**/*.ts'],
    ignores: [],
    environment: 'node',
    tsConfig: 'src/tsconfig.json',
  }),
  // templates
  app.lint({
    files: ['templates/**/*.ts'],
    ignores: [],
    environment: 'node',
    tsConfig: 'templates/tsconfig.json',
  }),
];

export default config;
