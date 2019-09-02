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

    const rootSynsetId = props.queryParams.synsetId;

    // IDs that the user has selected but we don't yet have data for:
    var toFetch = [];
    
    // for a given synsetId and list of orth forms, return a node in
    // the tree representing that synset
    function nodeFor(synsetId, orthForms) {
        var children = [];
        // create nodes for children which have been selected by the user.
        // Always include children for the root node.
        if (synsetId === rootSynsetId || props.selectedItemIds.includes(synsetId)) {
            const hyponyms = hyponymsFor(synsetId);
            children = hyponyms.map(cr => nodeFor(cr.relatedSynsetId, cr.allOrthForms));
        }
            
        return ({
            id: synsetId,
            name: synsetId + ': ' + orthForms.join(', '), //TODO
            children
        })

    }

    // for a given synsetId, returns conrels where this is the
    // *originating* synset ID; each of these conrels represents a
    // child node, with ID given by the *related* synset ID
    function hyponymsFor(synsetId) {
        try {
            const conRels = globalState.apiData.conRels.bySynsetId[synsetId] || [];        
            return conRels.filter(cr => cr.conRelType === 'has_hyponym');

        } catch (e) {

            if (!toFetch.includes(synsetId)) {
                toFetch.push(synsetId);
            }
            
            return [];
        }
    }

    // construct and return the tree from the root node
    try {

        // TODO: how can we get the orthforms to generate a name for
        // the root synset node?  these are not included in the
        // conrels data
        var rootNode = nodeFor(rootSynsetId, []);

        // Pass on the list of data to fetch so we can request the
        // data at a safe point in the component's lifecycle.  (We
        // can't do it here, because the selector may run several
        // times before the component actually mounts.)
        rootNode.toFetch = toFetch;

        return rootNode;
    }
    catch (e) {
        // we don't have any conrel data whatsoever for this synset
        // yet, so we can't return a root node:
        return undefined; 
    }  

}
