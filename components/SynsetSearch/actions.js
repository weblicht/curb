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

// SynsetSearch/actions.js
// Action types and creators for synset searches
import { actionTypesFromStrings } from '../../helpers';
import { apiPath } from '../../constants';

import axios from 'axios';

// these are all per-id actions:
export const actionTypes = actionTypesFromStrings([
    'SYNSET_SEARCH_UPDATE_SEARCH_PARAMS',
    'SYNSET_SEARCH_CLEAR_SEARCH_PARAMS',
    'SYNSET_SEARCH_TOGGLE_CATEGORY',
    'SYNSET_SEARCH_TOGGLE_REGEX_SUPPORT',
    'SYNSET_SEARCH_UPDATE_ERROR',
    'SYNSET_SEARCH_SUBMITTED',
    'SYNSET_SEARCH_RESULTS_RETURNED',
    'SYNSET_SEARCH_RELOAD_HISTORY',
    'SYNSET_SEARCH_CLEAR_HISTORY',
])

export function clearSearchParams(id) {
    return { type: actionTypes.SYNSET_SEARCH_CLEAR_SEARCH_PARAMS, id };
}

export function updateSearchParams(id, params) {
    return { type: actionTypes.SYNSET_SEARCH_UPDATE_SEARCH_PARAMS, id, params };
}

export function toggleRegexSupport(id) {
    return { type: actionTypes.SYNSET_SEARCH_TOGGLE_REGEX_SUPPORT, id };
}

export function toggleCategory(id, category) {
    return { type: actionTypes.SYNSET_SEARCH_TOGGLE_CATEGORY, id, category };
}

export function updateError(id, error) {
    return { type: actionTypes.SYNSET_SEARCH_UPDATE_ERROR, id, error };
}

export function submitSearch(id, params, keepState) {
    return { type: actionTypes.SYNSET_SEARCH_SUBMITTED, id, params, keepState };
}

export function receiveResults(id, data, params) {
    return { type: actionTypes.SYNSET_SEARCH_RESULTS_RETURNED, id, data, params };
}

export function reloadHistory(id) {
    var history = [];
    try {
        const rawHistory = JSON.parse(localStorage.getItem(id + '.searchHistory')) || [];
        // minimal check to make sure we get usable data from localStorage:
        history = rawHistory.filter(obj => obj.hasOwnProperty('params')
                                           && obj.hasOwnProperty('numResults'))
    } catch (e) {
        // no-op; just send the empty array to the store
    }

    return { type: actionTypes.SYNSET_SEARCH_RELOAD_HISTORY, id, history };
}

export function clearHistory(id, removePersisted) {
    if (removePersisted) {
        localStorage.removeItem(id + '.searchHistory');
    }
    return { type: actionTypes.SYNSET_SEARCH_CLEAR_HISTORY, id };

}
    

// Async action creator that queries the /synsets endpoint with the
// query parameters from the advanced search form and dispatches the
// results.
// 
// params:
//   id: the ID of the search box for which this search should be recorded.
//   params: Object representing the search query; usually the form
//     data submitted by a SynsetSearchForm. It must contain a string
//     value for the 'word' property; all other properties are
//     optional. These include:
//       ignoreCase :: Boolean
//       regEx :: Boolean
//       editDistance :: String for Integer > 0 (invalid if regEx is true)
//     as well as any of the Boolean flags for word categories, word classes, and
//     orthographic variants which are submitted from the advanced search form. 
//     See SynsetSearchForm for all possible options.
//   keepState :: Boolean. If true, the search form state is preserved, instead
//     of being cleared, after a search successfuly returns results.
export function doAdvancedSearch(id, params, keepState) {

    return function (dispatch) {
        const config = { params: asSearchQueryParams(params) };
        dispatch(submitSearch(id, params, keepState));
        return axios.get(apiPath.synsets, config)
            .then(response => dispatch(receiveResults(id, response.data.data, params)),
                  // TODO: more generalized error handling? logging?
                  error => dispatch(updateError(id, `Failed to retrieve results for "${params.word}".`)) 
             );
    };
}

// This wrapper provides backward-compatible support for the signature
// of doSearch() up through version 1.2.5, where the only search
// option was a boolean flag for ignoring case. We can remove it in
// 2.0 and rename doAdvancedSearch to doSearch:
export function doSearch(id, word, ignoreCase) {
    return doAdvancedSearch(id, { word, ignoreCase }, false);
}

// Helper to prepare a query params object from the raw form data
// submitted by a SynsetSearchForm. Converts checkbox values to
// booleans and creates the comma-separated lists for wordCategories,
// wordClasses, etc. that are accepted as query parameters by the
// backend.
function asSearchQueryParams(formData) {
    const { word, ignoreCase, regEx, editDistance, ...checkboxes } = formData;

    var params = {
        word,
        ignoreCase: ignoreCase === "on",
        regEx: regEx === "on",
        editDistance
    };

    // Silently drop any editDistance value if regex support is on;
    // the UI already makes clear that this is not supported.
    if (params.regEx) {
        delete params.editDistance;
    }
    
    // convert other checkbox values to comma-separated lists for the backend:
    var wordCategories = [];
    var wordClasses = [];
    var orthFormVariants = [];
    Object.entries(checkboxes).forEach(
        ([name, state]) => {
            if (state !== "on") return;
            if (WORD_CATEGORY_VALUES.includes(name)) wordCategories.push(name);
            if (WORD_CLASS_VALUES.includes(name)) wordClasses.push(name);
            if (ORTH_VARIANT_VALUES.includes(name)) orthFormVariants.push(name);
        }
    );

    // avoid adding the keys to the params if the values are
    // empty, because the backend does not support empty values:
    if (wordCategories.length) params.wordCategories = wordCategories.join(',');
    if (wordClasses.length) params.wordClasses = wordClasses.join(',');
    if (orthFormVariants.length) params.orthFormVariants = orthFormVariants.join(',');

    return params;
}

