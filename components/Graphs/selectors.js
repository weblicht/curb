export function selectHnymPathsState(globalState, props) {
    try {
        const pathId = `from${props.fromSynsetId}to${props.toSynsetId}`;
        const selected = globalState.apiData.hnymPaths.byId[pathId] || [];
        return selected;
    } catch (e) {
        return { fetching: undefined, data: undefined, error: undefined };
    }
}

