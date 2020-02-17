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

import { isVisible, comparisonOn } from '../../helpers';
import { hnymPathQueries } from './actions';
import { selectHnymPaths } from './selectors';
import { connectWithApiQuery } from '../APIWrapper';

import * as d3 from 'd3';
import React from 'react';
import { connect } from 'react-redux';
import SI from 'seamless-immutable';
import { Network } from 'visjs-network';
import classNames from 'classnames';

// *******************************************************************
// READ THIS FIRST:
// *******************************************************************
//
// The React components defined here are mere wrappers; all the actual
// work is done in the D3VerticalTreeGraph function, which uses d3.js
// to draw the charts.
//
// A word of warning is in order.  In the course of making this code
// work, I have learned that d3 is a very powerful library, and it
// provides a bunch of useful abstractions.  But its abstractions
// encourage you to manipulate the DOM directly, which is a huge piece
// of state.  They also encourage method chaining, which makes code
// nicer to read, but harder to step through in a debugger.  And when
// calling d3 from React, all of that hard-to-step-through DOM
// manipulation is happening in an environment where someone else is
// constantly re-rendering the DOM in the background.  Add
// asynchronous transitions on top of that, and it becomes *very* hard
// to think clearly about what's going on at any given moment.
//
// In short, here be dragons.  Your mental model of how this code
// works is probably wrong.  (*Mine* is probably wrong.)
// Understanding everything to the point where I could get it working
// was *way* more effort than I expected; there were many, many times
// when something completely unexpected started happening, even after
// making changes that seemed trivial, and it took me hours to figure
// out why.  If you must work on this code, go very slowly: make the
// smallest change you can imagine, and then thoroughly test it before
// you make any others.
//
// And please, please, PLEASE: do NOT commit any changes to the code
// in this file, and especially not to the functions which call d3,
// unless you have documented very clearly and thoroughly both *what*
// your code is doing and *why*.  d3 makes it very easy to write code
// which appears to work right now, but will be difficult for someone
// else to understand, and therefore difficult to maintain later.
// Resist that temptation, for the sake of your sanity, and mine.

// Without further ado, here are the CONSTANTS:

// Layout sizing:
export const DEFAULT_WIDTH = 1280;
export const DEFAULT_HEIGHT = 800;
export const DEFAULT_MARGIN = 20;

// Transitions:
export const DEFAULT_TRANSITION_DURATION = 750;

// Nodes:
function DEFAULT_NODE_CLICK_HANDLER(d) {
    return null;
}
export const DEFAULT_NODE_RADIUS = 5;
export const DEFAULT_NODE_COLORS = {
    // TODO: decide on some nice-looking defaults here
    unselected: 'gray',
    selected: 'green',
    unchosen: '',
    chosen: '',
    root: 'pink'
};
export const DEFAULT_NODE_CLASS = 'node';

// Node separation [x, y] for layout.  The ratio of the x and y
// separation values determines how quickly the tree "spreads out" in
// one dimension relative to the other when laid out. These values
// seem to provide a reasonable default for hyper/hyponym trees drawn
// in a desktop browser; YMMV:
export const DEFAULT_NODE_SEP = [DEFAULT_WIDTH / 10,
                                 DEFAULT_HEIGHT / 8];

export const DEFAULT_NODE_LABEL_GAP = 6;
export const DEFAULT_NODE_LABEL_ANGLE = -30;
export const DEFAULT_NODE_LABEL_YOFFSET = "0.35em";
export const DEFAULT_NODE_LABEL_SETTINGS = {
    gap: DEFAULT_NODE_LABEL_GAP,
    angle: DEFAULT_NODE_LABEL_ANGLE,
    yOffset: DEFAULT_NODE_LABEL_YOFFSET
};
export const DEFAULT_NODE_CONFIG = {
    radius: DEFAULT_NODE_RADIUS,
    colors: DEFAULT_NODE_COLORS,
    class: DEFAULT_NODE_CLASS,
    separation: DEFAULT_NODE_SEP,
    labels: DEFAULT_NODE_LABEL_SETTINGS,
    clickHandler: DEFAULT_NODE_CLICK_HANDLER
};

// Links:
export const DEFAULT_LINK_CLASS = 'link';
export const DEFAULT_LINK_COLOR = '#555'; // a slightly lighter gray than unselected nodes
export const DEFAULT_LINK_THICKNESS = 1.5;
export const DEFAULT_LINK_OPACITY = 0.4;
export const DEFAULT_LINK_CONFIG = {
    class: DEFAULT_LINK_CLASS,
    color: DEFAULT_LINK_COLOR,
    thickness: DEFAULT_LINK_THICKNESS,
    opacity: DEFAULT_LINK_OPACITY 
};

