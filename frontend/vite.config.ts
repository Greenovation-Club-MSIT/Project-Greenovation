import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv, Plugin} from 'vite';

function galleryAutoLoaderPlugin(): Plugin {
  const virtualModuleId = 'virtual:gallery-images';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  function getGalleryImages(): string[] {
    const galleryDir = path.resolve(__dirname, 'public/images/gallery');
    if (!fs.existsSync(galleryDir)) return [];
    const validExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif']);
    const files = fs.readdirSync(galleryDir);
    return files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return validExts.has(ext);
      })
      .map(file => `/images/gallery/${file}`);
  }

  function syncGalleryJson() {
    try {
      const images = getGalleryImages();
      const dataDir = path.resolve(__dirname, 'public/data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const jsonPath = path.resolve(dataDir, 'gallery.json');
      fs.writeFileSync(jsonPath, JSON.stringify(images, null, 2), 'utf-8');
    } catch (e) {
      console.error('[gallery-autoloader] Error syncing gallery.json:', e);
    }
  }

  return {
    name: 'vite-plugin-gallery-autoloader',
    buildStart() {
      syncGalleryJson();
    },
    configureServer(server) {
      syncGalleryJson();
      const galleryDir = path.resolve(__dirname, 'public/images/gallery');
      server.watcher.add(galleryDir);
      server.watcher.on('all', (_event, filePath) => {
        if (filePath && filePath.includes(path.normalize('public/images/gallery'))) {
          syncGalleryJson();
          const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
            server.ws.send({ type: 'full-reload' });
          }
        }
      });
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const images = getGalleryImages();
        return `export default ${JSON.stringify(images)};`;
      }
    }
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [galleryAutoLoaderPlugin(), react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
