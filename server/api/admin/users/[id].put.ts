import safeAwait from "safe-await";
import Users from '../../../models/User';
import { useLogger } from '@nuxt/kit';
import { hasRouteAccess } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const hasAccess = await hasRouteAccess(event, 'Users');
  if(!hasAccess) {
    return setResponseStatus(event, 401);
  };

  const id = getRouterParam(event, 'id');

  const logger = useLogger();
  const body = await readBody(event);
  const {
    name,
    email,
    phone,
    permissionGroup
  } = body;

  const [error] = await safeAwait(Users.updateOne(
    { _id: id }, 
    { name, email, phone, permissionGroup }
  ));

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error updating the user!'
    })
  }
});
