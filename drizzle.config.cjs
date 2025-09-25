// drizzle.config.cjs
const dotenv = require("dotenv");
const path = require("node:path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const posix = (p) => p.replace(/\\/g, "/");
const root = __dirname;

module.exports = {
    // указываем реальные .ts-файлы со schema (а не barrel index.ts)
    schema: posix(path.resolve(root, "packages/db/src/schema/**/*.ts")),
    out: posix(path.resolve(root, "packages/db/migrations")),
    dialect: "postgresql",
    dbCredentials: { url: process.env.DATABASE_URL },
    casing: "snake_case",
    verbose: true,
};
