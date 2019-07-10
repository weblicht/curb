// SynsetSearchBox/reducers.js
// State management for SynsetSearchBox state 

import { actionTypes } from './actions';
import { makeByIdReducer } from '../../helpers';
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
function searchBoxPrivReducer(state = searchBoxPrivState, action) {
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
        // once a search is submitted, the current search term becomes
        // the most recent search term
        return state.merge({
            mostRecentSearchTerm: state.currentSearchTerm,
            currentSearchTerm: ''
        })
    }
    case actionTypes.SYNSET_SEARCH_RESULTS_RETURNED: {
        return state.merge({
            synsets: action.data.synsets, // TODO: do we really need a copy of these results here?
            error: action.data.length === 0 ? 'No synsets found.' : ''
        })
    }
    default:
        return state;
    }
}

// overall search boxes state is managed by byIdReducer; it handles
// state for multiple search boxes by their ids:
const defaultSearchBoxesState = SI({});
const byIdReducer = makeByIdReducer(searchBoxPrivReducer,
                                    actionTypes.SYNSET_SEARCH_NEW_SEARCH_BOX,
                                    actionTypes,
                                    defaultSearchBoxesState);

export { byIdReducer as synsetSearchBoxes };        

