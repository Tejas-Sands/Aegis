import { createRouter, authedQuery } from "./middleware";
import { getAllUsers } from "./_queries/users";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),
  list: authedQuery.query(async () => {
    return await getAllUsers();
  }),
});
