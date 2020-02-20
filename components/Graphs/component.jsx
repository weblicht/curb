// Copyright 2019 Richard Lawrence
//
// This file is part of germanet-common.
//
// germanet-common is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// germanet-common is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with germanet-common.  If not, see <https://www.gnu.org/licenses/>.

import { isComponent, comparisonOn } from '../../helpers';
import { hnymPathQueries } from './actions';
import { selectHnymPathsState } from './selectors';
import { connectWithApiQuery } from '../APIWrapper';

import React from 'react';
import { connect } from 'react-redux';
import SI from 'seamless-immutable';
import { Network } from 'visjs-network';
import classNames from 'classnames';


// CONSTANTS: 
// Default configuration options to pass to vis.js

// The default layout options create a hierarchical network layout:
export const DEFAULT_NETWORK_LAYOUT = {
    hierarchical: {
        enabled: true,
        // these options position root/LCS at top and draws
        // the graph like a standard tree:
        direction: "DU", 
        sortMethod: "directed",
        nodeSpacing: 200,
    }
};

// The default node options draw nodes as blue dots with the label
// positioned below them:
export const DEFAULT_NETWORK_NODES = {
    shape: "dot",
    size: 10,
    font: {
        size: 11,
    },
    widthConstraint: 150,   
};

// These node options for highlighted nodes are only added to
// those nodes which the backend marks as being highlighted (e.g., the
// LCS node(s) in a path): 
export const DEFAULT_NETWORK_HIGHLIGHTED_NODES = {
    color: {
        background: "#fff3cd", // light yellow, matches Bootstrap warning
        border: "#856404", // dark yellow, matches Bootstrap warning
        highlight: {
            background: "#fff3cd",
            border: "#856404", 
        } 
    }
};

// These node options for the "end" nodes are only added to the from
// and to nodes which are used to construct a path graph:
export const DEFAULT_NETWORK_END_NODES = {
    color: {
        background: "#d4edda", // light green, matches Bootstrap success 
        border: "#155724", // dark green, matches Bootstrap success 
        highlight: {
            background: "#d4edda",
            border: "#155724", 
        }
    }
};


// The default edge options draw edges as curves with arrows pointing
// in the middle of the edge from hyponyms to their hypernyms:
export const DEFAULT_NETWORK_EDGES =  {
    smooth: {
        type: "cubicBezier",
    }, 
    color: {
        inherit: false, // highlighted nodes shouldn't have highlighted edges
    },
    arrows: {
        middle: { enabled: true, type: 'arrow' }
    }, 
};

// The default physics uses the hierarchical repulsion model (in
// conjunction with the default hierarchical layout, above) to layout
// the graph. Note: this combination of options is not perfect, but it
// seems to reduce the number of edge crossings a bit in more
// complicated graphs, and mostly gives nice looking results, though a
// few manual adjustments by the user may be necessary:
export const DEFAULT_NETWORK_PHYSICS = {
    enabled: true,
    solver: "hierarchicalRepulsion",
    maxVelocity: 55,
    hierarchicalRepulsion: {
        centralGravity: 0,
        springLength: 85,
        springConstant: 0.1,
        //avoidOverlap: 1,
    },
};

// The default interaction options enable the navigation and zoom
// restoration buttons:
export const DEFAULT_NETWORK_INTERACTION = {
    navigationButtons: true,
    keyboard: {
        enabled: true,
        bindToWindow: false // true interacts badly with ü key on German layout 
    },
    multiselect: true,
};

// The default configure options *disable* the network configuration
// GUI. Enabling can be helpful for development, though, especially
// when trying to play around with the physics to find a good
// combination of options.
export const DEFAULT_NETWORK_CONFIGURE = {
    enabled: false,
    // uncomment this to provide a set of controls to play around with all the settings:
    //     enabled: true,
    //     filter: "physics", // or true for all options
    //     showButton: true,
    //     //container: config.optionsRef
    // },
};

// The default vis.js network options. Packs all of the default
// options above into the top level options object that is passed to
// the network constructor.
export const DEFAULT_NETWORK_OPTIONS = {
    configure: DEFAULT_NETWORK_CONFIGURE,
    interaction: DEFAULT_NETWORK_INTERACTION,
    layout: DEFAULT_NETWORK_LAYOUT,
    physics: DEFAULT_NETWORK_PHYSICS,
    nodes: DEFAULT_NETWORK_NODES,
    edges: DEFAULT_NETWORK_EDGES,
};

// The default style for the wrapper div around a vis.js network.
export const DEFAULT_NETWORK_CONTAINER_STYLE = {
    height: "800px"
};

// COMPONENTS:

