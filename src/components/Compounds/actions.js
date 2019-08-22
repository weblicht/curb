import { makeQueryActions } from '../APIWrapper';
import { apiPath } from '../../constants';

export const compoundsQueries = makeQueryActions('COMPOUNDS', apiPath.compounds);

