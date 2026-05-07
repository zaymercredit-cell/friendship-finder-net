import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import { PageSkeleton } from "@/components/ui/content-skeleton";
import ErrorBoundary from "@/components/ErrorBoundary";

// Eager-loaded critical pages
import Landing from "./pages/Landing";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AppLayout from "./components/AppLayout";

// Lazy-loaded pages
const FeedPage = lazy(() => import("./pages/FeedPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const FriendsPage = lazy(() => import("./pages/FriendsPage"));
const PeoplePage = lazy(() => import("./pages/PeoplePage"));
const DiscoverPage = lazy(() => import("./pages/DiscoverPage"));
const SwipePage = lazy(() => import("./pages/SwipePage"));
const MatchesPage = lazy(() => import("./pages/MatchesPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const CommunitiesPage = lazy(() => import("./pages/CommunitiesPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const ProfileViewsPage = lazy(() => import("./pages/ProfileViewsPage"));
const PeopleNearbyPage = lazy(() => import("./pages/PeopleNearbyPage"));
const MeetupsPage = lazy(() => import("./pages/MeetupsPage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const InvitePage = lazy(() => import("./pages/InvitePage"));
const InviteLandingPage = lazy(() => import("./pages/InviteLandingPage"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const ActivityPage = lazy(() => import("./pages/ActivityPage"));
const PremiumPage = lazy(() => import("./pages/PremiumPage"));
const LikesYouPage = lazy(() => import("./pages/LikesYouPage"));
const DatesPage = lazy(() => import("./pages/DatesPage"));
const VibeRoomsPage = lazy(() => import("./pages/VibeRoomsPage"));
const SocialGraphPage = lazy(() => import("./pages/SocialGraphPage"));
const EnergyPage = lazy(() => import("./pages/EnergyPage"));
const GiftsPage = lazy(() => import("./pages/GiftsPage"));
const UniversePage = lazy(() => import("./pages/UniversePage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminPlaceholder = lazy(() => import("./pages/admin/AdminPlaceholder"));
const AdminReportsPage = lazy(() => import("./pages/admin/AdminReportsPage"));
const AdminSeedPage = lazy(() => import("./pages/admin/AdminSeedPage"));
const AdminNewsPage = lazy(() => import("./pages/admin/AdminNewsPage"));
const AdminCommunitiesPage = lazy(() => import("./pages/admin/AdminCommunitiesPage"));
const AdminEventsPage = lazy(() => import("./pages/admin/AdminEventsPage"));
const AdminSafetyAlertsPage = lazy(() => import("./pages/admin/AdminSafetyAlertsPage"));
const AdminMessagesPage = lazy(() => import("./pages/admin/AdminMessagesPage"));

// News pages (public)
const NewsListPage = lazy(() => import("./pages/news/NewsListPage"));
const NewsDetailPage = lazy(() => import("./pages/news/NewsDetailPage"));
const NewsArchivePage = lazy(() => import("./pages/news/NewsArchivePage"));

// SEO pages (public, lazy)
const DatingCityPage = lazy(() => import("./pages/seo/DatingCityPage"));
const DatingInterestPage = lazy(() => import("./pages/seo/DatingInterestPage"));
const DatingAgePage = lazy(() => import("./pages/seo/DatingAgePage"));
const PublicProfilePage = lazy(() => import("./pages/seo/PublicProfilePage"));
const CitiesPage = lazy(() => import("./pages/seo/CitiesPage"));
const InterestsPage = lazy(() => import("./pages/seo/InterestsPage"));
const EventPage = lazy(() => import("./pages/seo/EventPage"));

function PageLoader() {
  // Premium skeleton — keeps app shell visible, no full-screen spinner.
  return (
    <div className="px-4 py-4">
      <PageSkeleton />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 min default
      gcTime: 10 * 60 * 1000,   // 10 min garbage collection
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AuthenticatedLayout() {
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary scope="root">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public / SEO */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/invite/:code" element={<InviteLandingPage />} />
              <Route path="/cities" element={<CitiesPage />} />
              <Route path="/interests" element={<InterestsPage />} />
              <Route path="/dating/:city" element={<DatingCityPage />} />
              <Route path="/dating/interests/:interest" element={<DatingInterestPage />} />
              <Route path="/dating/age/:range" element={<DatingAgePage />} />
              <Route path="/u/:username" element={<PublicProfilePage />} />
              <Route path="/events/:slug" element={<EventPage />} />
              <Route path="/news" element={<NewsListPage />} />
              <Route path="/news/archive" element={<NewsArchivePage />} />
              <Route path="/news/archive/:year" element={<NewsArchivePage />} />
              <Route path="/news/archive/:year/:month" element={<NewsArchivePage />} />
              <Route path="/news/:slug" element={<NewsDetailPage />} />

              {/* Onboarding */}
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

              {/* Authenticated — shared layout shell (top bar, sidebar, mobile nav stay mounted) */}
              <Route element={<AuthenticatedLayout />}>
                {/* Admin */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/reports" element={<AdminReportsPage />} />
                <Route path="/admin/safety" element={<AdminSafetyAlertsPage />} />
                <Route path="/admin/messages" element={<AdminMessagesPage />} />
                <Route path="/admin/posts" element={<AdminPlaceholder />} />
                <Route path="/admin/tags" element={<AdminPlaceholder />} />
                <Route path="/admin/communities" element={<AdminCommunitiesPage />} />
                <Route path="/admin/events" element={<AdminEventsPage />} />
                <Route path="/admin/seed" element={<AdminSeedPage />} />
                <Route path="/admin/news" element={<AdminNewsPage />} />

                {/* App */}
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/people" element={<PeoplePage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/swipe" element={<SwipePage />} />
                <Route path="/matches" element={<MatchesPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/messages/:id" element={<MessagesPage />} />
                <Route path="/communities" element={<CommunitiesPage />} />
                <Route path="/communities/:id" element={<CommunitiesPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile-views" element={<ProfileViewsPage />} />
                <Route path="/people-nearby" element={<PeopleNearbyPage />} />
                <Route path="/meetups" element={<MeetupsPage />} />
                <Route path="/meetups/:id" element={<MeetupsPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/invite" element={<InvitePage />} />
                <Route path="/achievements" element={<AchievementsPage />} />
                <Route path="/activity" element={<ActivityPage />} />
                <Route path="/premium" element={<PremiumPage />} />
                <Route path="/likes-you" element={<LikesYouPage />} />
                <Route path="/dates" element={<DatesPage />} />
                <Route path="/vibe-rooms" element={<VibeRoomsPage />} />
                <Route path="/social-graph" element={<SocialGraphPage />} />
                <Route path="/energy" element={<EnergyPage />} />
                <Route path="/gifts" element={<GiftsPage />} />
                <Route path="/universe" element={<UniversePage />} />
                <Route path="/bookmarks" element={<div className="max-w-xl mx-auto text-center py-16"><p className="text-muted-foreground">Закладок пока нет</p></div>} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