// Low-level component that renders and controls a vis.js Network
// from React. Renders the wrapper div and passes the ref down to
// vis.js to draw the actual network.
// props:
//   data: Object representing a network, containing nodes and edges arrays.
//   options (optional): Object with configuration options for vis.js.
//     Individual option objects can also be given as props.
//     There are many possible options to control
//     both the layout and behavior of the graph; see the default
//     options objects above, and the vis.js documentation, for more
//     information.
//   keepPhysicsOn (optional) :: Boolean. When true, keeps the
//     network's physics simulation enabled even after the layout has
//     stabilized. Defaults to false, which allows the user to more
//     precisely position nodes one at a time after the initial layout
//     has been set by the physics.
//   containerStyle (optional): style object to be forwarded to the
//     wrapper div around the network. By default renders the
//     container div with a fixed height.
//   className, extras (optional): class name and extras to be applied
//     as classes to the wrapper div around the network.  By default adds
//     a "network-wrapper" class that can be used to style the wrapper in CSS.
class NetworkContainer extends React.Component {
    constructor(props) {
        super(props);
        this.containerRef = React.createRef();
        this.network = null;
    }

    componentDidMount() {
        if (this.props.data && this.props.data.nodes && this.props.data.nodes.length) {
            this.draw();
        }
    }
    
    componentDidUpdate(prevProps) {
        if (this.props.data && this.props.data.nodes && this.props.data.nodes.length
            && !isEqualNetworks(prevProps.data, this.props.data)) {
            if (this.network !== null) {
                // we're redrawing after a data change, so destroy the old network:
                this.network.destroy();
                this.network = null;
            }

            this.draw();
        }
    }

    componentWillUmount() {
        if (this.network !== null) {
            this.network.destroy();
        }
    }

    draw() {
        // allow caller to pass a complete options object, or to
        // override individual defaults via props. These props are all
        // given default values via defaultProps, below.
        const options = this.props.options || {
            configure: this.props.configure,
            interaction: this.props.interaction,
            layout: this.props.layout,
            physics: this.props.physics,
            nodes: this.props.nodes,
            edges: this.props.edges,
        };

        this.network = new Network(this.containerRef.current, this.props.data, options);

        if (!this.props.keepPhysicsOn) {
            this.network.on("stabilized", info => {
                this.network.setOptions({ physics: false });
            });
        }
    }

    render() {
        return (
            <div ref={this.containerRef}
                 className={classNames(this.props.className || "network-wrapper",
                                       this.props.extras)}
                 style={this.props.containerStyle}>
            </div>
        );
    }
}

// we accept each of the vis.js module-specific configuration objects
// (e.g. nodes, edges, layout) as individual props, using the defaults
// specified as constants below:
NetworkContainer.defaultProps = {
    ...DEFAULT_NETWORK_OPTIONS,
    containerStyle: DEFAULT_NETWORK_CONTAINER_STYLE
};

// Renders a graph of the path(s) between two synsets. Paths follow
// the hypernym relation and run via one or more common subsumers of
// the given synsets.
// props:
//   fromSynsetId :: String: the ID of the synset where the paths should start
//   toSynsetId :: String: the ID of the synset where the paths should end
//   onlyShortest (optional) :: Boolean: if true, draws only the shortest
//     paths from the two synsets to their least common subsumer(s).  Otherwise,
//     draws all paths. NOTE: drawing all paths is currently only implemented by
//     the backend in the case where toSynsetId is the ID for GNROOT.
//   highlightedNodes (optional): vis.js node options object that will
//     be applied only to highlighted nodes in the graph
//   endNodes (optional): vis.js node options object that will be
//     applied only to endpoint (to/from) nodes in the graph
//   maxLabelLength (optional) :: Integer: max length for node labels.
//     Labels are generated by concatenating the orthForms for each
//     node, up to this length. Defaults to 60. Pass null to always
//     show all orthForms (but note that long labels can have negative
//     effects on the appearance of the graph).
//   displayUnavailable (optional) :: Component. If given, this
//     component will be rendered just in case props.data is
//     undefined. (Otherwise, null is returned from this component,
//     i.e., nothing is rendered). The component will receive all of
//     this component's props.
//   Other props are forwarded to NetworkContainer to configure the display of
//   the graph.
function HnymPathsBetweenGraph(props) {

    if (props.data === undefined) {
        if (isComponent(props.displayUnavailable)) {
            const Unavailable = props.displayUnavailable;
            return <Unavailable {...props} />;
        }

        return null;
    }

    const maxLabelLength = props.maxLabelLength || 60;
    
    // vis.js needs mutable data:
    const mutData = SI.asMutable(props.data, { deep: true });

    const nodes = mutData.nodes.map(
        node => {
            // limit label size to maxLabelLength:
            const orthForms = node.orthForms.sort();
            const fullLabel = orthForms.join(', ');
            const label = (props.maxLabelLength !== null && fullLabel.length > maxLabelLength)
                  ? fullLabel.slice(0, fullLabel.lastIndexOf(', ', maxLabelLength)) + ' ...'
                  : fullLabel;
            
            const highlightOptions = mutData.highlights.includes(node.id)
                  ? (props.highlightedNodes || DEFAULT_NETWORK_HIGHLIGHTED_NODES)
                  : undefined;
            
            const endOptions = (node.id === props.fromSynsetId
                                || node.id === props.toSynsetId)
                  ? (props.endNodes || DEFAULT_NETWORK_END_NODES)
                  : undefined;
            
            return {
                id: node.id,
                label,
                ...highlightOptions,
                ...endOptions
            };
        }
    );
    const graph = withLevels({ nodes, edges: mutData.edges });

    return (
        <NetworkContainer {...props} data={graph} />
    );
}

