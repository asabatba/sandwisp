const { build } = require('esbuild');

const options = {
    stdio: 'inherit',
    target: 'es2017',
    platform: 'node',
    entryPoints: ['./src/index.ts'],
    outfile: './dist/bundle.js',
    minify: true,
    bundle: true,
};

build(options).catch(() => process.exit(1));