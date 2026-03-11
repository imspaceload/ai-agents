import { db } from '@/lib/db';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  PenTool, Megaphone, Code, Search, Sparkles, Image, Link as LinkIcon, BarChart3, ArrowRight,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  PenTool, Megaphone, Code, Search, Sparkles, Image, Link: LinkIcon, BarChart3,
};

const categoryColors: Record<string, string> = {
  content: 'bg-blue-500/10 text-blue-500',
  seo: 'bg-green-500/10 text-green-500',
  analysis: 'bg-purple-500/10 text-purple-500',
};

export default async function AgentsPage() {
  const agents = await db.agent.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { agentRuns: true } } },
  });

  return (
    <>
      <PageHeader title="SEO Agents" description="Choose an AI agent to automate your SEO tasks" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const IconComp = iconMap[agent.icon] || PenTool;
          return (
            <Card key={agent.slug} className="group hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <IconComp className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="outline" className={categoryColors[agent.category] || ''}>
                    {agent.category}
                  </Badge>
                </div>
                <h3 className="font-semibold mb-2">{agent.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {agent._count.agentRuns} runs
                </span>
                <Button asChild size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground">
                  <Link href={`/agents/${agent.slug}`}>
                    Run Agent <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
}
