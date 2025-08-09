// vite.config.ts
import { defineConfig }             from "vite";
import react                        from "@vitejs/plugin-react-swc";
import path                         from "path";
//import sitemap                      from "vite-plugin-sitemap";     

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),

    // sitemap({
    //   hostname: 'https://kirangunathilaka.online',
    //   readable: true,               // pretty‑print the XML

    //   // Per‑route crawl hints
    //   changefreq: {
    //     '/blog':        'weekly',
    //     '/blog/*':      'weekly',
    //     '/projects':    'weekly',
    //     '/projects/*':  'weekly',
    //     '/skills':      'monthly',
    //     '/milestones':  'monthly',
    //     '*':            'monthly'   // default
    //   },

    //   priority: {
    //     '/':            1.0,
    //     '/blog':        0.8,
    //     '/blog/*':      0.7,
    //     '/projects':    0.8,
    //     '/projects/*':  0.7,
    //     '/skills':      0.5,
    //     '/milestones':  0.5,
    //     '*':            0.6         // default
    //   },

    //   exclude: ['/admin'],          // keeps the CMS back‑office out
    // }),                                                     
  ].filter(Boolean),

  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
}));
