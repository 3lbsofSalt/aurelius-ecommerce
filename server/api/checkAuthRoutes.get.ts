import { getServerSession } from '#auth';
import User from '../models/User';
import safeAwait from 'safe-await';
import { useLogger } from '@nuxt/kit';
import { eventHandler } from '#imports';
import RoutePrivileges from '../models/RoutePrivileges';

export default eventHandler(async (event) => {
  const logger = useLogger();
  const session = await getServerSession(event);

  if(!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'You are unauthenticated'
    });
  }

  const [error, user] = await safeAwait(User.findOne({ email: session.user.email }, '-hash -activationToken -resetToken'));

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error finding the active user.'
    })
  }

  let priv = 'Basic';

  if(user?.permissionGroup) {
    priv = user.permissionGroup;
  }

  const [privError, routePrivs] = await safeAwait(RoutePrivileges.find({}));

  if(privError) {
    logger.error(privError);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an issue getting the route privileges.'
    });
  }

  const allowedRoutes = [];
  for(const route of routePrivs) {
    if(route.groups.includes(priv) || priv === 'Admin') {
      allowedRoutes.push(route.name);
    }
  }

  logger.log(allowedRoutes);
  return allowedRoutes;
});
