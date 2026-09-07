import type { NextConfig } from "next"

// O PWA (manifest + service worker) é escrito à mão em public/sw.js e
// registrado em src/components/register-service-worker.tsx, em vez de usar
// um plugin baseado em webpack (ex: next-pwa) — Next.js 16 usa Turbopack por
// padrão, que não executa plugins de webpack (next.config.ts com um
// `webpack()` configurado quebra o build sob Turbopack).
const nextConfig: NextConfig = {
  /* config options here */
}

export default nextConfig
