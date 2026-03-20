import { Renderer } from "@takumi-rs/core";

export type MeasureTextWidth = (text: string) => Promise<number>;

type TruncateOgQuoteInput = {
  maxWidth: number;
  maxLines?: number;
  measureTextWidth: MeasureTextWidth;
};

const ELLIPSIS = "...";

function normalizeQuote(rawQuote: string): string {
  return rawQuote.replace(/\s+/g, " ").trim();
}

async function splitTokenByWidth(
  token: string,
  maxWidth: number,
  measureTextWidth: MeasureTextWidth,
): Promise<{ chunks: string[]; truncated: boolean }> {
  if (token.length === 0) {
    return { chunks: [], truncated: false };
  }

  if ((await measureTextWidth(token)) <= maxWidth) {
    return { chunks: [token], truncated: false };
  }

  const chunks: string[] = [];
  let currentChunk = "";
  let truncated = false;

  for (const character of token) {
    if ((await measureTextWidth(character)) > maxWidth) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = "";
      }

      truncated = true;
      continue;
    }

    const candidate = `${currentChunk}${character}`;

    if (currentChunk.length > 0 && (await measureTextWidth(candidate)) > maxWidth) {
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

async function getFittingEllipsis(
  maxWidth: number,
  measureTextWidth: MeasureTextWidth,
): Promise<string> {
  let marker = ELLIPSIS;

  while (marker.length > 0 && (await measureTextWidth(marker)) > maxWidth) {
    marker = marker.slice(0, -1);
  }

  return marker;
}

async function clampLineWithEllipsis(
  line: string,
  maxWidth: number,
  measureTextWidth: MeasureTextWidth,
): Promise<string> {
  const ellipsis = await getFittingEllipsis(maxWidth, measureTextWidth);

  if (ellipsis.length === 0) {
    return line;
  }

  let clampedLine = line.trimEnd();

  while (
    clampedLine.length > 0 &&
    (await measureTextWidth(`${clampedLine}${ellipsis}`)) > maxWidth
  ) {
    clampedLine = clampedLine.slice(0, -1).trimEnd();
  }

  if (clampedLine.length === 0) {
    return ellipsis;
  }

  return `${clampedLine}${ellipsis}`;
}

export async function truncateOgQuote(
  quote: string,
  { maxWidth, maxLines = 2, measureTextWidth }: TruncateOgQuoteInput,
): Promise<string> {
  const normalizedQuote = normalizeQuote(quote);

  if (normalizedQuote.length === 0 || maxWidth <= 0 || maxLines <= 0) {
    return "";
  }

  const wrappedLines: string[] = [];
  let hadOverflow = false;

  for (const token of normalizedQuote.split(" ")) {
    const { chunks, truncated } = await splitTokenByWidth(token, maxWidth, measureTextWidth);

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

      if ((await measureTextWidth(mergedLine)) <= maxWidth) {
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
    return await getFittingEllipsis(maxWidth, measureTextWidth);
  }

  const clampedLines = wrappedLines.slice(0, Math.min(maxLines, wrappedLines.length));
  const lastIndex = clampedLines.length - 1;

  clampedLines[lastIndex] = await clampLineWithEllipsis(
    clampedLines[lastIndex],
    maxWidth,
    measureTextWidth,
  );

  return clampedLines.join("\n");
}

const takumiTextMeasureRenderer = new Renderer();

const takumiTextMeasureNodeStyle: React.CSSProperties = {
  fontFamily: "Geist Mono, monospace",
  fontSize: 1,
  lineHeight: 1,
};

export async function measureTakumiTextWidth(text: string): Promise<number> {
  if (text.length === 0) {
    return 0;
  }

  const measuredNode = await takumiTextMeasureRenderer.measure({
    type: "text",
    text,
    style: takumiTextMeasureNodeStyle,
  });

  return measuredNode.width;
}
