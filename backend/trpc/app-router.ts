import { createTRPCRouter } from "./create-context";
import { hiProcedure } from "./routes/example/hi/route";

const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiProcedure,
  }),
});

export default appRouter;
export { appRouter };
export type AppRouter = typeof appRouter;