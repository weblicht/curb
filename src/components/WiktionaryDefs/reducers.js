import { wiktDefsQueries } from './actions';
import { makeSimpleApiReducer } from '../APIWrapper';

const queryActionTypes = wiktDefsQueries.actionTypes;
const wiktDefs = makeSimpleApiReducer(queryActionTypes, ["byLexUnitId"], "lexUnitId");
 
export { wiktDefs };
