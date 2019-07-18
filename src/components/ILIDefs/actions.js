import { makeApiActions, actionTypesFromStrings } from '../APIWrapper';
import { apiPath } from '../../constants';

const iliEndpoints = { get: apiPath.displayilirecords };
export const iliActions = makeApiActions('ILI_DEFS', iliEndpoints);
