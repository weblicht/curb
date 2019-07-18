import { makeApiActions, actionTypesFromStrings } from '../../helpers';
import { apiPath } from '../../constants';

const examplesEndpoints = { get: apiPath.displayexamples }
export const examplesActions = makeApiActions('LEX_EXAMPLES', examplesEndpoints);

