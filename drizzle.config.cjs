const path = require("node:path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, ".env") });

const posix = (p) => p.replace(/\\/g, "/");
const root = __dirname;

module.exports = {
    schema: posix(path.resolve(root, "packages/db/src/schema/**/*.ts")),

    out: "./migrations",

    dialect: "postgresql",
    dbCredentials: { url: process.env.DATABASE_URL },
    casing: "snake_case",
    verbose: true,
};
