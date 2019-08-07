// DataContainer/actions.js
// Action types and creators for DataContainer
import { actionTypesFromStrings } from '../../helpers';

export const actionTypes = actionTypesFromStrings([
    'DATA_CONTAINER_CHOOSE_UNIQUELY',
    'DATA_CONTAINER_SELECT',
    'DATA_CONTAINER_UNSELECT',
])

// Makes action creators for a given data container.
// params:
//   containerId, a unique identifier for the container
export function makeActionsForContainer(containerId) {

    function choose(itemId) {
        return { type: actionTypes.DATA_CONTAINER_CHOOSE_UNIQUELY,
                 id: containerId,
                 itemId
               };
    }

    function select(itemId) {
        return { type: actionTypes.DATA_CONTAINER_SELECT,
                 id: containerId,
                 itemId
               };
    }

    function unselect(itemId) {
        return { type: actionTypes.DATA_CONTAINER_UNSELECT,
                 id: containerId,
                 itemId
               };
    }
    
    return {
        choose,
        select,
        unselect
    }
}
