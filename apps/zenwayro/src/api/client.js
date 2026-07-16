/** Compat barrel — prefer importing from domain modules. */
export {
  API_URL,
  MAP_ASSETS,
  apiRequest,
  applyAuthResponse,
  getMapStyleUrl,
  isAuthenticated,
  logout,
  setAccessToken,
  useAuthToken,
  useAuthUser,
  getAccessTokenValue,
} from './http.js';

export * from './endpoints.js';
export * from './auth.js';
export * from './users.js';
export * from './trips.js';
export * from './pois.js';
export * from './quiz.js';
export * from './popular.js';
export * from './admin.js';
export {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  openNotificationStream,
  getUnreadCount,
  getNotifications,
  setUnreadCount,
  setNotifications,
} from './notifications.js';

export { createResource } from './resource.js';
