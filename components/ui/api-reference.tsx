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
    <section className={cn("space-y-5", className)} aria-labelledby="api-reference-title">
      <div>
        <h2 id="api-reference-title" className="text-2xl font-semibold">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full min-w-[720px]" aria-label="Component props">
          <thead>
            <tr className="border-b bg-muted/35">
              <th scope="col" className="p-3 text-left font-mono text-xs font-medium uppercase text-muted-foreground">Prop</th>
              <th scope="col" className="p-3 text-left font-mono text-xs font-medium uppercase text-muted-foreground">Type</th>
              <th scope="col" className="p-3 text-left font-mono text-xs font-medium uppercase text-muted-foreground">Default</th>
              <th scope="col" className="p-3 text-left font-mono text-xs font-medium uppercase text-muted-foreground">Description</th>
            </tr>
          </thead>
          <tbody>
            {props.map((prop, index) => (
              <tr 
                key={prop.name} 
                className={cn(
                  "border-b last:border-b-0",
                  index % 2 === 0 ? "bg-muted/10" : "bg-card"
                )}
              >
                <td className="p-3 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <code className="text-foreground">{prop.name}</code>
                    {prop.required && (
                      <span className="rounded-sm border px-1.5 py-0.5 font-sans text-[10px] font-medium uppercase text-muted-foreground">
                        Required
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
                <td className="p-3 text-sm leading-6">
                  {prop.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
