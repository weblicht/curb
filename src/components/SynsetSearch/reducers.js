// SynsetSearchBox/reducers.js
// State management for SynsetSearchBox state 

import { actionTypes } from './actions';
import { makeByIdReducer } from '../../helpers';
import { ValidationError } from '../../validation';

import SI from 'seamless-immutable';

// internal state for a particular search box:
const searchBoxInnerState = SI({
    ignoreCase: false,
    currentSearchTerm: '',
    mostRecentSearchTerm: '',
    synsets: [], // TODO: these represent results; but are there any other kinds of results?
    error: ''
})
export { searchBoxInnerState as defaultSearchBoxState }; 

// manages private state for an individual search box
function searchBoxInnerReducer(state = searchBoxInnerState, action) {
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
    case actionTypes.SYNSET_SEARCH_SUBMITTED: {
        return state.merge({
            mostRecentSearchTerm: state.currentSearchTerm,
            currentSearchTerm: ''
        })
    }
    case actionTypes.SYNSET_SEARCH_RESULTS_RETURNED: {
        return state.merge({
            synsets: action.data,
            error: action.data.length === 0 ? 'No synsets found.' : ''
        })
    }
    default:
        return state;
    }
}

// manage overall search boxes, results, and history state by their ids:
const searchBoxesById = makeByIdReducer(searchBoxInnerReducer,
                                        actionTypes);

export { searchBoxesById as synsetSearchBoxes };        

