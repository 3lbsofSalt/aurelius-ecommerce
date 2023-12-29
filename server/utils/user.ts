import { getServerSession } from "#auth";
import safeAwait from "safe-await";
import type { UserI } from "~/server/models/User";
import User from "~/server/models/User";

export const getCurrentUser = async (event : any) : Promise<UserI | undefined> => {
  const session = await getServerSession(event);

  if(!session) {
    return undefined;
  }

  const [error, user] = await safeAwait(User.findOne({ email: session.user.email }, '-hash -activationToken -resetToken'));

  if(error) {
    return undefined
  }

  return user || undefined;
}
