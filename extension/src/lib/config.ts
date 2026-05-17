// extension/src/lib/config.ts
//
// Deployment endpoints. For a production build, change these to the live
// Resumify frontend + backend origins, and update manifest.json
// `host_permissions` to match the frontend origin.
export const RESUMIFY_ORIGIN = "http://localhost:3000";
export const BACKEND_ORIGIN = "http://localhost:8000";
export const COOKIE_NAME = "resumify_ext";
