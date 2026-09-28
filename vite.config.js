import { defineConfig } from "vite";

export default defineConfig({
  /* Сайт живёт на своём домене (burokpd.ru) и отдаётся из корня.
     Раньше здесь был путь /<имя-репозитория>/ — он нужен только для адреса
     вида zetron.github.io/buro-kpd/, а GitHub сам перенаправляет его
     на домен. Домен задаётся файлом public/CNAME: Vite копирует его
     в dist, а GitHub Pages читает оттуда. */
  base: "/"
});
