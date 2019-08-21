import { framesQueries } from './actions';
import { makeSimpleApiReducer } from '../APIWrapper';

const queryActionTypes = framesQueries.actionTypes;
export const frames = makeSimpleApiReducer(queryActionTypes, "lexUnitId");
