// Copyright 2020 Richard Lawrence
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
    // params represents current search parameters, which are used to
    // populate the default values in the search form. These values
    // are restored from history items, so that when a previous search
    // is re-run, the search form will reflect the parameters set at
    // the time. We also manage the state of the regex and word category
    // checkboxes here; they need to be controlled components *and*
    // their state needs to be re-populated from history via props, so
    // they have to be managed in Redux rather than in local component
    // state.
    params: {
        word: undefined,
        ignoreCase: false,
        regEx: false,
        adjectives: false,
        nouns: false,
        verbs: false
    },
    // parameters for previous searches:
    history: [], 
    // results returned by backend:
    synsets: [], 
    // message for user:
    alert: undefined, 
    // Bootstrap class for alert message: 'info', 'warning', 'success', etc.
    alertClass: undefined, 
    error: undefined
})
export { searchFormInnerState as defaultSearchFormState }; 

// manages private state for an individual search box
function searchFormInnerReducer(state = searchFormInnerState, action) {
    switch (action.type) {
    case actionTypes.SYNSET_SEARCH_TOGGLE_REGEX_SUPPORT: {
        const params = state.params.merge({
            regEx: !state.params.regEx
        });

        return state.merge({ params });
    }
    case actionTypes.SYNSET_SEARCH_TOGGLE_CATEGORY: {
        const params = state.params.merge({
            [action.category]: !state.params[action.category]
        });

        return state.merge({ params });
    }
    case actionTypes.SYNSET_SEARCH_CLEAR_SEARCH_PARAMS: {
        return state.merge({ params: searchFormInnerState.params });
    }
    case actionTypes.SYNSET_SEARCH_UPDATE_SEARCH_PARAMS: {
        return state.merge({ params: action.params });
    }
    case actionTypes.SYNSET_SEARCH_UPDATE_ERROR: {
        return state.merge({ error: action.error });
    }
    case actionTypes.SYNSET_SEARCH_SUBMITTED: {
        return state.merge({
            params: searchFormInnerState.params,
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
            params: action.params,
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

       
 
