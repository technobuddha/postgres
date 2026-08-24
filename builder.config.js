//@ts-check

/** @type import('\@technobuddha/project/build').Builds */
const config = {
  default: {
    steps: [
      {
        display: 'Clean',
        command: 'rm -rf ./dist'
      },
      {
        display: 'Compile',
        command: 'npx tsc --build src',
      }
    ],
  },
  prod: {
    steps: [{ build: 'default' }]
  },
  publish: {
    steps: [
      { build: 'default' },
      {
        display: 'Version',
        command: 'yarn version prerelease',
      },
      {
        display: 'Publish',
        command: 'yarn npm publish --access=public',
      }
    ]
  }
};

export default config;
