import { Router, Route } from 'grainlet/route';
import { AppShell } from './design-system/layouts/AppChrome.jsx';
import { AuthGuard } from './layout/AuthGuard.jsx';
import { ToastHost } from './components/Toast.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { ExplorePage } from './pages/ExplorePage.jsx';
import { QuizPage } from './pages/QuizPage.jsx';
import { TripsPage } from './pages/TripsPage.jsx';
import { PlanPage, SharedPlanPage } from './pages/PlanPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import {
  AuthForgotPasswordPage,
  AuthResetPasswordPage,
  AuthSignInPage,
  AuthSignUpPage,
  AuthVerifyPage,
  AuthVerifyPendingPage,
} from './pages/AuthPages.jsx';
import {
  PopularBrowsePage,
  PopularTripDetailPage,
  PopularTripsPage,
} from './pages/PopularTripsPages.jsx';
import {
  ContactPage,
  CookiesPage,
  PrivacyPage,
  TermsPage,
} from './pages/LegalPages.jsx';
import {
  AdminAiPage,
  AdminCitiesPage,
  AdminImagesPage,
  AdminPage,
  AdminUsersPage,
  NotFoundPage,
} from './pages/AdminPages.jsx';

export function App() {
  return (
    <>
      <AuthGuard />
      <AppShell>
        <Router basename="/zenwayro">
          <Route path="/" component={HomePage} />
          <Route path="/explore" component={ExplorePage} />
          <Route path="/quiz" component={QuizPage} />
          <Route path="/trips" component={TripsPage} />
          <Route path="/plan/new" component={PlanPage} />
          <Route path="/plan/shared/:slug" component={SharedPlanPage} />
          <Route path="/plan/:id" component={PlanPage} />
          <Route path="/popular-trips" component={PopularTripsPage} />
          <Route path="/popular-trips/browse" component={PopularBrowsePage} />
          <Route path="/popular-trips/:id" component={PopularTripDetailPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/auth/signin" component={AuthSignInPage} />
          <Route path="/auth/signup" component={AuthSignUpPage} />
          <Route path="/auth/forgot-password" component={AuthForgotPasswordPage} />
          <Route path="/auth/reset-password" component={AuthResetPasswordPage} />
          <Route path="/auth/verify-pending" component={AuthVerifyPendingPage} />
          <Route path="/auth/verify" component={AuthVerifyPage} />
          <Route path="/terms" component={TermsPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/cookies" component={CookiesPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/admin/images" component={AdminImagesPage} />
          <Route path="/admin/ai-enrichment" component={AdminAiPage} />
          <Route path="/admin/users" component={AdminUsersPage} />
          <Route path="/admin/cities/create" component={AdminCitiesPage} />
          <Route path="*" component={NotFoundPage} />
        </Router>
      </AppShell>
      <ToastHost />
    </>
  );
}
