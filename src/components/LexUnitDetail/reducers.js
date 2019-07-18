import { lexUnitsActions, iliActions, examplesActions } from './actions';
import { wiktDefs } from '../WiktionaryDefs/reducers';
import { makeSimpleApiReducer } from '../../helpers';
import { combineReducers } from 'redux';
import SI from 'seamless-immutable';

const iliActionTypes = iliActions.actionTypes;
const iliDefs = makeSimpleApiReducer(iliActionTypes, ["byLexUnitId"], "lexUnitId");

const examplesActionTypes = examplesActions.actionTypes;
function lexExamples(state = SI({}), action) {
    switch (action.type) {
    case examplesActionTypes.LEX_EXAMPLES_RETURNED: {
        const lexUnitId = action.params.lexUnitId;
        // reshape the data to store the frame id in the examples so
        // we don't need a separate slice of the store for frames.
        // TODO: can the backend do this for us instead?
        const frameData = action.data.frames;
        const examplesData = action.data.examples.map(
            (e, idx) => SI(e).merge({ frameId: frameData[idx].frameId})
        );
        return SI.setIn(state, ["byLexUnitId", lexUnitId],
                        examplesData);
    }
    default:
        return state;
    }
}

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
