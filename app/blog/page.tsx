import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Guides and articles on detecting AI-written text, ChatGPT, Gemini, and Claude writing patterns.',
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-serif mb-8">Blog</h1>
      <ul className="space-y-8">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="block group">
              <h2 className="text-xl font-serif group-hover:underline">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{post.date}</p>
              <p className="mt-2 text-gray-700">{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}