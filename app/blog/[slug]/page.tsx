import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const { meta } = getPostBySlug(params.slug);
    return {
      title: meta.title,
      description: meta.description,
      alternates: { canonical: `/blog/${params.slug}` },
      openGraph: {
        title: meta.title,
        description: meta.description,
        type: 'article',
      },
    };
  } catch {
    return {};
  }
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  let post;
  try {
    post = getPostBySlug(params.slug);
  } catch {
    notFound();
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16 prose prose-neutral">
      <h1 className="font-serif">{post!.meta.title}</h1>
      <p className="text-sm text-gray-500">{post!.meta.date}</p>
      <div className="mt-8">
        <MDXRemote source={post!.content} />
      </div>
    </main>
  );
}