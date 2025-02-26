import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts', '!**/*.spec.ts'],
  format: ['esm'],
  skipNodeModulesBundle: true,
  clean: true,
  sourcemap: false,
  dts: true,
  minify: false,
  splitting: false,
  bundle: false
});
