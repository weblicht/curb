import { makeApiActions } from '../APIWrapper';
import { apiPath } from '../../constants';

const conRelsEndpoints = { get: apiPath.conRels }
export const conRelsActions = makeApiActions('CON_RELS', conRelsEndpoints);

