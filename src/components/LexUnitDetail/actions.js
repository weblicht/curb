import { makeApiActions, actionTypesFromStrings } from '../../helpers';
import { apiPath } from '../../constants';
import { updateDataFrom } from '../DataContainer/actions';

import axios from 'axios';

// export const wiktActions = actionTypesFromStrings([
//     'WIKT_DEFS_REQUESTED',
//     'WIKT_DEFS_RETURNED',
//     'WIKT_DEFS_ERROR',
// ])

// export function submitWiktDefs(lexUnitId) {
//     return { type: wiktActions.WIKT_DEFS_REQUESTED, lexUnitId };
// }
// export function receiveWiktDefs(lexUnitId, defs) {
//     return { type: wiktActions.WIKT_DEFS_RETURNED, lexUnitId, defs }
// }
// export function wiktDefsError(lexUnitId, message) {
//     return { type: wiktActions.WIKT_DEFS_ERROR, lexUnitId, defs }
// }

// export function fetchWiktDefs(lexUnitId) {
//     return function (dispatch, getState) {

//         const params = { lexUnitId };
//         dispatch(submitWiktDefs(lexUnitId, params));
//         return axios
//         .get(apiPath.displaywikirecords, params) // TODO: why isn't GET allowed by backend?
//             .then(response => dispatch(receiveWiktDefs(lexUnitId, response.data.wikiRecords)), 
//                   error => dispatch(wiktDefsError(id,
//                   // TODO: more generalized error handling? logging?
//                   `Failed to retrieve wiktionary definitions for LexUnit "${lexUnitId}".`)) 
//              );
//     };
// }


const wiktEndpoints = { get: apiPath.displaywikirecords };
export const wiktDefsActions = makeApiActions('WIKT_DEFS', wiktEndpoints);

const iliEndpoints = { get: apiPath.displayilirecords }
export const iliActions = makeApiActions('ILI_DEFS', iliEndpoints);

const examplesEndpoints = { get: apiPath.displayexamples }
export const examplesActions = makeApiActions('LEX_EXAMPLES', examplesEndpoints);

const lexUnitsEndpoints = { get: apiPath.displaylexunits }
export const lexUnitsActions = makeApiActions('LEX_UNITS', lexUnitsEndpoints);



