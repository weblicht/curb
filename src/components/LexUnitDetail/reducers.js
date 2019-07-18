import { lexUnitsActions, iliActions, examplesActions } from './actions';
import { wiktDefs } from '../WiktionaryDefs/reducers';
import { iliDefs } from '../ILIDefs/reducers';
import { lexExamples } from '../LexExamples/reducers';
import { makeSimpleApiReducer } from '../../helpers';
import { combineReducers } from 'redux';
import SI from 'seamless-immutable';

// TODO: this is somewhat badly shaped. Ideally we would request
// lexunit details by their ID, and could use makeByIdReducer to add
// them to the store; but there is currently no endpoint for
// requesting lexunits by ID, and only an endpoint for requesting
// multiple lexunits by synset id.
const lexUnitsActionTypes = lexUnitsActions.actionTypes;
const lexUnits = makeSimpleApiReducer(lexUnitsActionTypes, ["bySynsetId"], "synsetId");
        
const dataReducer = combineReducers({
    wiktDefs,
    iliDefs,
    lexExamples,
    lexUnits
})

export { dataReducer as data };
