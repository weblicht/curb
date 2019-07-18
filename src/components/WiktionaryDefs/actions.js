import { makeApiActions, actionTypesFromStrings } from '../../helpers';
import { apiPath } from '../../constants';

const wiktEndpoints = { get: apiPath.displaywikirecords };
export const wiktDefsActions = makeApiActions('WIKT_DEFS', wiktEndpoints);
