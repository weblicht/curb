// TODO: this isn't in effect yet because we always look up lex units by synset ID, not by ID
// export function selectLexUnit(globalState, props) {
//     try {
//         const luId = props.fetchParams.id;
//         // this already returns undefined if the lexunit is not yet in the db:
//         const selected = globalState.apiData.lexUnits.byId[luId];
//         return selected;
//     } catch (e) {
//         return undefined;
//     }
// }

export function selectLexUnits(globalState, props) {
    try {
        const selected = globalState.apiData.lexUnits.bySynsetId[props.queryParams.synsetId] || [];
        return selected;
    } catch (e) {
        return undefined;
    }
}