// Default configuration options for vis.js:

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
// from hypernym to hyponym:
export const DEFAULT_NETWORK_EDGES =  {
    smooth: {
        type: "cubicBezier",
    }, 
    color: {
        inherit: false, // highlighted nodes shouldn't have highlighted edges
    },
    arrows: { from: true }, 
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
    //enabled: true,
    navigationButtons: true,
    keyboard: true,
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

// D3VerticalTreeGraph starts here - heed the notice at the top of this file!
// params:
//   svgNode :: React ref, a reference to the svg DOM node where the graph should be drawn
//     The DOM node should already have children with the following structure:
//       g.chart-container
//         g.links
//         g.nodes
//
//   data :: Tree, an object with at least the following properties:
//     id: a unique identifier
//     name: a name to be displayed on the chart
//     children: an array of child tree nodes with the same shape
// 
//   config :: Object, parameters for drawing the chart, including:
//     width :: Integer, the chart width in pixels
//     height :: Integer, the chart height in pixels
//     flip :: Bool, whether the tree should be drawn with root at the top (false) or bottom (true)
//     margin :: Integer
//     nodes :: Object, with the following properties:
//       sep :: [Integer, Integer], the width and height between nodes
//       class :: String
//       clickHandler :: event handler function; it will be passed the clicked tree node as argument
//       colors :: Object, with the following properties:
//         selected
//         unselected
//         root
//       labels :: Object, with the following properties:
//         gap
//         angle
//     links :: Object, with the following properties:
//       class :: String
//       color :: String
//       thickness :: Number
//       opacity :: Number
//    
function D3VerticalTreeGraph(svgNode, data, config) {

    // Do nothing when the svgNode is not visible.  This is both a
    // performance optimization and good UI: since the component
    // responsible for drawing the chart might be rendered many times
    // before it's ever made visible, we don't want to perform a bunch
    // of DOM updates before we have to; and this has the side benefit
    // of making the transitions visible to the user even on the first
    // visible render.
    if (!isVisible(svgNode)) return;
    
    // Some terminology: the "tree" will refer to the data structure
    // returned by D3's tree layout functions.  (The input data, which
    // is also a tree data structure, will be referred to as the
    // "hierarchy", since D3 uses a hierarchy to produce a tree.)  The
    // "chart" will refer to the complete visualization of the tree:
    // its nodes, edges, labels, and so on.  This function draws
    // and/or updates a chart.
    const hierarchy = d3.hierarchy(data);

    // Some constants needed below.  flipScalar is used to orient
    // various elements either upward or downward.  config.margin is
    // referenced frequently, so we give it its own variable.
    const flipScalar = (config.flip ? -1 : 1);
    const margin = config.margin;

    // This performs the layout of the tree.  We use the D3's
    // .nodeSize tree layout, as opposed to .size, to ensure that the
    // root node is always laid out at (0,0).  This is important
    // because we sometimes want to draw multiple trees on the same
    // svg which are rooted at the same point.  Multiplying the
    // y-separation value by flipScalar causes the tree to be drawn
    // either upward or downward from the root.
    const [sepx, sepy] = config.nodes.separation;
    const root = d3.tree().nodeSize([sepx, sepy * flipScalar])(hierarchy);


    // Here we select the actual svg DOM element using the given
    // reference, and set various style attributes.  A max-width of
    // 100% and an auto height allow the chart image to resize with
    // the browser window.
    const svg = d3.select(svgNode)
          .style("max-width", "100%")
          .style("height", "auto")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10);

    // The chartContainer is a group ("g") element with the
    // "chart-container" class, and should be the only immediate child
    // of the svg element.  (This must be guaranteed by the caller.)
    // It is used as the point to apply zoom transforms: scaling and
    // translating the chartContainer scales and translates the whole
    // chart.
    const chartContainer = svg.select("g.chart-container");
    
    // We now get down to the main business of drawing the chart.
    // This includes:
    // 1) Binding the tree's nodes to g elements (creating them as
    // necessary, and handling root specially)
    // 2) Binding the tree's edges to path elements (creating them as
    // necessary)
    
    // First, the NODES.  The chart container should have exactly one
    // child with class 'nodes', which acts as a container for all the
    // nodes on the chart.  (Again, we assume that has been setup by
    // the caller.)  Each node will be represented as a group element
    // inside this container.
    const nodeContainer = chartContainer.selectAll("g.nodes")
          .attr("stroke-linejoin", "round")
          .attr("stroke-width", 3);

    // To bind the tree data to DOM elements, we use the .id property
    // as a key, which is carried over from the data hierarchy passed
    // by the caller.
    function nodeKey(d) { return d.data.id; }

    // We start with the root node, which we handle separately, to
    // allow drawing multiple trees with the same root, coloring it
    // differently, and so on.  This function handles adding a group
    // for the root node to the DOM if it has not yet been drawn.
    function appendRootNode(enter) {
        const rootNode = enter.append("g")
              .attr("class", "root")
              // root is always at (0,0) in tree coordinates:
              .attr("transform", d => `translate(0,0)`);

        // root gets a special color
        rootNode.append("circle")
            .attr("r", config.nodes.radius)
            .attr("fill", config.nodes.colors.root);
    
        // root label is drawn flat (no dy attribute) and to the right
        rootNode.append("text") 
            .attr("x", config.nodes.labels.gap)
            .attr("text-anchor", "start")
            .text(d => d.data.name)
            // this adds a white outline to the label, which makes it
            // more readable at points where a label is laid over a
            // link:
            .clone(true).lower()
            .attr("stroke", "white");

        return rootNode;
    }

    // This selects the DOM element for the root node and binds it to
    // its data.
    const rootNode = nodeContainer
          .selectAll("g.root")
          .data([root], nodeKey)
          .join(enter => appendRootNode(enter));
    
    // We now move on to the non-root nodes in the tree.  This
    // function handles adding groups to the DOM for nodes which have
    // not yet been drawn.  The main differences from the root node are:
    //   - we initially position nodes at the same position as their parent,
    //     and later transition them to their own position
    //   - we set the label's angle and orientation based on the direction
    //     in which we are drawing the tree
    //   - we bind the node to a click handler provided in the config, which
    //     can be used e.g. to expand or collapse the tree
    function appendNewNodes(enter) {
        
        const newNodes = enter.append("g")
              .attr("class", config.nodes.class)
              .attr("transform", d => {
                  // start new nodes at the same position (in tree
                  // coordinates) as their parent; they 'grow out' to
                  // their own position during the transition:
                  const parent = d.ancestors()[1];
                  return `translate(${parent.x},${parent.y})`;
              })
              .on("click", config.nodes.clickHandler);
        
        newNodes.append("circle")
            .attr("r", config.nodes.radius);
    
        newNodes.append("text")
            .attr("x", flipScalar * config.nodes.labels.gap)
            .attr("text-anchor", config.flip ? "end" : "start")
            .text(d => d.data.name)
             // dy shoves the label down a little bit so its center
             // line passes through the middle of the circle. 
            .attr("dy", config.nodes.labels.yOffset) 
            .attr("transform", `rotate(${config.nodes.labels.angle})`)
            // again, the white outline for readability:
            .clone(true).lower()
            .attr("stroke", "white");

        return newNodes;

    }

    // This selects the elements *for the nodes in the tree we are
    // currently drawing* (creating them if necessary) based on the
    // class specified for them in the config.  Restricting the
    // selection to that class enables us to bind these elements to
    // the tree's nodes, without disturbing any other nodes which have
    // been drawn on the same chart as part of another tree.
    const currentNodes = nodeContainer
          .selectAll(`.${config.nodes.class}`)
          // the data here is all the descendants of root, excluding
          // root itself:
          .data(root.descendants().slice(1), nodeKey)
          .join(enter => appendNewNodes(enter));

    // It is important to re-bind the click handler for *all* nodes in
    // the tree, whether or not they were previously drawn, since the
    // handler can depend on the value of a rendering component's
    // props, which might have changed since the nodes were initially
    // drawn.
    currentNodes.on("click", config.nodes.clickHandler);

    // At this point, elements have been created in the DOM for the
    // nodes in the tree.  Thus, we can now set up ZOOMING based on a
    // selection of all the nodes in the *chart*, including those
    // outside the current tree.  This allows us to set an appropriate
    // zoom that will show the entire chart, regardless of its size.

    // D3's tree layout assigns x and y coordinates to each node in
    // the tree.  These coordinates will be referred to as the "tree"
    // coordinates, since their maximum and minimum values determine
    // the rectangle around (0,0) on which the tree (or trees) is laid
    // out, and which therefore determine the size of the whole chart.
    // In the tree coordinates, root is always at (0,0), and x and y
    // can run arbitrarily far in either the negative or positive
    // direction, depending on how many nodes are in the tree.
    //  
    // The "view window" coordinates, by contrast, represent the portion
    // of the chart that is *visible* inside the svg element.  The
    // view window has a fixed width and height, determined by
    // config.width and config.height.  In the view window coordinates,
    // (0,0) represents the upper left corner, and (config.width,
    // config.height) the bottom right.
    //
    // The following function calculates d3 scales that map the tree
    // coordinates (for a given selection of nodes) into the view
    // window coordinates.  These scales are then used to map a d3
    // transform in tree coordinates, such as a zoom transform, into a
    // transform in view window coordinates, which can be applied to
    // the chart container.  Since this mapping is relatively
    // complicated, we wrap it in a function and return that function so
    // it can be reused.
    function transformToFit(nodeSelection) {
        return function (transform) {
            // Since we are using the .nodeSize layout, which assigns
            // x and y values to nodes in the tree coordinates based
            // on how far apart the nodes should be, we do not know
            // the extent of the tree coordinates in advance; their
            // maximum and minimum depend on the number of nodes in
            // the tree.  Thus, we need to calculate their extent
            // based on all the data in a given selection of nodes
            // before we can determine their domain.
            const allNodePositions = nodeSelection.data();
            const [ xmin, xmax ] = d3.extent(allNodePositions, d => d.x);
            const [ ymin, ymax ] = d3.extent(allNodePositions, d => d.y);
            
            // Given the extents in the tree coordinates, we can
            // derive scales that map the tree coordinates into the
            // view window coordinates on each axis. These scales
            // translate points in one coordinate system into the
            // other.
            const viewWidth = config.width - 2 * margin;
            const xScale = d3.scaleLinear()
                  // tree coordinates:
                  .domain([ xmin, xmax ]) 
                  // view window coordinates, margin-shifted:
                  .range([margin, viewWidth + margin]); 
            
            const viewHeight = config.height - 2 * margin;
            const yScale = d3.scaleLinear()
                  .domain([ ymin, ymax ])
                  .range([margin, viewHeight + margin]);
            
            // The given zoom transform includes not just a
            // translation (a point (x,y), representing how far the
            // chart is panned) but also a scaling factor (k, the zoom
            // level).  In order to map the scaling factor from tree
            // coordinates into view window coordinates, we need the
            // ratios of the widths of the two intervals.
            const treeWidth = xmax - xmin;
            const xScalingFactor = viewWidth / treeWidth;

            const treeHeight = ymax - ymin;
            const yScalingFactor = viewHeight / treeHeight;

            // The chart is almost always wider in one dimension than
            // the other, and there is no guarantee that its
            // dimensions match the aspect ratio of the view window.
            // So we take the scaling factor k to be the *minimum* of
            // the two ratios.  This ensures that the whole chart will
            // scale to fit into the view window, along whichever
            // dimension is greater.
            const fitFactor = Math.min(xScalingFactor, yScalingFactor);

            // It can happen that the fitFactor is Infinity (namely,
            // when both the treeHeight and treeWidth are 0, perhaps
            // because we're still waiting for the backend to return
            // data).  In that case we set a default scale of 1.
            const k = fitFactor !== Infinity ? fitFactor : 1;
            
            // Finally, we apply the translation and the scaling
            // factor to the given (tree-coordinate) zoom transform,
            // returning a new transform in view window coordinates.
            // The chart is translated so that the root of the tree
            // appears in the middle of the view window, and scaled to
            // fit into the window.
            return transform
                .translate(xScale(0), yScale(0))
                .scale(k);
        };
    }

    // We now create a new zoom behavior object with a handler for
    // zoom events.  We use a very simple 'geometric' zoom for now,
    // meaning every element scales the same amount with zoom level
    // (so circles representing nodes, text, etc. will become very
    // large as the user zooms in).  We want to accomplish two things
    // with zooming:
    // 1) automatically scaling the chart to fit the view window
    //    when it is initially drawn, or when it is expands or
    //    shrinks as a result of user interaction
    // 2) allowing the user to explicitly zoom in or out by scrolling
    // 
    // However, it is jarring and annoying to have the zoom level
    // automatically get reset to include the entire chart if you have
    // already decided to zoom in on a portion of it.  Thus, whenever
    // the user first zooms, we set an attribute on the svg, and we do
    // not automatically zoom to fit the chart if that attribute has
    // been previously set, until the user explicitly restores
    // automatic zooming.  The following functions implement this
    // behavior.

    // zoomed is the zoom handler function, invoked by the zoom
    // behavior on all zoom events
    function zoomed() {
        const transform = d3.event.transform;

        // when zoom event handler is invoked by zoom.transform, its
        // sourceEvent field is null; but when the user explicitly
        // zooms via the mouse, there is an underlying sourceEvent
        // object.  Thus, to prevent auto-zooming when the user has
        // already explicitly zoomed, we set this attribute just in
        // case the sourceEvent is not null.
        if (d3.event.sourceEvent !== null) {
            svg.attr("data-user-set-zoom", true);
        }
        chartContainer.attr("transform", transform.toString());
    }

    // reset is a click handler to remove the "data-user-set-zoom"
    // attribute and return to automatic zooming.
    function reset() {
        // it's important that we set the attribute to null, rather
        // than false: null removes the attribute from the DOM; false
        // gets converted to a string, which in turn will be read back
        // as truth-y if we say if (!svg.attr("data-user-set-zoom")) ...
        // and so the conditional below will fail to run autoZoom on redraws
        svg.attr("data-user-set-zoom", null);
        autoZoom();
    }

    // autoZoom runs a zoom transition that automatically zooms to a
    // scale that will fit the entire chart inside the view window
    function autoZoom() {
        // treeToView is a function that maps a d3 zoom transform in
        // tree coordinates to another transform in view window
        // coordinates which will fit all the nodes:
        const allNodes = nodeContainer.selectAll("g");
        const treeToView = transformToFit(allNodes);

        // We always map the identity transform to view window
        // coordinates, so that the tree root ends up back at (0,0):
        const transform = treeToView(d3.zoomIdentity);

        // This schedules the actual transition:
        svg.transition()
            .duration(config.duration)
            .call(zoom.transform, transform);
    }

    // This creates the zoom behavior object and sets the zoomed()
    // function as its event handler.
    const zoom = d3.zoom();
    zoom.on('zoom', zoomed);
    
    // This makes the svg node the listener for zoom events, so we can
    // zoom from anywhere inside the chart.  (We don't use the
    // chartContainer itself as the listener because g elements can
    // only listen for events inside children that have a "fill"
    // attribute; this would prevent zooming when the mouse is over a
    // region of empty space.)  We also bind the reset function to the
    // double click event here, so that it overrides the zoom object's
    // default handler (which zooms in).
    svg.call(zoom)
       .on("dblclick.zoom", reset);

    // Finally, we run the automatic zooming, if the user has not
    // previously zoomed.
    if (!svg.attr("data-user-set-zoom")) {
        autoZoom();
    } 

    // We now move on to drawing the LINKS between the nodes.  Again,
    // we need a key function for binding the data objects to DOM
    // elements.  Since links in the original data do not have their
    // own IDs, we use the IDs of their source and target nodes to
    // uniquely identify them.
    function pathKey(d) {
        return `${d.source.data.id}to${d.target.data.id}`;
    }

    // This function adds new path elements to the DOM for links that
    // have not yet been drawn.
    function appendNewLinks(enter) {
        const newLinks = enter.append("path")
              .attr("class", config.links.class)
              // the "d" attribute on path elements tells the browser
              // how to draw the path; it has it's own little
              // mini-language, which is not very human readable.
              // Fortunately, D3 can construct it for us.  The
              // linkVertical() function constructs a smooth Bezier
              // curve from the link's source point to its target
              // point.
              .attr("d", d3.linkVertical()
                    .x(d => d.x)
                    .y(d => d.y))
              // we initially draw new links totally transparent, and then
              // transition them to their target opacity below, so that
              // we don't see links in the wrong place
              .attr("stroke-opacity", 0);
    
        return newLinks;
    }
    // Again, we use a container for all the links on the chart; the
    // caller must ensure it is there.  Since all the links look the
    // same, we can set their styling on the container element, and it
    // will be inherited.
    const linkContainer = chartContainer.selectAll("g.links")
          .attr("fill", "none")
          .attr("stroke", config.links.color)
          .attr("stroke-width", config.links.thickness);

    // Here we select the DOM elements for the links in the tree we
    // are currently drawing and bind them to data.  The data here
    // consists of an array of objects provided by D3's tree
    // layout. Each has a .source and .target property, which each
    // point to a node in the tree data.
    const currentLinks = linkContainer
          .selectAll(`.${config.links.class}`)
          .data(root.links(), pathKey)
          .join(enter => appendNewLinks(enter));

    // At this point, all the DOM elements have been drawn and bound
    // to data, so we can remove DOM elements that are no longer bound
    // to data and should not appear on the chart:
    currentNodes.exit().remove();
    currentLinks.exit().remove();

    // Finally, we move on to TRANSITIONS.  These animate the chart so
    // that the user can see what's been added, selected, etc. on the
    // basis of previous interaction.

    // This transition moves the node elements to their new positions.
    // We apply it to all nodes in the current tree, because adding
    // nodes to the tree can cause existing ones to shift around.
    // It also "grows" nodes out from their parent position, where
    // they are initially placed.
    function moveNodes(nodeSelection) {
        return nodeSelection.transition() 
            .duration(config.duration)
            .attr("transform", d => `translate(${d.x},${d.y})`);
    }
    moveNodes(currentNodes);

    // This transition colors nodes which have been selected or
    // unselected by the user, as represented by the .selected
    // property on nodes in the tree data and the original hierarchy.
    // We need to create two separate filters here on the nodes, as
    // opposed to operating on circle elements directly, because there
    // is no data bound to the circle elements.
    function recolorNodes(nodeSelection) {
        const selected = nodeSelection
              .filter(d => d.data.selected)
              .selectAll("circle")
              .transition()
              .duration(config.duration)
              .attr("fill", config.nodes.colors.selected);
        const unselected = nodeSelection
              .filter(d => !d.data.selected)
              .selectAll("circle")
              .transition()
              .duration(config.duration)
              .attr("fill", config.nodes.colors.unselected);
    }
    recolorNodes(currentNodes);

    // This transition moves the link elements to their new positions,
    // and then fades in the new links to their target opacity.
    // Again, we apply it to all links in the current tree, since
    // adding nodes can cause existing links to shift around.
    function moveAndFadeInLinks(linkSelection) {
        return linkSelection.transition()
            .duration(config.duration)
            .attr("d", d3.linkVertical()
                  .x(d => d.x)
                  .y(d => d.y))
            // calling .transition() *on a transition* creates a new
            // transition with the same underlying selection of nodes
            // and duration, scheduled to run when the present one
            // finishes; thus, this fades in new links after all the
            // links have finished moving:
            .transition()
            .attr("stroke-opacity", config.links.opacity);
    }
    moveAndFadeInLinks(currentLinks);
} 

