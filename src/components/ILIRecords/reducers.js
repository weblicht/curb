import { iliQueries } from './actions';
import { makeSimpleApiReducer } from '../APIWrapper';

const queryActionTypes = iliQueries.actionTypes;
const iliRecs = makeSimpleApiReducer(queryActionTypes, "lexUnitId");

export { iliRecs };
