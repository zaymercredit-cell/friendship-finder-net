import { useMemo } from "react";

interface TrustInput {
  avatarUrl?: string | null;
  about?: string | null;
  interests?: string[] | null;
  isVerified?: boolean | null;
  isVip?: boolean | null;
  createdAt?: string | null;
  city?: string | null;
  age?: number | null;
}

export function calculateTrustScore(p: TrustInput): number {
  let score = 30; // base

  if (p.avatarUrl) score += 15;
  if (p.about && p.about.length > 20) score += 10;
  if (p.interests && p.interests.length >= 3) score += 10;
  if (p.isVerified) score += 20;
  if (p.isVip) score += 5;
  if (p.city) score += 5;
  if (p.age) score += 5;

  // Longevity bonus
  if (p.createdAt) {
    const days = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 86400000);
    if (days > 30) score += 5;
    if (days > 90) score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

export function useTrustScore(profile: TrustInput | null) {
  return useMemo(() => {
    if (!profile) return 0;
    return calculateTrustScore(profile);
  }, [profile]);
}

export function getTrustLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Высокое доверие", color: "text-success" };
  if (score >= 50) return { label: "Среднее доверие", color: "text-warning" };
  return { label: "Низкое доверие", color: "text-destructive" };
}
