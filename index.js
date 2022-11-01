#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import process from 'process';
const readmePath = path.resolve(process.cwd(), 'README.md');
const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const writePath = path.resolve(process.cwd(), 'README_PRINTER_FRIENDLY.md');

(async () => {
  await fs.promises.access(readmePath, fs.constants.F_OK);

  const markdownStream = await fs.promises.readFile(readmePath);
  const markdown = markdownStream.toString();

  const transformed = await makePrinterFrieldly(markdown);

  await fs.promises.writeFile(writePath, transformed);
})();

async function makePrinterFrieldly(markdown) {
  let printerFriendly = await addRepoUrl(markdown);
  printerFriendly = makeLinksPrinterFriendly(printerFriendly);

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

const HEADER_RE = /^#[^\n]*/;
async function addRepoUrl(markdown) {
  const repoUrl = await getRepoUrl();

  if (!repoUrl) {
    return markdown;
  }

  const match = markdown.match(HEADER_RE);

  if (!match) {
    return markdown;
  }

  const matchLength = match[0].length;

  return (
    markdown.slice(0, matchLength) +
    ' ' +
    repoUrl +
    markdown.slice(matchLength, markdown.length)
  );
}

async function getRepoUrl() {
  try {
    const packageJsonStream = await fs.promises.readFile(packageJsonPath);
    const packageJsonStr = packageJsonStream.toString();
    const packageJson = JSON.parse(packageJsonStr);
    const url = packageJson.repository?.url || null;

    return url;
  } catch {
    return null;
  }
}
