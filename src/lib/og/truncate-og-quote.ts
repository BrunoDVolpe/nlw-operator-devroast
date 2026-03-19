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
): { chunks: string[]; truncated: boolean } {
  if (token.length === 0) {
    return { chunks: [], truncated: false };
  }

  if (measureTextWidth(token) <= maxWidth) {
    return { chunks: [token], truncated: false };
  }

  const chunks: string[] = [];
  let currentChunk = "";
  let truncated = false;

  for (const character of token) {
    if (measureTextWidth(character) > maxWidth) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = "";
      }

      truncated = true;
      continue;
    }

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

  return { chunks, truncated };
}

function getFittingEllipsis(
  maxWidth: number,
  measureTextWidth: MeasureTextWidth,
): string {
  let marker = ELLIPSIS;

  while (marker.length > 0 && measureTextWidth(marker) > maxWidth) {
    marker = marker.slice(0, -1);
  }

  return marker;
}

function clampLineWithEllipsis(
  line: string,
  maxWidth: number,
  measureTextWidth: MeasureTextWidth,
): string {
  const ellipsis = getFittingEllipsis(maxWidth, measureTextWidth);

  if (ellipsis.length === 0) {
    return line;
  }

  let clampedLine = line.trimEnd();

  while (
    clampedLine.length > 0 &&
    measureTextWidth(`${clampedLine}${ellipsis}`) > maxWidth
  ) {
    clampedLine = clampedLine.slice(0, -1).trimEnd();
  }

  if (clampedLine.length === 0) {
    return ellipsis;
  }

  return `${clampedLine}${ellipsis}`;
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
  let hadOverflow = false;

  for (const token of normalizedQuote.split(" ")) {
    const { chunks, truncated } = splitTokenByWidth(token, maxWidth, measureTextWidth);

    if (truncated) {
      hadOverflow = true;
    }

    for (const part of chunks) {
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

  if (wrappedLines.length > maxLines) {
    hadOverflow = true;
  }

  if (!hadOverflow) {
    return wrappedLines.join("\n");
  }

  if (wrappedLines.length === 0) {
    return getFittingEllipsis(maxWidth, measureTextWidth);
  }

  const clampedLines = wrappedLines.slice(0, Math.min(maxLines, wrappedLines.length));
  const lastIndex = clampedLines.length - 1;

  clampedLines[lastIndex] = clampLineWithEllipsis(
    clampedLines[lastIndex],
    maxWidth,
    measureTextWidth,
  );

  return clampedLines.join("\n");
}

function isWideHeuristicGlyph(character: string): boolean {
  return /[\p{Extended_Pictographic}\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE10-\uFE6F\uFF00-\uFFEF]/u.test(
    character,
  );
}

/**
 * Heuristic fallback width adapter until real Takumi text measurement is integrated.
 * Treats emoji/CJK/fullwidth glyphs as 2 columns, ASCII as 1, and spaces as 0.5.
 */
export function measureTakumiTextWidth(text: string): number {
  let width = 0;

  for (const character of text) {
    if (character === " ") {
      width += 0.5;
      continue;
    }

    width += isWideHeuristicGlyph(character) ? 2 : 1;
  }

  return width;
}
