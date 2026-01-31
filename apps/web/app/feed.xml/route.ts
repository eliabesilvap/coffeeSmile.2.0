import { getAllPosts } from '@/lib/content';
import { absoluteUrl, siteUrl } from '@/lib/site';
import type { PostSummary } from '@/lib/types';
import { postUrl } from '@/lib/routes';

export const dynamic = 'force-dynamic';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapCdata(value: string): string {
  const safeValue = value.replace(/]]>/g, ']]]]><![CDATA[>');
  return `<![CDATA[${safeValue}]]>`;
}

export async function GET(): Promise<Response> {
  let posts: PostSummary[] = [];

  try {
    posts = await getAllPosts({ includeContent: true });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Falha ao gerar feed.', error);
    }
  }

  const publishedPosts = posts.filter((post) => post.status === 'published');
  const now = new Date().toUTCString();

  const items = publishedPosts
    .map((post) => {
      const link = absoluteUrl(postUrl(post.slug));
      const title = escapeXml(post.title);
      const description = escapeXml(post.excerpt ?? '');
      const content = wrapCdata(post.content ?? '');
      const pubDate = new Date(post.publishedAt).toUTCString();

      return `
      <item>
        <title>${title}</title>
        <link>${link}</link>
        <guid isPermaLink="true">${link}</guid>
        <pubDate>${pubDate}</pubDate>
        <description>${description}</description>
        <content:encoded>${content}</content:encoded>
      </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CoffeeSmile Blog</title>
    <link>${siteUrl}</link>
    <description>Resenhas de livros cristãos, teologia e cultura do café.</description>
    <language>pt-PT</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${absoluteUrl('/feed.xml')}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
