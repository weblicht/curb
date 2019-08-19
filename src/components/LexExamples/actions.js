import { makeApiActions } from '../APIWrapper';
import { apiPath } from '../../constants';

const examplesEndpoints = { get: apiPath.examples }
export const examplesActions = makeApiActions('LEX_EXAMPLES', examplesEndpoints);

