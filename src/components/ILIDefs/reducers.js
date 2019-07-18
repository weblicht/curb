import { iliActions } from './actions';
import { makeSimpleApiReducer } from '../../helpers';

const iliActionTypes = iliActions.actionTypes;
const iliDefs = makeSimpleApiReducer(iliActionTypes, ["byLexUnitId"], "lexUnitId");

export { iliDefs };
