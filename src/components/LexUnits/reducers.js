import { lexUnitsQueries } from './actions';
import { makeSimpleApiReducer } from '../APIWrapper';

// TODO: this is somewhat badly shaped. Ideally we would request
// lexunit details by their ID, and could use makeByIdReducer to add
// them to the store; but there is currently no endpoint for
// requesting lexunits by ID, and only an endpoint for requesting
// multiple lexunits by synset id.
const queryActionTypes = lexUnitsQueries.actionTypes;
export const lexUnits = makeSimpleApiReducer(queryActionTypes, "synsetId");
        
