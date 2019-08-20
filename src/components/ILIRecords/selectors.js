export function selectIliRecs(globalState, props) {
    try {
        const selected = globalState.apiData.iliRecs.byLexUnitId[props.queryParams.lexUnitId] || [];
        return selected;
    } catch (e) {
        // if one of the properties in the middle is not defined yet,
        // it raises a TypeError; this indicates the data is not yet
        // in the store, and we should return undefined
        return undefined;
    }

}