// COMPONENTS:

// VerticalTreeGraph
// Draws a single tree, either upward or downward, from a root node.
// This component just renders a basic skeleton, and then hands off
// the actual drawing to D3VerticalTreeGraph.
// props:
//   tree: a tree object
//   flip: if true, draw the tree upward, instead of downward
//   nodeClickHandler: call back click handler; receives a node from
//     upwardTree or downwardTree when the corresponding chart element
//     is clicked
//   ...and all the graph configuration props, documented in defaultProps
//   below
export class VerticalTreeGraph extends React.Component {

    constructor(props) {
        super(props);
        this.svgRef = React.createRef();
        this.drawTree = this.drawTree.bind(this);
        this.dimensions = this.dimensions.bind(this);
    }

    dimensions() {
        const width = this.props.width;
        const canvasHeight = this.props.height;
        const margin = this.props.margin;
        return {
            width,
            canvasHeight,
            margin,
        };
    }

    drawTree() {
        const dim = this.dimensions();
        const config = {
            duration: this.props.duration,
            nodes: {
                ...this.props.nodes,
                clickHandler: this.props.nodeClickHandler,
            },
            links: {
                ...this.props.links,
            },
            flip: this.props.flip,
            height: dim.canvasHeight,
            width: dim.width,
            margin: dim.margin
        };

        D3VerticalTreeGraph(this.svgRef.current, this.props.tree, config);
    }

