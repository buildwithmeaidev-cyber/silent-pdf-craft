import { useState } from "react";

export function useToolUI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    loading,
    setLoading,
    error,
    setError,
  };
}