// Constants needed by asSearchQueryParams and elsewhere:
export const WORD_CLASS_OPTIONS = [
    { label: 'Allgemein', value: 'Allgemein', nouns: false, verbs: true, adjectives: true },
    { label: 'Artefakt', value: 'Artefakt', nouns: true, verbs: false, adjectives: false },
    { label: 'Attribut', value: 'Attribut', nouns: true, verbs: false, adjectives: false },
    { label: 'Besitz', value: 'Besitz', nouns: true, verbs: true, adjectives: false },
    { label: 'Bewegung', value: 'Bewegung', nouns: false, verbs: false, adjectives: true },
    { label: 'Form', value: 'Form', nouns: true, verbs: false, adjectives: false },
    { label: 'Gefuehl', value: 'Gefuehl', nouns: true, verbs: true, adjectives: true },
    { label: 'Geist', value: 'Geist', nouns: false, verbs: false, adjectives: true },
    { label: 'Geschehen', value: 'Geschehen', nouns: true, verbs: false, adjectives: false },
    { label: 'Gesellschaft', value: 'Gesellschaft', nouns: false, verbs: true, adjectives: true },
    { label: 'Gruppe', value: 'Gruppe', nouns: true, verbs: false, adjectives: false },
    { label: 'Koerper', value: 'Koerper', nouns: true, verbs: false, adjectives: true },
    { label: 'Koerperfunktion', value: 'Koerperfunktion', nouns: false, verbs: true, adjectives: false },
    { label: 'Kognition', value: 'Kognition', nouns: true, verbs: true, adjectives: false },
    { label: 'Kommunikation', value: 'Kommunikation', nouns: true, verbs: true, adjectives: false },
    { label: 'Konkurrenz', value: 'Konkurrenz', nouns: false, verbs: true, adjectives: false },
    { label: 'Kontakt', value: 'Kontakt', nouns: false, verbs: true, adjectives: false },
    { label: 'Lokation', value: 'Lokation', nouns: false, verbs: true, adjectives: false },
    { label: 'Menge', value: 'Menge', nouns: true, verbs: false, adjectives: true },
    { label: 'Mensch', value: 'Mensch', nouns: true, verbs: false, adjectives: false },
    { label: 'Motiv', value: 'Motiv', nouns: true, verbs: false, adjectives: false },
    { label: 'Nahrung', value: 'Nahrung', nouns: true, verbs: false, adjectives: false },
    { label: 'natGegenstand', value: 'natGegenstand', nouns: true, verbs: false, adjectives: false },
    { label: 'natPhaenomen', value: 'natPhaenomen', nouns: true, verbs: true, adjectives: true },
    { label: 'Ort', value: 'Ort', nouns: true, verbs: false, adjectives: true },
    { label: 'Pertonym', value: 'Pertonym', nouns: false, verbs: false, adjectives: true },
    { label: 'Perzeption', value: 'Perzeption', nouns: false, verbs: true, adjectives: true },
    { label: 'Pflanze', value: 'Pflanze', nouns: true, verbs: false, adjectives: false },
    { label: 'privativ', value: 'privativ', nouns: false, verbs: false, adjectives: true },
    { label: 'Relation', value: 'Relation', nouns: true, verbs: false, adjectives: true },
    { label: 'Schoepfung', value: 'Schoepfung', nouns: false, verbs: true, adjectives: false },
    { label: 'Substanz', value: 'Substanz', nouns: true, verbs: false, adjectives: true },
    { label: 'Tier', value: 'Tier', nouns: true, verbs: false, adjectives: false },
    { label: 'Tops', value: 'Tops', nouns: true, verbs: false, adjectives: false },
    { label: 'Veraenderung', value: 'Veraenderung', nouns: false, verbs: true, adjectives: false },
    { label: 'Verbrauch', value: 'Verbrauch', nouns: false, verbs: true, adjectives: false },
    { label: 'Verhalten', value: 'Verhalten', nouns: false, verbs: false, adjectives: true },
    { label: 'Zeit', value: 'Zeit', nouns: true, verbs: false, adjectives: true },
];

// these values are coded as field names in the form 
export const WORD_CLASS_VALUES = WORD_CLASS_OPTIONS.map(wc => wc.value);
export const WORD_CATEGORY_VALUES = [
    'adj',
    'nomen',
    'verben'
];
export const ORTH_VARIANT_VALUES = [
      'orthForm',
      'orthVar',
      'oldOrthForm',
      'oldOrthVar'
];
