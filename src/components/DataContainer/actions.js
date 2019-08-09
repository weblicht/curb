// DataContainer/actions.js
// Action types and creators for DataContainer
import { actionTypesFromStrings } from '../../helpers';

export const actionTypes = actionTypesFromStrings([
    'DATA_CONTAINER_CHOOSE', // i.e., uniquely
    'DATA_CONTAINER_UNCHOOSE',
    'DATA_CONTAINER_SELECT', // i.e., possibly multiple selections
    'DATA_CONTAINER_UNSELECT',
])

// Makes action creators for a given data container.
// params:
//   containerId, a unique identifier for the container
export function makeActionsForContainer(containerId) {

    function choose(itemId) {
        return { type: actionTypes.DATA_CONTAINER_CHOOSE,
                 id: containerId,
                 itemId
               };
    }

    // an itemId is not really necessary for unchoosing, but we accept
    // it for the sake of uniformity:
    function unchoose(itemId) {
        return { type: actionTypes.DATA_CONTAINER_UNCHOOSE,
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
        unchoose,
        select,
        unselect
    }
}
