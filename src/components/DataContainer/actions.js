// DataContainer/actions.js
// Action types and creators for DataContainer
import { actionTypesFromStrings, mergeActionTypes } from '../../helpers';

export const byIdActionTypes = actionTypesFromStrings([
    'DATA_CONTAINER_SELECT_ROW',
])

export const broadcastActionTypes = actionTypesFromStrings([
    'DATA_CONTAINER_UPDATE_DATA',
])

export const actionTypes = mergeActionTypes(byIdActionTypes, broadcastActionTypes);

export function withDataActions(otherTypes) {
    return mergeActionTypes(actionTypes, otherTypes);
}

// Simple action creators: these emit actions that do not call the
// backend and only serve to update the UI
export function registerDataContainer(id, source) {
    return { type: actionTypes.DATA_CONTAINER_NEW_CONTAINER, id, source };
}
    
export function updateDataFrom(source, data) {
    return { type: actionTypes.DATA_CONTAINER_UPDATE_DATA, source, data };
}
// todo: do we also want a updateDataIn(id, data) ?
// this would be a complementary way of telling a data container to
// update when we know where it should go, but not which source the
// container is "listening" to

// TODO: we should provide basic selection functionality here
// export function selectDataRow(id, row) {
//     return { type: actionTypes.DATA_CONTAINER_SELECT_ROW, id, row };
// }





