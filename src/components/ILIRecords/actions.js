import { makeApiActions, actionTypesFromStrings } from '../APIWrapper';
import { apiPath } from '../../constants';

const iliEndpoints = { get: apiPath.iliRecords };
export const iliActions = makeApiActions('ILI_RECORDS', iliEndpoints);
