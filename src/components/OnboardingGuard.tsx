import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Checks if the user's profile is substantially filled.
 * If not, redirect to /onboarding.
 */
export function useNeedsOnboarding(): boolean | null {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (!profile) return null;
  
  // Check if essential fields are missing
  const hasName = !!profile.first_name?.trim();
  const hasCity = !!profile.city?.trim();
  const hasInterests = (profile.interests || []).length >= 1;
  const hasGoals = (profile.communication_goals || []).length >= 1;
  
  // If most essential fields are empty, needs onboarding
  const filledCount = [hasName, hasCity, hasInterests, hasGoals].filter(Boolean).length;
  return filledCount < 2;
}

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const needsOnboarding = useNeedsOnboarding();
  
  // Still loading
  if (needsOnboarding === null) return <>{children}</>;
  
  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
}
