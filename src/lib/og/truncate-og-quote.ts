export type MeasureTextWidth = (text: string) => number;

type TruncateOgQuoteInput = {
  maxWidth: number;
  maxLines?: number;
  measureTextWidth: MeasureTextWidth;
};

const ELLIPSIS = "...";

function normalizeQuote(rawQuote: string): string {
  return rawQuote.replace(/\s+/g, " ").trim();
}

function splitTokenByWidth(
  token: string,
  maxWidth: number,
  measureTextWidth: MeasureTextWidth,
): string[] {
  if (token.length === 0) {
    return [];
  }

  if (measureTextWidth(token) <= maxWidth) {
    return [token];
  }

  const chunks: string[] = [];
  let currentChunk = "";

  for (const character of token) {
    const candidate = `${currentChunk}${character}`;

    if (currentChunk.length > 0 && measureTextWidth(candidate) > maxWidth) {
      chunks.push(currentChunk);
      currentChunk = character;
      continue;
    }

    currentChunk = candidate;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function clampLineWithEllipsis(
  line: string,
  maxWidth: number,
  measureTextWidth: MeasureTextWidth,
): string {
  let clampedLine = line.trimEnd();

  while (
    clampedLine.length > 0 &&
    measureTextWidth(`${clampedLine}${ELLIPSIS}`) > maxWidth
  ) {
    clampedLine = clampedLine.slice(0, -1).trimEnd();
  }

  if (clampedLine.length === 0) {
    return ELLIPSIS;
  }

  return `${clampedLine}${ELLIPSIS}`;
}

export function truncateOgQuote(
  quote: string,
  { maxWidth, maxLines = 2, measureTextWidth }: TruncateOgQuoteInput,
): string {
  const normalizedQuote = normalizeQuote(quote);

  if (normalizedQuote.length === 0 || maxWidth <= 0 || maxLines <= 0) {
    return "";
  }

  const wrappedLines: string[] = [];

  for (const token of normalizedQuote.split(" ")) {
    const parts = splitTokenByWidth(token, maxWidth, measureTextWidth);

    for (const part of parts) {
      const currentLine = wrappedLines.at(-1);

      if (currentLine === undefined) {
        wrappedLines.push(part);
        continue;
      }

      const mergedLine = `${currentLine} ${part}`;

      if (measureTextWidth(mergedLine) <= maxWidth) {
        wrappedLines[wrappedLines.length - 1] = mergedLine;
        continue;
      }

      wrappedLines.push(part);
    }
  }

  if (wrappedLines.length <= maxLines) {
    return wrappedLines.join("\n");
  }

  const clampedLines = wrappedLines.slice(0, maxLines);
  const lastIndex = clampedLines.length - 1;

  clampedLines[lastIndex] = clampLineWithEllipsis(
    clampedLines[lastIndex],
    maxWidth,
    measureTextWidth,
  );

  return clampedLines.join("\n");
}

export function measureTakumiTextWidth(text: string): number {
  return Array.from(text).length;
}
