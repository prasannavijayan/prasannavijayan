import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = (await getCollection("blog", (p) => p.data.status === "published")).sort(
    (a, b) => new Date(b.data.publishedAt || b.data.created).getTime() - new Date(a.data.publishedAt || a.data.created).getTime(),
  );

  return rss({
    title: "Prasanna Vijayan — Blog",
    description: "Notes on JavaScript, frontend, and building for the web.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(post.data.publishedAt || post.data.created),
      link: `/${post.id}`,
      categories: post.data.tags,
    })),
  });
}
