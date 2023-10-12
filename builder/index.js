const {join} = require('path');
const esbuild = require('esbuild');
const {nodeExternalsPlugin} = require('esbuild-node-externals');
const TsconfigPathsPlugin = require('@esbuild-plugins/tsconfig-paths').default;
const {dtsPlugin} = require('esbuild-plugin-d.ts');
const isWatching = process.argv.includes('--watch');

esbuild
  .build({
    entryPoints: [join(__dirname, '../src/index.ts')],
    bundle:      true,
    sourcemap:   true,
    // minify:      true,
    splitting: true,
    format:    'esm',
    platform:  'node',
    target:    ['esnext'],
    outdir:   './build',
    plugins:   [
      nodeExternalsPlugin(),
      TsconfigPathsPlugin({
        tsconfig: '../tsconfig.json',
      }),
      dtsPlugin(),
    ],
    watch:     isWatching,
  })
  .then(console.log)
  .catch(() => process.exit(1));
