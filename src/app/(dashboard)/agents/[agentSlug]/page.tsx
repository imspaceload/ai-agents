'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import { CopyButton } from '@/components/shared/copy-button';
import { useAgentStream } from '@/lib/hooks/use-agent-stream';
import { Loader2, Play, Square, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { AgentDefinition, AgentField } from '@/types';
import { getAllAgents } from '@/lib/agents/registry';

export default function AgentExecutionPage() {
  const params = useParams();
  const slug = params.agentSlug as string;
  const [agent, setAgent] = useState<AgentDefinition | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const { isStreaming, content, error, execute, cancel, reset } = useAgentStream();

  useEffect(() => {
    const found = getAllAgents().find((a) => a.slug === slug);
    if (found) {
      setAgent(found);
      const defaults: Record<string, unknown> = {};
      found.fields.forEach((f) => {
        if (f.defaultValue !== undefined) defaults[f.name] = f.defaultValue;
      });
      setFormData(defaults);
    }

    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => setProjects(data.projects || []))
      .catch(() => {});
  }, [slug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    execute(slug, formData, selectedProject || undefined);
  };

  const handleFieldChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}-output.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title={agent.name} description={agent.description}>
        <Button variant="outline" asChild>
          <Link href="/agents">
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Agents
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Project selector */}
              {projects.length > 0 && (
                <div className="space-y-2">
                  <Label>Project (optional)</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Dynamic fields */}
              {agent.fields.map((field) => (
                <DynamicField
                  key={field.name}
                  field={field}
                  value={formData[field.name]}
                  onChange={(val) => handleFieldChange(field.name, val)}
                />
              ))}

              <div className="flex gap-2 pt-2">
                {isStreaming ? (
                  <Button type="button" variant="destructive" onClick={cancel} className="flex-1">
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                ) : (
                  <Button type="submit" className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                )}
                {content && !isStreaming && (
                  <Button type="button" variant="outline" onClick={reset}>
                    Clear
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Output</CardTitle>
              {content && !isStreaming && (
                <div className="flex gap-2">
                  <CopyButton text={content} />
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {isStreaming && !content && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Generating...</span>
              </div>
            )}
            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}
            <div className="max-h-[600px] overflow-y-auto">
              <MarkdownRenderer content={content} streaming={isStreaming} />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: AgentField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (field.type) {
    case 'text':
      return (
        <div className="space-y-2">
          <Label>{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
          <Input
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
          {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
        </div>
      );
    case 'textarea':
      return (
        <div className="space-y-2">
          <Label>{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
          />
          {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
        </div>
      );
    case 'select':
      return (
        <div className="space-y-2">
          <Label>{field.label}</Label>
          <Select value={(value as string) || field.defaultValue as string || ''} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.name}
            checked={value as boolean ?? field.defaultValue as boolean ?? false}
            onCheckedChange={onChange}
          />
          <Label htmlFor={field.name} className="cursor-pointer">{field.label}</Label>
        </div>
      );
    default:
      return null;
  }
}
