"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

export function DemoAction({
  children,
  confirmation = "Demo action complete",
  ...props
}: ButtonProps & { confirmation?: string }) {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!confirmed) return;
    const timeout = window.setTimeout(() => setConfirmed(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [confirmed]);

  return (
    <Button {...props} type="button" onClick={() => setConfirmed(true)}>
      {confirmed && <Check className="size-4" aria-hidden="true" />}
      {confirmed ? confirmation : children}
    </Button>
  );
}
