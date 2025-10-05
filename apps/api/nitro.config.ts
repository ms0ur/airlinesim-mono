import { defineNitroConfig } from "nitropack/config"

// https://nitro.build/config
export default defineNitroConfig({
  compatibilityDate: "latest",
  srcDir: "server",
    experimental: { openAPI: true },
    openAPI: {
        meta: {
            title: 'AirlineSim API',
            version: '1.0.0',
            description: 'Документация API AirlineSim',
        },
    }
});
