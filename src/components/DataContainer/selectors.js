export function selectContainerState(globalState, ownProps) {
    try {
        return globalState.dataContainers.byId[ownProps.id];
    } catch {
        return undefined;
    }
}
        
