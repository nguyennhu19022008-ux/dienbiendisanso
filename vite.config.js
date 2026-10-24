import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const { build } = require('./scripts/build_dist.cjs');

/**
 * Vite plugin ensuring dist/ is completely populated and verified:
 * - dist/index.html
 * - dist/assets/ (all scripts and styles)
 * - dist/images/ (all WebP images)
 * - dist/*.svg (all root SVG icons)
 */
function copyStaticDistAssetsPlugin() {
  let resolvedOutDir = path.resolve(__dirname, 'dist');
  let resolvedRoot = __dirname;

  return {
    name: 'copy-static-dist-assets',
    configResolved(config) {
      resolvedRoot = config.root || __dirname;
      if (config.build && config.build.outDir) {
        resolvedOutDir = path.resolve(resolvedRoot, config.build.outDir);
      }
    },
    closeBundle() {
      build({ projectRoot: resolvedRoot, distDir: resolvedOutDir, silent: false });
      console.log('✓ [vite.config.js] All production assets synced and verified in dist/');
    }
  };
}

export default {
  plugins: [copyStaticDistAssetsPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      onwarn(warning, warn) {
        // Suppress expected non-module script bundling warnings in static HTML entry
        if (warning.message && warning.message.includes('can\'t be bundled without type="module"')) {
          return;
        }
        warn(warning);
      }
    }
  }
};
