export function selectD3Data(globalState, props) {
    try {
        // initially, the synset id for the root of the graph is given
        // as a prop.  After data container actions, the root of the
        // graph can change.
        // We need a mutable copy of the data to pass to D3.
        const rootSynsetId = props.chosenItemId || props.synsetId;
        const selected = Array.of(globalState.apiData.graphs
                                  .bySynsetId[rootSynsetId]
                                  .d3Data.asMutable({deep: true}));
        return selected;
    } catch (e) {
        // if one of the properties in the middle is not defined yet,
        // it raises a TypeError; this indicates the data is not yet
        // in the store, and we should return undefined
        return undefined;
    }

}
 
