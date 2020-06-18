export function selectHnymPathsState(globalState, props) {
    const dfault = { fetching: undefined, data: undefined, error: undefined };
    try {
        const pathId = `from${props.fromSynsetId}to${props.toSynsetId}`;
        const selected = globalState.apiData.hnymPaths.byId[pathId] || dfault;
        return selected;
    } catch (e) {
        return dfault;
    }
}

