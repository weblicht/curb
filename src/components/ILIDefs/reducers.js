import { iliActions } from './actions';
import { makeSimpleApiReducer } from '../APIWrapper';

const iliActionTypes = iliActions.actionTypes;
const iliDefs = makeSimpleApiReducer(iliActionTypes, ["byLexUnitId"], "lexUnitId");

export { iliDefs };
