import * as React from "react";
import { cn } from "~/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function Select({ value, onValueChange, children, className }: SelectProps) {
  const options: { value: string; label: string }[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement<{ value: string; children: React.ReactNode }>(child) && child.type === SelectItem) {
      options.push({
        value: child.props.value,
        label: child.props.children as string,
      });
    }
  });

  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="flex h-9 w-full appearance-none items-center rounded-lg border border-input bg-transparent px-3 py-1 pr-8 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
    </div>
  );
}

function SelectItem({
  value: _value,
  children: _children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return null;
}

export { Select, SelectItem };
