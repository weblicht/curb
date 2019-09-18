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

        // This is a best-faith effort to find a synset object
        // corresponding to the given ID, so that we can display a
        // label for the root node.  There's no guarantee that it will
        // find anything, though, because there need not have been
        // any previous search which returned a result with a synset
        // with the given ID.

        // TODO: fetch this synset if we don't yet have (synset) data
        // for it.  Also, there really should be a better place in the
        // Redux store for synset objects than inside the state for a search
        // box.  
        var rootOrthForms = [];
        for (var searchBoxState of Object.values(globalState.synsetSearchBoxes.byId)) {
            var rootSynset = searchBoxState.synsets.find(synset => synset.id === rootSynsetId);
            if (rootSynset) {
                rootOrthForms = rootSynset.orthForms;
                break;
            }
        }

        const rootNode = nodeFor(rootSynsetId, rootOrthForms);

        return rootNode;
    }
    catch (e) {
        // we don't have any conrel data whatsoever for this synset
        // yet, so we can't return a root node:
        return undefined; 
    }  

}

export function selectHyponymsTree(globalState, props) {
    return selectConRelsTree(globalState, props, 'has_hyponym');
}

export function selectHypernymsTree(globalState, props) {
    return selectConRelsTree(globalState, props, 'has_hypernym');
}

export function selectHnymsTrees(globalState, props) {
    const hypernyms = selectHypernymsTree(globalState, props); 
    const hyponyms = selectHyponymsTree(globalState, props); 
    const children = [hypernyms, hyponyms];
    return {
        id: 'DUMMY_ROOT',
        name: 'DUMMY_ROOT',
        children
    };
}
