import { makeQueryActions } from '../APIWrapper';
import { apiPath } from '../../constants';
import { updateDataFrom } from '../DataContainer/actions';

export const lexUnitsQueries = makeQueryActions('LEX_UNITS', apiPath.lexUnits);



