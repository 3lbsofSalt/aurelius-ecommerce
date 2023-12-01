import safeAwait from "safe-await";
import RoutePrivileges from '../../../models/RoutePrivileges';
import { useLogger } from '@nuxt/kit';
import { hasRouteAccess } from "~/server/utils/auth";
import { isAlphanumeric } from "~/utils/validationFunctions";
import Privileges from "~/server/models/Privileges";

interface data {
  name: string,
  groups: string[]
}

export default defineEventHandler(async (event) => {
  const hasAccess = await hasRouteAccess(event, 'Privileges');
  if(!hasAccess) {
    return setResponseStatus(event, 401);
  };

  const logger = useLogger();
  const body = await readBody(event);
  const {
    name,
    groups 
  } : data = body;

  // Validation
  // No need to validate the name besides a classic alphanumeric because if the name
  // is wrong it won't change anything.
  logger.log(name);
  logger.log(groups);

  const [groupError, privilegeGroups] = await safeAwait(Privileges.find({}));
  if(groupError) {
    logger.error("There was an error getting the groups for validation purposes.");
    throw createError({
      statusCode: 500,
      statusMessage: 'There was a server error.'
    });
  }

  if(!isAlphanumeric(name) || !groups.every((group) => privilegeGroups.find((privGroup) => privGroup.group === group))) {
    logger.error("The request body was poorly formed to update the privilege groups.");
    throw createError({
      statusCode: 422,
      statusMessage: 'The request body was poorly formed.'
    });
  }


  const [error] = await safeAwait(RoutePrivileges.updateOne({ name }, { groups }));

  if(error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error getting the privileges!'
    })
  }
});
