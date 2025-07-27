import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const hiRoute = publicProcedure
  .input(z.object({ name: z.string() }))
  .mutation(({ input }: { input: { name: string } }) => {
    return {
      hello: input.name,
      date: new Date(),
    };
  });

export default hiRoute;