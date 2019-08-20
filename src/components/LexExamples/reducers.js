import { examplesQueries } from './actions';
import { makeSimpleApiReducer } from '../APIWrapper';

const queryActionTypes = examplesQueries.actionTypes;
export const lexExamples = makeSimpleApiReducer(queryActionTypes, ["byLexUnitId"], "lexUnitId");
