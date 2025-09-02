import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import { Feed } from "feed";

export const metadata = {
  title: "Baljka's Daily thoughts",
  description: "A blog by Baljinnyam Dayan",
  openGraph: {
    title: "Baljka's Daily thoughts",
  },
  alternates: {
    types: {
      "application/atom+xml": "https://blog.balj.in/atom.xml",
      "application/rss+xml": "https://blog.balj.in/rss.xml",
    },
  },
};

export async function getPosts() {
  const entries = await readdir("./public/", { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const fileContents = await Promise.all(dirs.map((dir) => readFile("./public/" + dir + "/index.md", "utf8")));
  const posts = dirs.map((slug, i) => {
    const fileContent = fileContents[i];
    const { data } = matter(fileContent);
    return { slug, ...data };
  });
  posts.sort((a, b) => {
    return Date.parse(a.date) < Date.parse(b.date) ? 1 : -1;
  });
  return posts;
}

export async function generateFeed() {
  const posts = await getPosts();
  const site_url = "https://blog.balj.in/";

  const feedOptions = {
    author: {
      name: "Baljinnyam Dayan",
      email: "baljinnyam.dayan@gmail.com",
      link: site_url,
    },
    description: metadata.description,
    favicon: `${site_url}/favicon.png`,
    feedLinks: { atom: `${site_url}atom.xml`, rss: `${site_url}rss.xml` },
    generator: "Feed for Node.js",
    id: site_url,
    image: "https://cdn.balj.in/baljinnyam.png",
    link: site_url,
    title: metadata.title,
  };

  const feed = new Feed(feedOptions);

  for (const post of posts) {
    feed.addItem({
      date: new Date(post.date),
      description: post.spoiler,
      id: `${site_url}${post.slug}/`,
      link: `${site_url}${post.slug}/`,
      title: post.title,
    });
  }

  return feed;
}
