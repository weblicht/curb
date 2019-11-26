// Copyright 2019 Richard Lawrence
//
// This file is part of germanet-common.
//
// germanet-common is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// germanet-common is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with germanet-common.  If not, see <https://www.gnu.org/licenses/>.

import { actionTypes } from './actions';
import { makeByIdReducer } from '../../helpers';

import SI from 'seamless-immutable';

// internal state for a particular search box:
const searchFormInnerState = SI({
    ignoreCase: false,
    currentSearchTerm: '',
    history: [],
    synsets: [], 
    alert: undefined, // message for user
    alertClass: undefined, // 'info', 'warning', 'success', etc.: Bootstrap class for alert message
    error: undefined
})
export { searchFormInnerState as defaultSearchFormState }; 

// manages private state for an individual search box
function searchFormInnerReducer(state = searchFormInnerState, action) {
    switch (action.type) {
    // we have actions both to TOGGLE and SET ignore case because
    // TOGGLE is best suited to easily handling clicks on the
    // checkbox, but SET is best suited to updating the checkbox
    // explicitly with the value from a previous search
    case actionTypes.SYNSET_SEARCH_TOGGLE_IGNORE_CASE: {
        return state.merge({ ignoreCase: !state.ignoreCase });
    }
    case actionTypes.SYNSET_SEARCH_SET_IGNORE_CASE: {
        return state.merge({ ignoreCase: action.ignoreCase });
    }
    case actionTypes.SYNSET_SEARCH_UPDATE_SEARCH_TERM: {
        return state.merge({ currentSearchTerm: action.searchTerm });
    }
    case actionTypes.SYNSET_SEARCH_UPDATE_ERROR: {
        return state.merge({ error: action.error });
    }
    case actionTypes.SYNSET_SEARCH_SUBMITTED: {
        return state.merge({
            currentSearchTerm: '',
            synsets: [],
            alert: undefined,
            alertClass: undefined
        })
    }
    case actionTypes.SYNSET_SEARCH_RESULTS_RETURNED: {
        // to keep things simple, we only record a new history item
        // here, after a successful roundtrip from the server, instead
        // of when the search is submitted; otherwise, we'd need to
        // deal with updating a history item we've already partially
        // recorded, and with the possibility of network failures.
        const newHistoryItem = SI({
            word: action.params.word,
            ignoreCase: action.params.ignoreCase,
            numResults: action.data.length
        });

       return state.merge({
           synsets: action.data,
           history: [newHistoryItem].concat(state.history),
           alert: action.data.length === 0 ? `No synsets found for "${action.params.word}".` : undefined,
           alertClass: action.data.length === 0 ?  'warning' : undefined
        })
    }
    case actionTypes.SYNSET_SEARCH_RELOAD_HISTORY: {
        return state.merge({
            history: action.history
        });
    }
    default:
        return state;
    }
}

// manage overall search boxes, results, and history state by their ids:
const searchFormsById = makeByIdReducer(searchFormInnerReducer,
                                        actionTypes);

export { searchFormsById as synsetSearches };        

       
 
