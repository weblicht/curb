import { actionTypes } from './actions';

import SI from 'seamless-immutable';

function dataToD3(data) {

    function labelFor(synset) {
        return synset.id + ': ' + synset.orthForms.join(', ');
    }
    
    function walkHypernyms(synset) {
        if (synset.hypernyms && synset.hypernyms.length === 0) {
            return {
                name: labelFor(synset),
                children: []
            }
        } else {
            return {
                name: labelFor(synset),
                children: synset.hypernyms.map(walkHypernyms) 
            }
        }
    }
    
    const d3data = {
        downward: {
            name: 'origin',
            direction: 'downward',
            children: data.hyponyms.map(
                synset => ({
                    name: labelFor(synset),
                    children: [] // do not go further down than direct hyponyms
                })
            )
        },
        upward: {
            name: 'origin',
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
