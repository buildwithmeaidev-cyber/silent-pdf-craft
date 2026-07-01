import React, { createContext, useContext, ReactNode } from 'react';

interface FeatureFlags {
  enableAdvancedProcessing?: boolean;
  // Add more flags here as needed
}

const defaultFlags: FeatureFlags = {
  enableAdvancedProcessing: false,
};

const FeatureFlagContext = createContext<FeatureFlags>(defaultFlags);

export const FeatureFlagProvider = ({ children }: { children: ReactNode }) => {
  // In a real app, flags could be fetched from a remote config service.
  // Here we simply read from a global variable if present.
  const flags = (window as any).__FEATURE_FLAGS__ || defaultFlags;
  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => useContext(FeatureFlagContext);
