import { makeQueryActions } from '../APIWrapper';
import { apiPath } from '../../constants';

export const wiktDefsQueries = makeQueryActions('WIKT_DEFS', apiPath.wiktDefs);