    componentDidMount() {
        this.drawTree();
    }
    
    componentDidUpdate(prevProps) {
        // See related comment in VerticalDoubleTreeGraph: 
        if (!prevProps.forceRedraw && this.props.forceRedraw) {
            this.drawTree();
            return;
        }

        if (!isEqualNodes(prevProps.tree, this.props.tree)) {
            this.drawTree();
        }
    }
    
    render() {
        return (<GraphSkeleton svgRef={this.svgRef} dimensions={this.dimensions()}/>);
    }
}
VerticalTreeGraph.defaultProps = {
    flip: false,
    margin: DEFAULT_MARGIN,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    duration: DEFAULT_TRANSITION_DURATION,
    nodes: DEFAULT_NODE_CONFIG,
    links: DEFAULT_LINK_CONFIG
};

// VerticalDoubleTreeGraph
// Draws two vertical trees, one upward and one downward, from a common
// root.  This component just renders a basic skeleton, and then hands
// off the actual drawing to D3VerticalTreeGraph.
// props:
//   upwardTree: a tree object
//   downwardTree: a tree object
//   nodeClickHandler: call back click handler; receives a node from
//     upwardTree or downwardTree when the corresponding chart element
//     is clicked
//   ...and all the graph configuration props, documented in defaultProps
//   below
export class VerticalDoubleTreeGraph extends React.Component {

