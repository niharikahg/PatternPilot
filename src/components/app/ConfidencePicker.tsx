import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

export function ConfidencePicker({ value, onChange }: { value: number | null; onChange: (n: number) => void }) {
  return (
    <div className="inline-flex rounded-md border p-0.5" role="radiogroup" aria-label="Confidence">
      {[1, 2, 3, 4, 5].map((n) => (
        <Button variant="ghost" size="icon"
          key={n}
          role="radio"
          aria-checked={value === n}
          onClick={() => onChange(n)}
          className={cn("h-8 w-8 rounded font-mono text-sm transition-colors", value === n ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}
        >
          {n}
        </Button>
      ))}
    </div>
  );
}
