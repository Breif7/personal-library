import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export type Ingested = {
  type: "article" | "video";
  title: string;
  source: string;
  author?: string;
  thumbnail?: string;
  text: string; // body text to summarize/chunk (description-only for videos without transcripts)
};

const YOUTUBE_RE = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;

/** Fetches a URL and extracts readable content: a YouTube oEmbed for videos, Readability for articles. */
export async function ingestUrl(url: string): Promise<Ingested> {
  const ytMatch = url.match(YOUTUBE_RE);
  if (ytMatch) return ingestYouTube(url);
  return ingestArticle(url);
}

async function ingestYouTube(url: string): Promise<Ingested> {
  const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
  if (!res.ok) throw new Error("Could not fetch this YouTube video's info");
  const data = await res.json();
  // No transcript fetch (fragile/unofficial API) — summarize from title + author, per PLAN.md's
  // documented fallback for videos without an easy transcript source.
  return {
    type: "video",
    title: data.title,
    source: "YouTube",
    author: data.author_name,
    thumbnail: data.thumbnail_url,
    text: `Video titled "${data.title}" by ${data.author_name}.`,
  };
}

async function ingestArticle(url: string): Promise<Ingested> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; PersonalLibraryBot/1.0)" } });
  if (!res.ok) throw new Error(`Could not fetch this page (${res.status})`);
  const html = await res.text();
  const dom = new JSDOM(html, { url });
  const article = new Readability(dom.window.document).parse();
  if (!article?.textContent?.trim()) {
    throw new Error("Could not extract readable text from this page — paste the text manually instead");
  }

  return {
    type: "article",
    title: article.title || new URL(url).hostname,
    source: new URL(url).hostname.replace(/^www\./, ""),
    author: article.byline ?? undefined,
    text: article.textContent.trim(),
  };
}
