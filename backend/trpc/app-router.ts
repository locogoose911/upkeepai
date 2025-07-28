import { createTRPCRouter } from "./create-context";
import { hiProcedure } from "./routes/example/hi/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiProcedure,
  }),
});

export default appRouter;
export type AppRouter = typeof appRouter;