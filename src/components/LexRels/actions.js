import { makeApiActions } from '../APIWrapper';
import { apiPath } from '../../constants';

const lexRelsEndpoints = { get: apiPath.lexRels }
export const lexRelsActions = makeApiActions('LEX_RELS', lexRelsEndpoints);

