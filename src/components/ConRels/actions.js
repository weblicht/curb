import { makeQueryActions } from '../APIWrapper';
import { apiPath } from '../../constants';

export const conRelsQueries = makeQueryActions('CON_RELS', apiPath.conRels);

