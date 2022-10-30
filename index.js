#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import process from 'process';
const readmePath = path.resolve(process.cwd(), 'README.md');
const writePath = path.resolve(process.cwd(), 'README_PRINTER_FRIENDLY.md');

(async () => {
  await fs.promises.access(readmePath, fs.constants.F_OK);

  const markdown = await fs.promises.readFile(readmePath);

  const transformed = makePrinterFrieldly(markdown.toString());

  await fs.promises.writeFile(writePath, transformed);
})();

function makePrinterFrieldly(markdown) {
  let printerFriendly = makeLinksPrinterFriendly(markdown);

  return printerFriendly;
}

const LINK_RE = /[^!]\[[^\]]*\]\(([^\)]*)\)/g;
function makeLinksPrinterFriendly(markdown) {
  let parts = [];
  let prevEnd = 0;

  let match;
  while ((match = LINK_RE.exec(markdown))) {
    if (!match) {
      break;
    }

    const matchText = match[0];
    const matchURL = match[1];
    const index = match.index;
    const matchEnd = index + matchText.length;
    parts.push(markdown.slice(prevEnd, matchEnd));
    prevEnd = matchEnd;
    parts.push(`: ${matchURL}`);
  }

  parts.push(markdown.slice(prevEnd, markdown.length));

  return parts.join('');
}
