import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  dts: false,
  sourcemap: false,
  minify: false,
  splitting: false,
  shims: true,
});