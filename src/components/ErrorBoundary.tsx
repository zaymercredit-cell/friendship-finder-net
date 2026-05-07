import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Optional label for debugging — shows in console + UI subtitle. */
  scope?: string;
}

interface State {
  error: Error | null;
}

/**
 * Catches render errors in lazy-loaded routes/sections and shows a friendly
 * fallback instead of a white screen. Keeps the app shell mounted.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("[ErrorBoundary]", this.props.scope || "", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Что-то пошло не так</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Раздел не удалось загрузить. Попробуйте обновить страницу.
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={this.reset}>Повторить</Button>
          <Button onClick={() => window.location.reload()}>Обновить</Button>
        </div>
      </div>
    );
  }
}
