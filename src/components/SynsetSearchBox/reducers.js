// SynsetSearchBox/reducers.js
// State management for SynsetSearchBox state 

import { actionTypes } from './actions';
import { ValidationError } from '../../validation';

import SI from 'seamless-immutable';

// internal state for a particular search box:
const searchBoxPrivState = SI({
    ignoreCase: false,
    currentSearchTerm: '',
    mostRecentSearchTerm: '',
    synsets: [], // TODO: these represent results; but are there any other kinds of results?
    error: ''
})
export { searchBoxPrivState as defaultSearchBoxState }; 

// manages private state for an individual search box
function privateReducer(state = searchBoxPrivState, action) {
    switch (action.type) {
    case actionTypes.SYNSET_SEARCH_TOGGLE_CASE: {
        return state.merge({ ignoreCase: !state.ignoreCase });
    }
    case actionTypes.SYNSET_SEARCH_UPDATE_SEARCH_TERM: {
        return state.merge({ currentSearchTerm: action.searchTerm });
    }
    case actionTypes.SYNSET_SEARCH_UPDATE_ERROR: {
        return state.merge({ error: action.error });
    }
    case actionTypes.SYNSET_SEARCH_RESULTS_RETURNED: {
        return state.merge({
            synsets: action.data.synsets,
            error: action.data.length === 0 ? 'No synsets found.' : ''
        })
    }
    default:
        return state;
    }
}

// overall search boxes state is managed by publicReducer; it may include
// state for multiple search boxes:
const defaultSearchBoxesState = SI({});

function publicReducer(state = defaultSearchBoxesState, action) {
    const componentId = action.id;

    switch (action.type) {
    // initialize a part of the store for a new search box during
    // component construction; it's necessary to do this by handling
    // an action because we won't know component IDs until they are
    // created by some consuming application. This also enables the
    // consuming application to dynamically add search boxes if
    // necessary.
    case actionTypes.SYNSET_SEARCH_NEW_SEARCH_BOX: {
        return SI.setIn(state, ['byId', componentId],
                        searchBoxPrivState);
    }
    // any other SYNSET_SEARCH actions are handled by the privateReducer:
    default: {
        if (action.type.startsWith("SYNSET_SEARCH")) {
            const oldPrivState = state.byId[componentId];
            return SI.setIn(state, ['byId', componentId],
                            privateReducer(oldPrivState, action));
        } else {
            return state;
        }
        
    }

    }
}
export { publicReducer as synsetSearchBoxes };        

