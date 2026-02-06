/**
 * Onboarding Tour Component
 *
 * An interactive 5-step guided tour for first-time users that:
 * - Introduces key HomesteadHub features
 * - Explains each module's purpose and capabilities
 * - Offers to load example/starter data at the end
 *
 * Tour Flow:
 * 1. Welcome & Overview
 * 2. Food Storage & Inventory tracking
 * 3. Livestock & Garden Management
 * 4. Equipment Maintenance scheduling
 * 5. Tasks & Planning (with option to load data)
 *
 * Features:
 * - Progress indicator showing current step
 * - Back/Next navigation
 * - Skip button (dismisses tour permanently)
 * - Final prompt for starter data with detailed preview
 * - Responsive design using Radix UI Dialog
 *
 * Integration:
 * - Automatically shown on first dashboard visit
 * - Controlled by parent (onboarding-wrapper.tsx)
 * - Calls server action on completion
 * - Updates settings to prevent re-showing
 *
 * Related:
 * - Wrapper: src/app/dashboard/onboarding-wrapper.tsx
 * - Actions: src/actions/onboarding.ts
 * - Data: prisma/seed-starter-data.ts
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard,
  Package,
  Dog,
  Wrench,
  CheckSquare,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Leaf
} from "lucide-react";

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: (loadStarterData: boolean) => void; // Called when user finishes tour
  onSkip: () => void; // Called when user clicks X to skip
}

/**
 * Tour step definitions
 *
 * Each step includes:
 * - step: Step number (1-5)
 * - icon: Lucide icon component
 * - title: Short, engaging headline
 * - description: Brief explanation of the feature
 * - details: 3 key bullet points (shown with numbered badges)
 * - color: Text color for icon (matches module theme)
 * - bgColor: Background color for icon container
 *
 * Design: Each module has its own color scheme matching dashboard
 */
const tourSteps = [
  {
    step: 1,
    icon: LayoutDashboard,
    title: "Welcome to HomesteadHub!",
    description: "Your complete homestead management system. Let's take a quick tour of the key features to get you started.",
    details: [
      "Track everything from food storage to livestock",
      "Manage tasks and equipment maintenance",
      "100% self-hosted and offline-capable",
    ],
    color: "text-forest-600",
    bgColor: "bg-forest-100"
  },
  {
    step: 2,
    icon: Package,
    title: "Food Storage & Inventory",
    description: "Never let supplies expire unnoticed. Track your emergency food storage, expiration dates, and rotation schedules.",
    details: [
      "Monitor all storage items with expiration alerts",
      "Organize by categories: grains, canned goods, freeze-dried, and more",
      "Track calories and nutritional information",
    ],
    color: "text-harvest-600",
    bgColor: "bg-harvest-100"
  },
  {
    step: 3,
    icon: Dog,
    title: "Livestock & Garden Management",
    description: "Keep detailed records of your animals and crops. From breeding schedules to harvest yields.",
    details: [
      "Track animals, health records, and production data",
      "Plan your garden with planting calendars",
      "Monitor crop yields and succession planting",
    ],
    color: "text-barn-600",
    bgColor: "bg-barn-100"
  },
  {
    step: 4,
    icon: Wrench,
    title: "Equipment Maintenance",
    description: "Stay ahead of equipment failures. Schedule maintenance, log service history, and set reminders.",
    details: [
      "Track all equipment: tractors, generators, tools, and more",
      "Automated service reminders based on hours or dates",
      "Complete maintenance history and cost tracking",
    ],
    color: "text-earth-600",
    bgColor: "bg-earth-100"
  },
  {
    step: 5,
    icon: CheckSquare,
    title: "Tasks & Planning",
    description: "From daily chores to seasonal projects. Keep everything organized with recurring task management.",
    details: [
      "Create recurring tasks: daily, weekly, monthly, yearly",
      "Prioritize and track completion",
      "Plan ahead with deadline tracking",
    ],
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
];

export function OnboardingTour({ isOpen, onComplete, onSkip }: OnboardingTourProps) {
  // Track which step user is on (0-4 for 5 steps)
  const [currentStep, setCurrentStep] = useState(0);

  // After final step, show data loading prompt instead of tour step
  const [showStarterDataPrompt, setShowStarterDataPrompt] = useState(false);

  // Calculate progress percentage for progress bar
  const progress = ((currentStep + 1) / tourSteps.length) * 100;
  const isLastStep = currentStep === tourSteps.length - 1;
  const step = tourSteps[currentStep];

  /**
   * Handle Next button click
   * - If not last step: advance to next step
   * - If last step: show starter data prompt
   */
  const handleNext = () => {
    if (isLastStep) {
      setShowStarterDataPrompt(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Handle Back button click
   * Only allows going back if not on first step
   */
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Handle user's choice about starter data
   * Calls parent's onComplete handler which triggers server action
   *
   * @param loadData - true to load example data, false to start empty
   */
  const handleStarterDataChoice = (loadData: boolean) => {
    onComplete(loadData);
  };

  // After tour completes, show different dialog for data loading choice
  // This is a separate UI flow with different content and actions
  if (showStarterDataPrompt) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}> {/* Controlled - can't close by clicking outside */}
        <DialogContent className="sm:max-w-[500px]" hideCloseButton> {/* No X button - user must choose */}
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-forest-500 to-forest-700 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl text-center">Start with Example Data?</DialogTitle>
            <DialogDescription className="text-center text-base">
              Would you like to load example data to explore the features? This includes sample:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <div className="flex items-center gap-3 text-sm text-soil-700">
              <Package className="w-4 h-4 text-harvest-600" />
              <span>Storage items with various expiration dates</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-soil-700">
              <Dog className="w-4 h-4 text-barn-600" />
              <span>Livestock and health records</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-soil-700">
              <Wrench className="w-4 h-4 text-earth-600" />
              <span>Equipment and maintenance logs</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-soil-700">
              <CheckSquare className="w-4 h-4 text-purple-600" />
              <span>Tasks in various states (todo, in progress, completed)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-soil-700">
              <Leaf className="w-4 h-4 text-forest-600" />
              <span>Garden crops and planting records</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> You can safely delete all example data later from Settings → Clear Starter Data
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => handleStarterDataChoice(false)}
              className="w-full sm:w-auto"
            >
              Start with Empty Project
            </Button>
            <Button
              onClick={() => handleStarterDataChoice(true)}
              className="w-full sm:w-auto bg-forest-600 hover:bg-forest-700"
            >
              Load Example Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px]" hideCloseButton>
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 rounded-full"
          onClick={onSkip}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Skip tour</span>
        </Button>

        <DialogHeader>
          <div className={`mx-auto w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center mb-4`}>
            <step.icon className={`w-8 h-8 ${step.color}`} />
          </div>
          <DialogTitle className="text-2xl text-center">{step.title}</DialogTitle>
          <DialogDescription className="text-center text-base">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-6">
          {step.details.map((detail, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-forest-700">{index + 1}</span>
              </div>
              <p className="text-sm text-soil-700 leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-soil-600">
                Step {currentStep + 1} of {tourSteps.length}
              </span>
              <span className="text-soil-600 font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <DialogFooter className="flex-row justify-between gap-2">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="gap-2 bg-forest-600 hover:bg-forest-700"
            >
              {isLastStep ? "Finish Tour" : "Next"}
              {!isLastStep && <ArrowRight className="w-4 h-4" />}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
