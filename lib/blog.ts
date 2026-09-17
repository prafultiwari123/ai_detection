import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

export type PostMeta = {
  title: string;
  description: string;
  date: string;
  slug: string;
};

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(BLOG_DIR);
  return files
    .filter((f) => f.endsWith('.mdx'))
    .map((filename) => {
      const filePath = path.join(BLOG_DIR, filename);
      const source = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(source);
      return {
        title: data.title,
        description: data.description,
        date: data.date,
        slug: data.slug || filename.replace('.mdx', ''),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string) {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const source = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(source);
  return { meta: data as PostMeta, content };
}