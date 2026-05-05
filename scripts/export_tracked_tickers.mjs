#!/usr/bin/env node
import { writeFile } from "node:fs/promises";

import { topics } from "../src/data.js";
import { createTrackedTickers } from "../src/model.js";

const args = process.argv.slice(2);
const outputIndex = args.indexOf("--output");
const output = outputIndex >= 0 ? args[outputIndex + 1] : "";
const extraIndex = args.indexOf("--extra");
const extraTickers = extraIndex >= 0 && args[extraIndex + 1] ? args[extraIndex + 1].split(",") : [];
const tickers = createTrackedTickers(topics, extraTickers);
const payload = JSON.stringify(tickers, null, 2);

if (output) {
  await writeFile(output, `${payload}\n`, "utf-8");
} else {
  console.log(payload);
}
