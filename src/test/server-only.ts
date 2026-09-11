// Stand-in for the `server-only` marker package under vitest.
//
// The real module throws on import anywhere but a Next server bundle, which is
// its whole job. Tests import server components directly, so vitest.config.ts
// aliases the package here. Nothing is exported on purpose.
export {}
