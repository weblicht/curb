import { makeApiActions, actionTypesFromStrings } from '../../helpers';
import { apiPath } from '../../constants';

const iliEndpoints = { get: apiPath.displayilirecords };
export const iliActions = makeApiActions('ILI_DEFS', iliEndpoints);
