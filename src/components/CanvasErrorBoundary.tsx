/**
 * @fileoverview Catches a failed 3D chunk download or WebGL context creation
 * so the visitor lands on express mode instead of a blank page.
 */

import { Component, type ReactNode } from "react";

interface Props {
  onError: () => void;
  children: ReactNode;
}

interface State {
  failed: boolean;
}

export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(): void {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
