import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  console.error('EXPO_PUBLIC_RORK_API_BASE_URL not found in environment variables');
  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;

try {
  const baseUrl = getBaseUrl();
  console.log('Creating tRPC client with base URL:', baseUrl);
  
  trpcClient = createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: `${baseUrl}/api/trpc`,
        transformer: superjson,
        headers: () => {
          return {
            'Content-Type': 'application/json',
          };
        },
      }),
    ],
  });
  
  console.log('tRPC client created successfully');
} catch (error) {
  console.error('Failed to create tRPC client:', error);
  // Create a fallback client to prevent crashes
  trpcClient = createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: 'http://localhost:3000/api/trpc',
        transformer: superjson,
        headers: () => {
          return {
            'Content-Type': 'application/json',
          };
        },
      }),
    ],
  });
}

export { trpcClient };