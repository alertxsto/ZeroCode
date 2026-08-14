// NOTE: This module must NEVER be imported from client code.
// The Neon connection string is a server-side secret.
// All database access from the browser goes through /api/* serverless functions.
// See src/lib/apiClient.js for the client-facing API.
