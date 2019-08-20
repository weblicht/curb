import { makeQueryActions } from '../APIWrapper';
import { apiPath } from '../../constants';

export const lexRelsQueries = makeQueryActions('LEX_RELS', apiPath.lexRels);

