export function selectConRels(globalState, props) {
    try {
        const selected = globalState.apiData.conRels.bySynsetId[props.queryParams.synsetId] || [];
        return selected;
    } catch (e) {
        // if one of the properties in the middle is not defined yet,
        // it raises a TypeError; this indicates the data is not yet
        // in the store, and we should return undefined
        return undefined;
    }

}
 
export function selectHyponymsTree(globalState, props) {

    function labelFor(conRel) {
        return conRel.originatingSynsetId + ': ' + conRel.allOrthForms.join(', ');
    }
 
    function nodeFor(conRel) {
        // we interpret selection of a hyponym *relation* as a user
        // desire to see the hyponyms of the *related* synset. In this
        // way, the tree can also be grown further as the result of user
        // interaction.
        var children = [];
        if (conRel.selected) {
            children = hyponymsFor(conRel.relatedSynsetId).map(nodeFor);
        }

        return {
            id: conRel.originatingSynsetId,
            name: labelFor(conRel),
            children
        }
    }

    function hyponymsFor(synsetId) {
        try {
            const conRels = globalState.apiData.conRels.bySynsetId[synsetId] || [];        
            return conRels.filter(cr => cr.conRelType === 'has_hyponym');
        } catch (e) {
            // fetch data for hyponyms that the user has selected, but
            // we don't yet have in the store:
            props.query({ synsetId });
            return [];
        }
    }

    // construct and return the tree from the root node
    try {
        const rootSynsetId = props.queryParams.synsetId;
        const allRels = globalState.apiData.conRels.bySynsetId[rootSynsetId] || [];        
        const hyponyms = hyponymsFor(rootSynsetId);

        return {
            id: rootSynsetId,
            // give the root node a label, even if the root node has
            // no hyponyms:
            name: labelFor(allRels[0]),
            children: hyponyms.map(nodeFor)
        }
    }
    catch (e) {
        // we don't have any conrel data whatsoever for this synset
        // yet, so we can't return a root node:
        return undefined; 
    }  

}
