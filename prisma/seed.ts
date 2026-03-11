import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const agents = [
  {
    slug: 'blog-writer',
    name: 'Blog Content Writer',
    description: 'Generates full SEO-optimized blog posts with proper heading hierarchy, keyword integration, meta descriptions, and FAQ sections.',
    category: 'content',
    icon: 'PenTool',
    sortOrder: 1,
  },
  {
    slug: 'copywriter',
    name: 'Copywriter',
    description: 'Creates compelling ad copy, headlines, CTAs, product descriptions, email subjects, and taglines that convert.',
    category: 'content',
    icon: 'Megaphone',
    sortOrder: 2,
  },
  {
    slug: 'meta-generator',
    name: 'SEO Meta Generator',
    description: 'Creates optimized meta titles, descriptions, Open Graph tags, and JSON-LD schema markup for any page.',
    category: 'seo',
    icon: 'Code',
    sortOrder: 3,
  },
  {
    slug: 'keyword-research',
    name: 'Keyword Research Agent',
    description: 'Discovers high-value keywords, analyzes search intent, and suggests related terms and questions people ask.',
    category: 'seo',
    icon: 'Search',
    sortOrder: 4,
  },
  {
    slug: 'content-optimizer',
    name: 'Content Optimizer',
    description: 'Takes existing content and optimizes it for target keywords, readability, heading structure, and SEO best practices.',
    category: 'seo',
    icon: 'Sparkles',
    sortOrder: 5,
  },
  {
    slug: 'alt-text-generator',
    name: 'Image Alt Text Generator',
    description: 'Generates SEO-friendly alt text and captions for images to improve accessibility and search visibility.',
    category: 'content',
    icon: 'Image',
    sortOrder: 6,
  },
  {
    slug: 'internal-linking',
    name: 'Internal Linking Suggester',
    description: 'Analyzes your content and suggests internal links to improve site structure, user flow, and SEO authority.',
    category: 'seo',
    icon: 'Link',
    sortOrder: 7,
  },
  {
    slug: 'competitor-analyzer',
    name: 'Competitor Content Analyzer',
    description: 'Analyzes competitor content to identify gaps, keyword opportunities, and strategies you can leverage.',
    category: 'analysis',
    icon: 'BarChart3',
    sortOrder: 8,
  },
];

async function main() {
  console.log('Seeding agents...');
  for (const agent of agents) {
    await prisma.agent.upsert({
      where: { slug: agent.slug },
      update: agent,
      create: agent,
    });
  }
  console.log(`Seeded ${agents.length} agents.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
