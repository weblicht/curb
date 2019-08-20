import { makeQueryActions, actionTypesFromStrings } from '../APIWrapper';
import { apiPath } from '../../constants';

export const iliQueries = makeQueryActions('ILI_RECORDS', apiPath.iliRecords);
