#!/usr/bin/env node
"use strict";
/* Конвертирует три CSV-выгрузки рейтингов «Сердце Зоны» в top100-data.js
 * Использование: node build-top100.js [папка_с_csv] [путь_к_top100-data.js]
 * По умолчанию ищет CSV рядом со скриптом и пишет ./top100-data.js */
const fs = require("fs");
const path = require("path");

/* Простой CSV-парсер: кавычки, экранированные "" внутри поля, CRLF/LF, запятые и
   переносы строк внутри кавычек (Node без внешних зависимостей). */
function parseCsv(text) {
  text = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\r") { /* игнор */ }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => !(r.length === 1 && r[0] === ""));
}

const INACTIVE_MARK = "📡";

function csvToRows(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const rows = parseCsv(text).slice(1); // без заголовка
  return rows.map(([, nick, level, value]) => {
    const inactive = nick.startsWith(INACTIVE_MARK) ? 1 : 0;
    const cleanNick = inactive ? nick.slice(INACTIVE_MARK.length) : nick;
    return [cleanNick, Number(level), Number(value), inactive];
  });
}

const SOURCES = [
  { file: "heart-of-the-zone-top100-talents.csv", varName: "TOP100_TALENTS" },
  { file: "heart-of-the-zone-top100-camp_defenses.csv", varName: "TOP100_DEFENSE" },
  { file: "heart-of-the-zone-top100-expeditions.csv", varName: "TOP100_EXPEDITIONS" },
];

const inputDir = process.argv[2] || __dirname;
const outputFile = process.argv[3] || path.join(process.cwd(), "top100-data.js");

const blocks = SOURCES.map(({ file, varName }) => {
  const filePath = path.join(inputDir, file);
  if (!fs.existsSync(filePath)) throw new Error("Не найден файл: " + filePath);
  const rows = csvToRows(filePath);
  const body = rows.map(r => JSON.stringify(r)).join(",\n");
  return `window.${varName}=[\n${body}\n];`;
});

const header = "/* Данные вкладки «Топ-100»: [ник, уровень, значение, покинул отряд(0/1)] — место = индекс+1 */\n";
fs.writeFileSync(outputFile, header + blocks.join("\n") + "\n");
console.log("Готово:", outputFile);
