import { makeApiActions } from '../APIWrapper';
import { apiPath } from '../../constants';

const conRelsEndpoints = { get: apiPath.displayconrels }
export const conRelsActions = makeApiActions('CON_RELS', conRelsEndpoints);

