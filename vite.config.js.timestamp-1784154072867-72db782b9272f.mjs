// vite.config.js
import { defineConfig } from "file:///D:/frontend-core/node_modules/vite/dist/node/index.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { grainJsx } from "file:///D:/frontend-core/packages/grain/core/jsx-compiler-new/grain-jsx.vite.js";
var __vite_injected_original_import_meta_url = "file:///D:/frontend-core/vite.config.js";
var __filename = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    grainJsx(),
    {
      name: "spa-path-rewrites",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const path = req.url?.split("?")[0] ?? "";
          if (path === "/routing" || path.startsWith("/routing/")) {
            req.url = "/apps/examples/12-routing.html";
          } else if (path === "/zenwayro" || path.startsWith("/zenwayro/")) {
            req.url = "/apps/zenwayro/index.html";
          }
          next();
        });
      }
    }
  ],
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "grain"
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
      "@app": resolve(__dirname, "./apps/zenwayro/src")
    }
  },
  css: {
    postcss: "./postcss.config.js"
  },
  server: {
    port: 3e3,
    open: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxmcm9udGVuZC1jb3JlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxmcm9udGVuZC1jb3JlXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9mcm9udGVuZC1jb3JlL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnO1xyXG5pbXBvcnQgeyBkaXJuYW1lLCByZXNvbHZlIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGdyYWluSnN4IH0gZnJvbSAnZ3JhaW4vdml0ZSc7XHJcblxyXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xyXG5jb25zdCBfX2Rpcm5hbWUgPSBkaXJuYW1lKF9fZmlsZW5hbWUpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICBncmFpbkpzeCgpLFxyXG4gICAge1xyXG4gICAgICBuYW1lOiAnc3BhLXBhdGgtcmV3cml0ZXMnLFxyXG4gICAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XHJcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgocmVxLCBfcmVzLCBuZXh0KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBwYXRoID0gcmVxLnVybD8uc3BsaXQoJz8nKVswXSA/PyAnJztcclxuICAgICAgICAgIGlmIChwYXRoID09PSAnL3JvdXRpbmcnIHx8IHBhdGguc3RhcnRzV2l0aCgnL3JvdXRpbmcvJykpIHtcclxuICAgICAgICAgICAgcmVxLnVybCA9ICcvYXBwcy9leGFtcGxlcy8xMi1yb3V0aW5nLmh0bWwnO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChwYXRoID09PSAnL3plbndheXJvJyB8fCBwYXRoLnN0YXJ0c1dpdGgoJy96ZW53YXlyby8nKSkge1xyXG4gICAgICAgICAgICByZXEudXJsID0gJy9hcHBzL3plbndheXJvL2luZGV4Lmh0bWwnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbmV4dCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG4gIGVzYnVpbGQ6IHtcclxuICAgIGpzeDogJ2F1dG9tYXRpYycsXHJcbiAgICBqc3hJbXBvcnRTb3VyY2U6ICdncmFpbicsXHJcbiAgfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi8nKSxcclxuICAgICAgJ0BhcHAnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vYXBwcy96ZW53YXlyby9zcmMnKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBjc3M6IHtcclxuICAgIHBvc3Rjc3M6ICcuL3Bvc3Rjc3MuY29uZmlnLmpzJyxcclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogMzAwMCxcclxuICAgIG9wZW46IHRydWUsXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBc08sU0FBUyxvQkFBb0I7QUFDblEsU0FBUyxxQkFBcUI7QUFDOUIsU0FBUyxTQUFTLGVBQWU7QUFDakMsU0FBUyxnQkFBZ0I7QUFIa0gsSUFBTSwyQ0FBMkM7QUFLNUwsSUFBTSxhQUFhLGNBQWMsd0NBQWU7QUFDaEQsSUFBTSxZQUFZLFFBQVEsVUFBVTtBQUVwQyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVDtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sZ0JBQWdCLFFBQVE7QUFDdEIsZUFBTyxZQUFZLElBQUksQ0FBQyxLQUFLLE1BQU0sU0FBUztBQUMxQyxnQkFBTSxPQUFPLElBQUksS0FBSyxNQUFNLEdBQUcsRUFBRSxDQUFDLEtBQUs7QUFDdkMsY0FBSSxTQUFTLGNBQWMsS0FBSyxXQUFXLFdBQVcsR0FBRztBQUN2RCxnQkFBSSxNQUFNO0FBQUEsVUFDWixXQUFXLFNBQVMsZUFBZSxLQUFLLFdBQVcsWUFBWSxHQUFHO0FBQ2hFLGdCQUFJLE1BQU07QUFBQSxVQUNaO0FBQ0EsZUFBSztBQUFBLFFBQ1AsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsS0FBSztBQUFBLElBQ0wsaUJBQWlCO0FBQUEsRUFDbkI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssUUFBUSxXQUFXLElBQUk7QUFBQSxNQUM1QixRQUFRLFFBQVEsV0FBVyxxQkFBcUI7QUFBQSxJQUNsRDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNILFNBQVM7QUFBQSxFQUNYO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
