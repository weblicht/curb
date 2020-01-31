export function selectHnymPaths(globalState, props) {
    try {
        const pathId = `from${props.queryParams.fromSynsetId}to${props.queryParams.toSynsetId}`;
        const selected = globalState.apiData.hnymPaths.byId[pathId] || [];
        return selected;
    } catch (e) {
        return undefined;
    }
}
