import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'antd', 'vc-design'],
  treeshake: true,
  splitting: false,
  minify: false,
  loader: {
    '.jpg': 'file',
    '.jpeg': 'file',
    '.png': 'file',
    '.gif': 'file',
  },
});
