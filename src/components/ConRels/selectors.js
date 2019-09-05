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
 
function selectConRelsTree(globalState, props, relation) {

    const rootSynsetId = props.queryParams.synsetId;

    // for a given synsetId and list of orth forms, return a node in
    // the tree representing that synset
    function nodeFor(synsetId, orthForms) {
        var children = [];
        // create nodes for children which have been selected by the user.
        // Always include children for the root node.
        if (synsetId === rootSynsetId || props.selectedItemIds.includes(synsetId)) {
            const relateds = relatedsFor(synsetId);
            children = relateds.map(cr => nodeFor(cr.relatedSynsetId, cr.allOrthForms));
        }
            
        return ({
            id: synsetId,
            name: synsetId + ': ' + orthForms.join(', '),
            children
        })

    }

    // for a given synsetId, returns conrels where this is the
    // *originating* synset ID; each of these conrels represents a
    // child node, with ID given by the *related* synset ID
    function relatedsFor(synsetId) {
        try {
            const conRels = globalState.apiData.conRels.bySynsetId[synsetId];
            if (Array.isArray(conRels)) {
                return conRels.filter(cr => cr.conRelType === relation);
            } 
            return [];
        } catch (e) {
            return [];
        }
    }

    // construct and return the tree from the root node
    try {

        // TODO: how can we get the orthforms to generate a name for
        // the root synset node?  these are not included in the
        // conrels data
        var rootNode = nodeFor(rootSynsetId, []);

        return rootNode;
    }
    catch (e) {
        // we don't have any conrel data whatsoever for this synset
        // yet, so we can't return a root node:
        return undefined; 
    }  

}

export function selectHyponymsTree (globalState, props) {
    return selectConRelsTree(globalState, props, 'has_hyponym');
}

export function selectHypernymsTree (globalState, props) {
    return selectConRelsTree(globalState, props, 'has_hypernym');
}
