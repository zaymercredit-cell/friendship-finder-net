import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

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
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
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

              {/* Admin */}
              <Route path="/admin" element={<AuthenticatedRoute><AdminDashboard /></AuthenticatedRoute>} />
              <Route path="/admin/users" element={<AuthenticatedRoute><AdminUsersPage /></AuthenticatedRoute>} />
              <Route path="/admin/reports" element={<AuthenticatedRoute><AdminReportsPage /></AuthenticatedRoute>} />
              <Route path="/admin/safety" element={<AuthenticatedRoute><AdminSafetyAlertsPage /></AuthenticatedRoute>} />
              <Route path="/admin/messages" element={<AuthenticatedRoute><AdminMessagesPage /></AuthenticatedRoute>} />
              <Route path="/admin/posts" element={<AuthenticatedRoute><AdminPlaceholder /></AuthenticatedRoute>} />
              <Route path="/admin/tags" element={<AuthenticatedRoute><AdminPlaceholder /></AuthenticatedRoute>} />
              <Route path="/admin/communities" element={<AuthenticatedRoute><AdminCommunitiesPage /></AuthenticatedRoute>} />
              <Route path="/admin/events" element={<AuthenticatedRoute><AdminEventsPage /></AuthenticatedRoute>} />
              <Route path="/admin/seed" element={<AuthenticatedRoute><AdminSeedPage /></AuthenticatedRoute>} />
              <Route path="/admin/news" element={<AuthenticatedRoute><AdminNewsPage /></AuthenticatedRoute>} />

              {/* Authenticated */}
              <Route path="/feed" element={<AuthenticatedRoute><FeedPage /></AuthenticatedRoute>} />
              <Route path="/home" element={<AuthenticatedRoute><HomePage /></AuthenticatedRoute>} />
              <Route path="/profile/:username" element={<AuthenticatedRoute><ProfilePage /></AuthenticatedRoute>} />
              <Route path="/friends" element={<AuthenticatedRoute><FriendsPage /></AuthenticatedRoute>} />
              <Route path="/people" element={<AuthenticatedRoute><PeoplePage /></AuthenticatedRoute>} />
              <Route path="/discover" element={<AuthenticatedRoute><DiscoverPage /></AuthenticatedRoute>} />
              <Route path="/swipe" element={<AuthenticatedRoute><SwipePage /></AuthenticatedRoute>} />
              <Route path="/matches" element={<AuthenticatedRoute><MatchesPage /></AuthenticatedRoute>} />
              <Route path="/messages" element={<AuthenticatedRoute><MessagesPage /></AuthenticatedRoute>} />
              <Route path="/messages/:id" element={<AuthenticatedRoute><MessagesPage /></AuthenticatedRoute>} />
              <Route path="/communities" element={<AuthenticatedRoute><CommunitiesPage /></AuthenticatedRoute>} />
              <Route path="/communities/:id" element={<AuthenticatedRoute><CommunitiesPage /></AuthenticatedRoute>} />
              <Route path="/events" element={<AuthenticatedRoute><EventsPage /></AuthenticatedRoute>} />
              <Route path="/notifications" element={<AuthenticatedRoute><NotificationsPage /></AuthenticatedRoute>} />
              <Route path="/settings" element={<AuthenticatedRoute><SettingsPage /></AuthenticatedRoute>} />
              <Route path="/profile-views" element={<AuthenticatedRoute><ProfileViewsPage /></AuthenticatedRoute>} />
              <Route path="/people-nearby" element={<AuthenticatedRoute><PeopleNearbyPage /></AuthenticatedRoute>} />
              <Route path="/meetups" element={<AuthenticatedRoute><MeetupsPage /></AuthenticatedRoute>} />
              <Route path="/meetups/:id" element={<AuthenticatedRoute><MeetupsPage /></AuthenticatedRoute>} />
              <Route path="/map" element={<AuthenticatedRoute><MapPage /></AuthenticatedRoute>} />
              <Route path="/invite" element={<AuthenticatedRoute><InvitePage /></AuthenticatedRoute>} />
              <Route path="/achievements" element={<AuthenticatedRoute><AchievementsPage /></AuthenticatedRoute>} />
              <Route path="/activity" element={<AuthenticatedRoute><ActivityPage /></AuthenticatedRoute>} />
              <Route path="/premium" element={<AuthenticatedRoute><PremiumPage /></AuthenticatedRoute>} />
              <Route path="/likes-you" element={<AuthenticatedRoute><LikesYouPage /></AuthenticatedRoute>} />
              <Route path="/dates" element={<AuthenticatedRoute><DatesPage /></AuthenticatedRoute>} />
              <Route path="/vibe-rooms" element={<AuthenticatedRoute><VibeRoomsPage /></AuthenticatedRoute>} />
              <Route path="/social-graph" element={<AuthenticatedRoute><SocialGraphPage /></AuthenticatedRoute>} />
              <Route path="/energy" element={<AuthenticatedRoute><EnergyPage /></AuthenticatedRoute>} />
              <Route path="/gifts" element={<AuthenticatedRoute><GiftsPage /></AuthenticatedRoute>} />
              <Route path="/universe" element={<AuthenticatedRoute><UniversePage /></AuthenticatedRoute>} />
              <Route path="/bookmarks" element={<AuthenticatedRoute><div className="max-w-xl mx-auto text-center py-16"><p className="text-muted-foreground">Закладок пока нет</p></div></AuthenticatedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