    constructor(props) {
        super(props);
        // We use a React ref to hand a DOM node reference down to d3
        // See: https://reactjs.org/docs/refs-and-the-dom.html
        this.svgRef = React.createRef();
        this.drawTrees = this.drawTrees.bind(this);
        this.dimensions = this.dimensions.bind(this);
    }

    dimensions() {
        const width = this.props.width;
        const canvasHeight = this.props.height;
        const margin = this.props.margin;
        return {
            width,
            canvasHeight,
            margin,
        };
    }

    drawTrees() {
        const dim = this.dimensions();
        const upwardConfig = {
            duration: this.props.duration,
            nodes: {
                ...this.props.nodes,
                clickHandler: this.props.nodeClickHandler,
                class: 'upward'
            },
            links: {
                ...this.props.links,
                class: 'upward'
            },
            flip: true,
            height: dim.canvasHeight,
            width: dim.width,
            margin: dim.margin
        };
        const downwardConfig = {
            duration: this.props.duration,
            nodes: {
                ...this.props.nodes,
                clickHandler: this.props.nodeClickHandler,
                class: 'downward'
            },
            links: {
                ...this.props.links,
                class: 'downward'
            },
            flip: false,
            height: dim.canvasHeight,
            width: dim.width,
            margin: dim.margin
        };
        D3VerticalTreeGraph(this.svgRef.current, this.props.upwardTree,
                            upwardConfig);
        D3VerticalTreeGraph(this.svgRef.current, this.props.downwardTree,
                            downwardConfig);
    }

