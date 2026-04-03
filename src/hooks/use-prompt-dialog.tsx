import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

interface PromptState {
  open: boolean;
  title: string;
  placeholder: string;
  value: string;
  resolve: ((value: string | null) => void) | null;
}

export function usePromptDialog() {
  const [state, setState] = useState<PromptState>({
    open: false,
    title: "",
    placeholder: "",
    value: "",
    resolve: null,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const prompt = useCallback(
    (title: string, placeholder?: string): Promise<string | null> => {
      return new Promise((resolve) => {
        setState({
          open: true,
          title,
          placeholder: placeholder ?? "",
          value: "",
          resolve,
        });
        setTimeout(() => inputRef.current?.focus(), 50);
      });
    },
    []
  );

  const handleSubmit = useCallback(() => {
    const trimmed = state.value.trim();
    state.resolve?.(trimmed || null);
    setState((s) => ({ ...s, open: false, resolve: null }));
  }, [state.value, state.resolve]);

  const handleCancel = useCallback(() => {
    state.resolve?.(null);
    setState((s) => ({ ...s, open: false, resolve: null }));
  }, [state.resolve]);

  const dialogElement = (
    <Dialog
      open={state.open}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{state.title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="mt-2 flex flex-col gap-3"
        >
          <Input
            ref={inputRef}
            value={state.value}
            onChange={(e) =>
              setState((s) => ({ ...s, value: e.target.value }))
            }
            placeholder={state.placeholder}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">OK</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  return { prompt, dialogElement };
}
