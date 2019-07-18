import { wiktDefsActions } from './actions';
import { makeSimpleApiReducer } from '../../helpers';

const wiktDefsActionTypes = wiktDefsActions.actionTypes;
const wiktDefs = makeSimpleApiReducer(wiktDefsActionTypes, ["byLexUnitId"], "lexUnitId");
 
export { wiktDefs };
