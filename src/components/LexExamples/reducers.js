import { examplesActions } from './actions';
import { makeSimpleApiReducer } from '../APIWrapper';

const examplesActionTypes = examplesActions.actionTypes;
export const lexExamples = makeSimpleApiReducer(examplesActionTypes, ["byLexUnitId"], "lexUnitId");
