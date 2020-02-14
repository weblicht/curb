import { makeQueryActions } from '../APIWrapper/actions';
import { APIError } from '../APIWrapper/validation';
import { apiPath } from '../../constants';

// data validator for graph objects, which should look like:
// {
//    nodes: [ { id: <nodeId> }, ...],
//    edges: [ { from: <nodeId>, to: <nodeId> }, ...],
// }
function isValidGraph(data) {
    if (!(data instanceof Object)) throw new APIError("Graph data was not an object");

    if (!(data.hasOwnProperty("nodes") && Array.isArray(data.nodes))) {
        throw new APIError("Graph data did not contain nodes array");
    }
    data.nodes.forEach(node => {
        if (!node.id) throw new APIError("Graph data node is missing .id");
    });

    if (!(data.hasOwnProperty("edges") && Array.isArray(data.edges))) {
        throw new APIError("Graph data did not contain edges array");
    }
    data.edges.forEach(edge => {
        if (!(edge.from && edge.to)) throw new APIError("Graph data edge is missing .from or .to");
    });

    return data;
}


export const hnymPathQueries = makeQueryActions(
    'HNYM_PATH',
    apiPath.hnymPaths,
    params => ({ fromAndToId: `from${params.fromSynsetId}to${params.toSynsetId}` }),
    isValidGraph
); 