    componentDidMount() {
        this.drawTrees();
    }

    componentDidUpdate(prevProps) {
        // D3VerticalTreeGraph avoids drawing the graph when the SVG
        // DOM node is not visible.  But there is no way inside React
        // to notice that this node has *become* visible except via a
        // change in props or state; thus, we allow components higher
        // up the hierarchy to send down a forceRedraw prop if the
        // graph should unconditionally be redrawn. This is useful
        // when e.g. the graph appears on an unselected tab in a
        // tabbed interface, and thus it is not visible when the
        // component first renders.
        if (!prevProps.forceRedraw && this.props.forceRedraw) {
            this.drawTrees();
            return;
        }
        if (!isEqualNodes(prevProps.upwardTree, this.props.upwardTree) ||
            !isEqualNodes(prevProps.downwardTree, this.props.downwardTree)) {
            this.drawTrees();
        }
    }

    render() {
        // adding the root ID as a key lets React know it should
        // re-render the graph skeleton (and hence the underlying SVG)
        // when the root node changes, i.e., when we're drawing a new
        // graph:
        const key = this.props.upwardTree.id;
        return (<GraphSkeleton key={key} svgRef={this.svgRef} dimensions={this.dimensions()}/>);
    }

}
VerticalDoubleTreeGraph.defaultProps = {
    margin: DEFAULT_MARGIN,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    duration: DEFAULT_TRANSITION_DURATION,
    nodes: DEFAULT_NODE_CONFIG,
    links: DEFAULT_LINK_CONFIG
};

