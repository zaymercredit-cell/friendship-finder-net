/**
 * Route prefetch registry.
 * Maps URL prefixes to their lazy chunk loader so that hovering/focusing
 * a link can warm up the JS chunk before navigation, giving an
 * "instant" SPA feel on click.
 *
 * NOTE: Loaders here MUST mirror the lazy() imports in src/App.tsx.
 * Vite/Rollup deduplicates the dynamic import, so calling the loader
 * here only triggers a network fetch the first time.
 */

type Loader = () => Promise<unknown>;

const routeLoaders: Array<{ match: (path: string) => boolean; load: Loader }> = [
  { match: (p) => p === "/feed", load: () => import("@/pages/FeedPage") },
  { match: (p) => p === "/home", load: () => import("@/pages/HomePage") },
  { match: (p) => p.startsWith("/profile/"), load: () => import("@/pages/ProfilePage") },
  { match: (p) => p === "/friends", load: () => import("@/pages/FriendsPage") },
  { match: (p) => p === "/people", load: () => import("@/pages/PeoplePage") },
  { match: (p) => p === "/discover", load: () => import("@/pages/DiscoverPage") },
  { match: (p) => p === "/swipe", load: () => import("@/pages/SwipePage") },
  { match: (p) => p === "/matches", load: () => import("@/pages/MatchesPage") },
  { match: (p) => p.startsWith("/messages"), load: () => import("@/pages/MessagesPage") },
  { match: (p) => p.startsWith("/communities"), load: () => import("@/pages/CommunitiesPage") },
  { match: (p) => p === "/events", load: () => import("@/pages/EventsPage") },
  { match: (p) => p === "/notifications", load: () => import("@/pages/NotificationsPage") },
  { match: (p) => p === "/settings", load: () => import("@/pages/SettingsPage") },
  { match: (p) => p === "/profile-views", load: () => import("@/pages/ProfileViewsPage") },
  { match: (p) => p === "/people-nearby", load: () => import("@/pages/PeopleNearbyPage") },
  { match: (p) => p.startsWith("/meetups"), load: () => import("@/pages/MeetupsPage") },
  { match: (p) => p === "/map", load: () => import("@/pages/MapPage") },
  { match: (p) => p === "/invite", load: () => import("@/pages/InvitePage") },
  { match: (p) => p === "/achievements", load: () => import("@/pages/AchievementsPage") },
  { match: (p) => p === "/activity", load: () => import("@/pages/ActivityPage") },
  { match: (p) => p === "/premium", load: () => import("@/pages/PremiumPage") },
  { match: (p) => p === "/likes-you", load: () => import("@/pages/LikesYouPage") },
  { match: (p) => p === "/dates", load: () => import("@/pages/DatesPage") },
  { match: (p) => p === "/vibe-rooms", load: () => import("@/pages/VibeRoomsPage") },
  { match: (p) => p === "/social-graph", load: () => import("@/pages/SocialGraphPage") },
  { match: (p) => p === "/energy", load: () => import("@/pages/EnergyPage") },
  { match: (p) => p === "/gifts", load: () => import("@/pages/GiftsPage") },
  { match: (p) => p === "/universe", load: () => import("@/pages/UniversePage") },
];

const prefetched = new Set<string>();

export function prefetchRoute(path: string) {
  if (!path || prefetched.has(path)) return;
  prefetched.add(path);
  const entry = routeLoaders.find((r) => r.match(path));
  if (!entry) return;
  // Idle-priority prefetch — never block the main thread on hover.
  const run = () => {
    entry.load().catch(() => {
      // On failure, allow a future retry.
      prefetched.delete(path);
    });
  };
  if (typeof (window as any).requestIdleCallback === "function") {
    (window as any).requestIdleCallback(run, { timeout: 500 });
  } else {
    setTimeout(run, 0);
  }
}
