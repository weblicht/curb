import SI from 'seamless-immutable';

// TODO: there is much shameless duplication here.
// Abstract this to a selectAt function
// function selectAt(statePath, key, empty = []) {
//     return function selector(globalState, props) {
//         try {
//             // walk down the statePath one property at a time until 
//             const selected = statePath.reduce(
//                 (acc, cur) => acc[cur], globalState,
//                 globalState);

 
export function selectWiktDefs(globalState, props) {
    try {
        const selected = globalState.data.wiktDefs.byLexUnitId[props.fetchParams.lexUnitId] || [];
        return selected;
    } catch (e) {
        // if one of the properties in the middle is not defined yet,
        // it raises a TypeError; this indicates the data is not yet
        // in the store, and we should return undefined
        return undefined;
    }

}
export function selectExamples(globalState, props) {
    try {
        const selected = globalState.data.lexExamples.byLexUnitId[props.fetchParams.lexUnitId] || [];
        return selected;
    } catch (e) {
        // if one of the properties in the middle is not defined yet,
        // it raises a TypeError; this indicates the data is not yet
        // in the store, and we should return undefined
        return undefined;
    }

}
    
// TODO: this isn't in effect yet because we always look up lex units by synset ID, not by ID
// export function selectLexUnit(globalState, props) {
//     try {
//         const luId = props.fetchParams.id;
//         // this already returns undefined if the lexunit is not yet in the db:
//         const selected = globalState.data.lexUnits.byId[luId];
//         return selected;
//     } catch (e) {
//         return undefined;
//     }
// }

export function selectLexUnits(globalState, props) {
    try {
        const selected = globalState.data.lexUnits.bySynsetId[props.fetchParams.synsetId] || [];
        return selected;
    } catch (e) {
        return undefined;
    }
}