// GraphSkeleton
// Renders the svg element and basic internal structure needed by
// D3VerticalTreeGraph, as well as a container div to allow for
// scaling to fit the browser window.
function GraphSkeleton(props) {
    // We need to wrap the SVG in a container div to get it to scale
    // to fit the container.  The container must have (max-)width /
    // (max-)height properties for this, and for the overflow property
    // to work.  We then set the SVG viewBox using the width and
    // height of the container.  See: https://css-tricks.com/scale-svg/
    // I am here using "Option 3" as described on that page to
    // scale the SVG to the available width.
   
    // Especially important advice from that page re: the viewBox:
    // "The width is the width in user coordinates/px units,
    // within the SVG code, that should be *scaled to fill the
    // width of the area* into which you're drawing your SVG (the
    // viewport in SVG lingo)."
    
    // and re: height and width attributes: "If you use inline SVG
    // (i.e., <svg> directly in your HTML5 code), then the <svg>
    // element *does double duty*, defining the image area within
    // the web page as well as within the SVG. Any height or width
    // you set for the SVG with CSS will override the height and
    // width attributes on the <svg>."

    // One other important feature: placing the links group before the
    // node group ensures that the nodes are drawn on *top* of the
    // links, and thus ensures that their labels will not be obscured
    // by the links.
    const dim = props.dimensions;
    const svgRef = props.svgRef;

    return (
        <div className="graph-container"
             style={{maxHeight: dim.canvasHeight.toString() + "px",
                     maxWidth: dim.width.toString() + "px",
                     overflow: "scroll"}} >
          <svg ref={svgRef} height="auto" viewBox={`0 0 ${dim.width} ${dim.canvasHeight}`}>
            <g className="chart-container">
              <g className="links"/>
              <g className="nodes"/>
            </g>
          </svg>
        </div>
    );
}
 
