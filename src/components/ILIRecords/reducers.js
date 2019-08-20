import { iliQueries } from './actions';
import { makeSimpleApiReducer } from '../APIWrapper';

const queryActionTypes = iliQueries.actionTypes;
const iliRecs = makeSimpleApiReducer(queryActionTypes, ["byLexUnitId"], "lexUnitId");

export { iliRecs };
