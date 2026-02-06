"use client";

import { useState, useEffect } from "react";
import { OnboardingTour } from "@/components/onboarding-tour";
import { completeOnboarding, skipOnboarding } from "@/actions/onboarding";
import { useRouter } from "next/navigation";

interface OnboardingWrapperProps {
  shouldShowOnboarding: boolean;
}

export function OnboardingWrapper({ shouldShowOnboarding }: OnboardingWrapperProps) {
  const [isOpen, setIsOpen] = useState(shouldShowOnboarding);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsOpen(shouldShowOnboarding);
  }, [shouldShowOnboarding]);

  const handleComplete = async (loadStarterData: boolean) => {
    setIsLoading(true);
    const result = await completeOnboarding(loadStarterData);

    if (result.success) {
      setIsOpen(false);
      router.refresh();
    } else {
      alert(result.error || "Failed to complete onboarding");
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    const result = await skipOnboarding();

    if (result.success) {
      setIsOpen(false);
      router.refresh();
    } else {
      alert(result.error || "Failed to skip onboarding");
      setIsLoading(false);
    }
  };

  if (!isOpen || isLoading) {
    return null;
  }

  return (
    <OnboardingTour
      isOpen={isOpen}
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}
