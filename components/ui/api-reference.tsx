"use client";

import { cn } from "@/lib/utils";

interface APIProp {
  name: string;
  type: string;
  default?: string;
  description: string;
  required?: boolean;
}

interface APIReferenceProps {
  title?: string;
  description?: string;
  props: APIProp[];
  className?: string;
}

export function APIReference({ 
  title = "API Reference", 
  description,
  props, 
  className 
}: APIReferenceProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/25">
              <th className="text-left p-3 font-semibold text-sm">Prop</th>
              <th className="text-left p-3 font-semibold text-sm">Type</th>
              <th className="text-left p-3 font-semibold text-sm">Default</th>
              <th className="text-left p-3 font-semibold text-sm">Description</th>
            </tr>
          </thead>
          <tbody>
            {props.map((prop, index) => (
              <tr 
                key={prop.name} 
                className={cn(
                  "border-b last:border-b-0",
                  index % 2 === 0 ? "bg-muted/10" : "bg-background"
                )}
              >
                <td className="p-3 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <code className="text-blue-600 dark:text-blue-400">{prop.name}</code>
                    {prop.required && (
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                        required
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 font-mono text-sm text-muted-foreground">
                  {prop.type}
                </td>
                <td className="p-3 font-mono text-sm text-muted-foreground">
                  {prop.default || '—'}
                </td>
                <td className="p-3 text-sm">
                  {prop.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}