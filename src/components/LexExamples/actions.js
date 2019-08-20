import { makeQueryActions } from '../APIWrapper';
import { apiPath } from '../../constants';

export const examplesQueries = makeQueryActions('LEX_EXAMPLES', apiPath.examples);

