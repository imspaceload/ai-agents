import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, FolderOpen, Zap, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatTimeAgo } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [totalRuns, totalProjects, completedRuns, recentRuns] = await Promise.all([
    db.agentRun.count({ where: { userId } }),
    db.project.count({ where: { userId } }),
    db.agentRun.count({ where: { userId, status: 'COMPLETED' } }),
    db.agentRun.findMany({
      where: { userId },
      include: { agent: true, project: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  const agents = await db.agent.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });

  const stats = [
    { title: 'Total Runs', value: totalRuns, icon: Zap, color: 'text-primary' },
    { title: 'Projects', value: totalProjects, icon: FolderOpen, color: 'text-blue-500' },
    { title: 'Completed', value: completedRuns, icon: Bot, color: 'text-green-500' },
    { title: 'Success Rate', value: totalRuns > 0 ? `${Math.round((completedRuns / totalRuns) * 100)}%` : '—', icon: Clock, color: 'text-yellow-500' },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${session?.user?.name || 'User'}`}
        description="Here's an overview of your SEO agent activity"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Access Agents */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {agents.slice(0, 6).map((agent) => (
                <Link
                  key={agent.slug}
                  href={`/agents/${agent.slug}`}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{agent.name}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              ))}
              <Link
                href="/agents"
                className="block text-center text-sm text-primary hover:underline pt-2"
              >
                View all agents
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <Link href="/history" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentRuns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No agent runs yet</p>
                  <p className="text-sm mt-1">Start by running one of your SEO agents</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRuns.map((run) => (
                    <Link
                      key={run.id}
                      href={`/history/${run.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Bot className="h-4 w-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{run.agent.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {run.inputSummary || 'No summary'}
                            {run.project && ` · ${run.project.name}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={run.status === 'COMPLETED' ? 'default' : run.status === 'FAILED' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {run.status.toLowerCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(run.createdAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
