import { wiktDefsActions } from './actions';
import { makeSimpleApiReducer } from '../APIWrapper';

const wiktDefsActionTypes = wiktDefsActions.actionTypes;
const wiktDefs = makeSimpleApiReducer(wiktDefsActionTypes, ["byLexUnitId"], "lexUnitId");
 
export { wiktDefs };