function propsToHnymPathsBetweenParams(props) {
    // avoid API calls before we have both synset IDs:
    if (!(props.fromSynsetId && props.toSynsetId)) return undefined;

    return {
        fromSynsetId: props.fromSynsetId,
        toSynsetId: props.toSynsetId,
        onlyShortest: props.onlyShortest,
    };
}
HnymPathsBetweenGraph = connect(selectHnymPathsState)(HnymPathsBetweenGraph);
HnymPathsBetweenGraph = connectWithApiQuery(HnymPathsBetweenGraph,
                                            hnymPathQueries.queryActions,
                                            propsToHnymPathsBetweenParams);

export { HnymPathsBetweenGraph };

// Renders a graph of all paths from a given synset to GNROOT.
// props:
//   fromSynsetId: the ID of the synset from which the paths should start
// Other props are forwarded to NetworkContainer to configured the display
// of the graph.
export function HnymPathsToRootGraph(props) {
    const GERNEDIT_ROOT_ID = "51001";
    return (
        <HnymPathsBetweenGraph {...props}
                               fromSynsetId={props.fromSynsetId}
                               toSynsetId={GERNEDIT_ROOT_ID}
                               onlyShortest={false} />
    );
}

// Helper to do a deep comparison of two graphs (i.e., networks). Two
// graphs are equal if they have the same nodes and edges. Two nodes
// are equal if they have the same ID and label string. Two edges are
// equal if they have the same from and to properties.
function isEqualNetworks(net1, net2) {
    // these tests handle cases where one or both nodes are null or
    // undefined:
    if (typeof net1 !== typeof net2) return false;
    if (net1 === net2) return true; 

    if ((net1.nodes && !net2.nodes) || (net2.nodes && !net1.nodes)) return false;
    if ((net1.edges && !net2.edges) || (net2.edges && !net1.edges)) return false;

    // We can now assume the two networks are objects with nodes and edges arrays: 
    if (net1.nodes.length !== net2.nodes.length) return false;
    if (net1.edges.length !== net2.edges.length) return false;


    const nodes1 = net1.nodes.sort(comparisonOn('id'));
    const nodes2 = net2.nodes.sort(comparisonOn('id'));
    var i;
    for (i = 0; i < nodes1.length; i++) {
        if (nodes1[i].id !== nodes2[i].id) return false; 
        if (nodes1[i].label !== nodes2[i].label) return false;
    }

    const edges1 = net1.edges.map(e => `${e.from}${e.to}`).sort();
    const edges2 = net2.edges.map(e => `${e.from}${e.to}`).sort();
    for (i = 0; i < edges1.length; i++) {
        if (edges1[i] !== edges2[i]) return false; 
    }

    return true;
}

// Helper to add levels to a vis.js graph object. This improves
// layouts in cases where vis.js sometimes assigns the wrong levels
// just based on the edge relation, particularly when paths of
// different lengths converge at the same node.
// params:
//   graph Object, with nodes and edges arrays
// returns:
//   graph Object, where nodes include a level from 0 (representing a top node)
//   ranging into the negative numbers
function withLevels(graph) {
    // Levels start at 0 and go negative; with the "DU" layout
    // direction option for vis.js' hierarchical layout, this ensures
    // that top nodes (like GNROOT) are always laid out visually at
    // the top of the graph. We'd have to flip this for the "UD"
    // direction; but the "DU" direction is the right one when we
    // *don't* add levels.
    
    // We update nodesById as we make the level calculations. We
    // ensure here that every node has an initial level (so vis.js
    // doesn't barf if for some reason the graph is unconnected):
    var nodesById = Object.fromEntries(graph.nodes.map(node => [node.id, {...node, level: 1}]));

    // edge relation goes FROM children TO parent 
    const edges = graph.edges;
    var childrenById = {};
    var topNodeIds = new Set(graph.nodes.map(node => node.id));
    edges.forEach(edge => {
        topNodeIds.delete(edge.from);
        if (childrenById.hasOwnProperty(edge.to)) {
            childrenById[edge.to].push(edge.from);
        } else {
            childrenById[edge.to] = [edge.from];
        }
    });
    
    function addLevelBelow(level, nodeId) {
        // the node's new level is the min of the passed level and any existing level:
        const oldLevel = nodesById[nodeId].level;
        const newLevel = oldLevel ? Math.min(level, oldLevel) : level;
        nodesById[nodeId].level = newLevel;
       
        // if node has no children, or level didn't change, we're done:
        const children = childrenById[nodeId];
        if (!children || !children.length || newLevel === oldLevel) return;

        // otherwise (re)assign level of all children below it:
        children.forEach(childId => addLevelBelow(newLevel - 1, childId));

    }

    // assign levels in the graph starting with 0 at the top nodes:
    topNodeIds.forEach(nodeId => addLevelBelow(0, nodeId));

    return {
        ...graph,
        nodes: Object.values(nodesById)
    };
}

