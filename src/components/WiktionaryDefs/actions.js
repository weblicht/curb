import { makeApiActions } from '../APIWrapper';
import { apiPath } from '../../constants';

const wiktEndpoints = { get: apiPath.wiktDefs };
export const wiktDefsActions = makeApiActions('WIKT_DEFS', wiktEndpoints);
