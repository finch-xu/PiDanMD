import { cn } from "~/lib/utils";

interface SettingsCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsCard({ title, children, className }: SettingsCardProps) {
  return (
    <div className={cn("rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50", className)}>
      {title && (
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      )}
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

interface SettingsRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsRow({ label, description, children }: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <div className="text-sm">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
