// SynsetsContainer/selectors.js
// Data selectors for SynsetsContainer state

export function synsets(id, globalState) {
    try {
        return globalState.synsetsContainers.byId[id].records || [];
    } catch (e) {
        // TypeError if one of the properties in the middle is not
        // defined yet
        return [];
    }

}
    
