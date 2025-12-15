import { defineNitroConfig } from "nitropack/config"
import { config } from 'dotenv'
import { resolve } from 'node:path'

config({ path: resolve(__dirname, '../../.env') })

// https://nitro.build/config
export default defineNitroConfig({
  // compatibilityDate: "latest",
  // preset: 'bun',
  srcDir: "server",
  routeRules: {
    '/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    }
  },
  experimental: { openAPI: true },
  openAPI: {
    meta: {
      title: 'AirlineSim API',
      version: '1.0.0',
      description: 'Документация API AirlineSim',
    },
    route: '/_docs/openapi.json',
    ui: {
      scalar: {
        route: '/_docs/scalar',
      },
      swagger: {
        route: '/_docs/swagger',
      },
    }
  }
});
