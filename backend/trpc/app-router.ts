import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";

const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
});

export { appRouter };
export type AppRouter = typeof appRouter;