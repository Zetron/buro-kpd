import { defineConfig } from "vite";

/* На GitHub Pages сайт лежит в подпапке /<имя-репозитория>/,
   локально — в корне. Имя берём из переменной, которую задаёт Actions,
   чтобы не хардкодить его в конфиге. */
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];

export default defineConfig({
  base: repo ? `/${repo}/` : "/"
});
