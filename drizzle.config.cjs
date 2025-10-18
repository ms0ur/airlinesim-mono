// drizzle.config.cjs (в КОРНЕ)
const path = require("node:path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, ".env") });

const posix = (p) => p.replace(/\\/g, "/");
const root = __dirname;

module.exports = {
    // абсолютные пути к реальным .ts-файлам схемы (НЕ к barrel Airror.ts)
    schema: posix(path.resolve(root, "packages/db/src/schema/**/*.ts")),

    // ВАЖНО: относительный путь (из cwd пакета @airlinesim/db)
    out: "./migrations",

    dialect: "postgresql",
    dbCredentials: { url: process.env.DATABASE_URL },
    casing: "snake_case",
    verbose: true,
};
