import { actionTypes } from './actions';

import SI from 'seamless-immutable';

function dataToD3(data) {

    function labelFor(synset) {
        return synset.id + ': ' + synset.orthForms.join(', ');
    }
    
    function walkHypernyms(synset) {
        if (synset.hypernyms && synset.hypernyms.length === 0) {
            return {
                id: synset.id,
                name: labelFor(synset),
                children: []
            }
        } else {
            return {
                id: synset.id,
                name: labelFor(synset),
                children: synset.hypernyms.map(walkHypernyms) 
            }
        }
    }
    
    const d3data = {
        downward: {
            id: data.root.id,
            // we store the label for the root separately, because
            // 'origin' is needed as the name for the root node in d3
            name: 'origin',
            originName: labelFor(data.root), 
            direction: 'downward',
            children: data.hyponyms.map(
                synset => ({
                    name: labelFor(synset),
                    id: synset.id,
                    children: [] // do not go further down than direct hyponyms
                })
            )
        },
        upward: {
            id: data.root.id,
            name: 'origin',
            originName: labelFor(data.root),
            direction: 'upward',
            children: data.root.hypernyms && data.root.hypernyms.length
                ? data.root.hypernyms.map(walkHypernyms)
                : []
        }
    }
    
    return d3data;
}

function graphs(state = SI({}), action) {
    switch(action.type) {

    case actionTypes.GRAPH_RETURNED: {
        return SI.setIn(state, ["bySynsetId", action.synsetId],
                        { origData: action.data,
                          d3Data: dataToD3(action.data)
                        });
    }

    default:
        return state;
    }
}

export { graphs };
