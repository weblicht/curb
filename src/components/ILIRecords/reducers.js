import { iliActions } from './actions';
import { makeSimpleApiReducer } from '../APIWrapper';

const iliActionTypes = iliActions.actionTypes;
const iliRecs = makeSimpleApiReducer(iliActionTypes, ["byLexUnitId"], "lexUnitId");

export { iliRecs };
