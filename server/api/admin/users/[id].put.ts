import safeAwait from "safe-await";
import Users from '../../../models/User';
import { useLogger } from '@nuxt/kit';
import { hasRouteAccess } from "~/server/utils/auth";
import Privileges from "~/server/models/Privileges";
import { isEmail, isPhoneNumber } from "~/utils/validationFunctions";

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

  const [groupError, privilegeGroups] = await safeAwait(Privileges.find({}));
  if(groupError) {
    logger.error("There was an error getting the groups for validation purposes.");
    throw createError({
      statusCode: 500,
      statusMessage: 'There was a server error.'
    });
  }

  if(
    !isAlphanumeric(name) || 
      !email || 
      !isEmail(email) || 
      !isPhoneNumber(phone) || 
      !permissionGroup ||
      (!privilegeGroups.find(g => permissionGroup === g.group) && 
        permissionGroup !== 'Admin' && permissionGroup !== 'Basic'
      )
  ) {
    logger.error("The request body was poorly formed to update the user");
    throw createError({
      statusCode: 422,
      statusMessage: 'The request body was poorly formed'
    });
  }

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
