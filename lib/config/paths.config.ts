import { z } from 'zod';

// Canonical in-app route paths; consumed by navigation config and redirects.
const PathsSchema = z.object({
  app: z.object({
    home: z.string().min(1),
    app: z.string().min(1),
    profile: z.string().min(1),
  }),
});

const pathsConfig = PathsSchema.parse({
  app: {
    home: '/',
    app: '/app',
    profile: '/app/profile',
  },
} satisfies z.infer<typeof PathsSchema>);

export default pathsConfig;
