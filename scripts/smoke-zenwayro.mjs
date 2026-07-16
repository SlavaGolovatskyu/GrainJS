/**
 * Smoke harness for zenwayro Grain pages / API surface.
 * Run: npx vite-node scripts/smoke-zenwayro.mjs
 */
import { App } from '../apps/zenwayro/src/App.jsx';
import { HomePage } from '../apps/zenwayro/src/pages/HomePage.jsx';
import { ExplorePage } from '../apps/zenwayro/src/pages/ExplorePage.jsx';
import { PlanPage } from '../apps/zenwayro/src/pages/PlanPage.jsx';
import { TripsPage } from '../apps/zenwayro/src/pages/TripsPage.jsx';
import { SettingsPage } from '../apps/zenwayro/src/pages/SettingsPage.jsx';
import { AdminPage } from '../apps/zenwayro/src/pages/AdminPages.jsx';
import { PopularTripsPage } from '../apps/zenwayro/src/pages/PopularTripsPages.jsx';
import { QuizPage } from '../apps/zenwayro/src/pages/QuizPage.jsx';
import { AuthVerifyPage } from '../apps/zenwayro/src/pages/AuthPages.jsx';
import * as api from '../apps/zenwayro/src/api/client.js';

const checks = {
  App,
  HomePage,
  ExplorePage,
  PlanPage,
  TripsPage,
  SettingsPage,
  AdminPage,
  PopularTripsPage,
  QuizPage,
  AuthVerifyPage,
  fetchPois: api.fetchPois,
  openNotificationStream: api.openNotificationStream,
  fetchAdminUsers: api.fetchAdminUsers,
  shareTrip: api.shareTrip,
};

for (const [name, value] of Object.entries(checks)) {
  if (typeof value !== 'function') {
    console.error(`FAIL ${name}`);
    process.exitCode = 1;
  }
}

if (!process.exitCode) {
  console.log(
    'zenwayro smoke ok:',
    Object.keys(checks).length,
    'exports'
  );
}
