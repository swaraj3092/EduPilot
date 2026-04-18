import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Hero } from "./pages/Hero";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { AdmissionProbability } from "./pages/AdmissionProbability";
import { ROICalculator } from "./pages/ROICalculator";
import { LoanEligibility } from "./pages/LoanEligibility";
import { Profile } from "./pages/Profile";
import { ApplicationTracker } from "./pages/ApplicationTracker";
import { UniversityComparison } from "./pages/UniversityComparison";
import { ScholarshipFinder } from "./pages/ScholarshipFinder";
import { TestPrepHub } from "./pages/TestPrepHub";
import { Settings } from "./pages/Settings";
import { Auth } from "./pages/Auth";
import { GoogleMockAuth } from "./pages/GoogleMockAuth";
import { GitHubMockAuth } from "./pages/GitHubMockAuth";
import { ReferralRedirect } from "./pages/ReferralRedirect";

import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: Hero,
      },
      {
        path: "auth",
        Component: Auth,
      },
      {
        path: "ref/:username",
        Component: ReferralRedirect,
      },
      {
        path: "auth/google-mock",
        Component: GoogleMockAuth,
      },
      {
        path: "auth/github-mock",
        Component: GitHubMockAuth,
      },
      {
        path: "onboarding",
        element: <ProtectedRoute><Onboarding /></ProtectedRoute>,
      },
      {
        path: "dashboard",
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
      },
      {
        path: "admission-probability",
        element: <ProtectedRoute><AdmissionProbability /></ProtectedRoute>,
      },
      {
        path: "roi-calculator",
        element: <ProtectedRoute><ROICalculator /></ProtectedRoute>,
      },
      {
        path: "loan-eligibility",
        element: <ProtectedRoute><LoanEligibility /></ProtectedRoute>,
      },
      {
        path: "profile",
        element: <ProtectedRoute><Profile /></ProtectedRoute>,
      },
      {
        path: "application-tracker",
        element: <ProtectedRoute><ApplicationTracker /></ProtectedRoute>,
      },
      {
        path: "university-comparison",
        element: <ProtectedRoute><UniversityComparison /></ProtectedRoute>,
      },
      {
        path: "scholarships",
        element: <ProtectedRoute><ScholarshipFinder /></ProtectedRoute>,
      },
      {
        path: "test-prep",
        element: <ProtectedRoute><TestPrepHub /></ProtectedRoute>,
      },
      {
        path: "settings",
        element: <ProtectedRoute><Settings /></ProtectedRoute>,
      },
    ],
  },
]);