// Helper to do a deep comparison of two tree nodes. Two nodes are
// equal are if they have the same ID, they have the same selected
// status, and all of their child nodes are equal.
function isEqualNodes(node1, node2) {
    // these tests handle cases where one or both nodes are null or
    // undefined:
    if (typeof node1 !== typeof node2) return false;
    if (node1 === node2) return true; 

    // We can now assume the two nodes are objects: 
    if (node1.id !== node2.id) return false;

    if ((node1.selected && !node2.selected)
        || (!node1.selected && node2.selected)) return false;

    if ((node1.children && !node2.children)
        || (node2.children && !node1.children)) return false;
    if (node1.children.length !== node2.children.length) return false;

    // make sure we have mutable copies of the children arrays for .sort():
    const children1 = SI.asMutable(node1.children).sort(comparisonOn('id'));
    const children2 = SI.asMutable(node2.children).sort(comparisonOn('id'));

    var i;
    for (i = 0; i < children1.length; i++) {
        if (!isEqualNodes(children1[i], children2[i])) return false; 
    }

    return true;
}


// A container for a vis.js Network.  Renders the wrapper div and passes the ref
// down to vis.js to draw the actual network.
// props:
//   data: Object representing a network, containing nodes and edges arrays.
//   options (optional): Object with configuration options for vis.js.
//     Individual option objects can also be given as props.
//     There are many possible options to control
//     both the layout and behavior of the graph; see the default
//     options objects above, and the vis.js documentation, for more
//     information.
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

    componentDidUpdate(prevProps) {
        if (this.props.data && this.props.data.nodes && this.props.data.nodes.length) {
            if (this.network !== null) {
                // we're redrawing after a props change, so destroy the old network:
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
// specified as constants above:
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
//   Other props are forwarded to NetworkContainer to configure the display of
//   the graph.
function PathsBetweenGraph(props) {
    if (!(props.data && props.data.nodes && props.data.nodes.length)) {
        // draw the container even without data, so that layouts
        // expecting it don't break:
        return <NetworkContainer {...props} data={undefined} />;
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
    const graph = { nodes, edges: mutData.edges };

    return (
        <NetworkContainer {...props} data={graph} />
    );
}

function stateToPathsBetweenProps(state, ownProps) {
    return {
        data: selectHnymPaths(state, ownProps)
    };
}

function propsToPathsBetweenParams(props) {
    // avoid API calls before we have both synset IDs:
    if (!(props.fromSynsetId && props.toSynsetId)) return undefined;

    return {
        fromSynsetId: props.fromSynsetId,
        toSynsetId: props.toSynsetId,
        onlyShortest: props.onlyShortest,
    };
}
PathsBetweenGraph = connect(stateToPathsBetweenProps)(PathsBetweenGraph);
PathsBetweenGraph = connectWithApiQuery(PathsBetweenGraph,
                                        hnymPathQueries.queryActions,
                                        propsToPathsBetweenParams);

export { PathsBetweenGraph };

// Renders a graph of all paths from a given synset to GNROOT.
// props:
//   fromSynsetId: the ID of the synset from which the paths should start
// Other props are forwarded to NetworkContainer to configured the display
// of the graph.
export function PathsToRootGraph(props) {

    const GERNEDIT_ROOT_ID = "51001";

    return (
        <PathsBetweenGraph {...props}
                           fromSynsetId={props.fromSynsetId}
                           toSynsetId={GERNEDIT_ROOT_ID}
                           onlyShortest={false} />
    );
}
