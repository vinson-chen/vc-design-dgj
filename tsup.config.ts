import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    tokens: 'src/entry-tokens.ts',
    icons: 'src/entry-icons.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'antd'],
  treeshake: true,
  splitting: false,
  minify: false,
  /** 与历史产物一致：主包为 index.*；子路径为 tokens.* / icons.* */
  outExtension({ format }) {
    return format === 'cjs' ? { js: `.cjs` } : { js: `.js` };
  },
});

