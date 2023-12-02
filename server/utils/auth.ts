import { getServerSession } from '#auth';
import safeAwait from "safe-await";
import RoutePrivileges from "../models/RoutePrivileges";
import { logger } from '@nuxt/kit';
import User from '../models/User';

export const hasRouteAccess = async (event: any, route: string) : Promise<boolean> => {
  const session = await getServerSession(event);

  const [userError, user] = await safeAwait(User.findOne({ email: session?.user?.email }));
  if(userError || !user) {
    logger.error(userError);
    return false;
  }

  if(user.permissionGroup === 'Admin') {
    return true;
  }

  const [error, routePriv] = await safeAwait(RoutePrivileges.findOne({name: route}));

  if(error || !routePriv) {
    logger.error(error);
    return false;
  }

  if(routePriv.groups.includes(user.permissionGroup)) {
    return true;
  }

  return false;
}
