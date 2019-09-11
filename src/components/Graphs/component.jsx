import { doGraphRetrieval } from './actions';
import { selectD3Data } from './selectors';
import { dataContainerFor } from '../DataContainer/component';
import { connectWithApiQuery } from '../APIWrapper';
import { isVisible } from '../../helpers';

import * as d3 from 'd3';
import { connect } from 'react-redux';
import React from 'react';

// Layout sizing:
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 800;
const DEFAULT_MARGIN = 20;

// Transitions:
const DEFAULT_TRANSITION_DURATION = 750;

// Nodes:
function DEFAULT_NODE_CLICK_HANDLER(d) {
    return null;
}
const DEFAULT_NODE_RADIUS = 5;
const DEFAULT_NODE_COLORS = {
    // TODO: decide on some nice-looking defaults here
    unselected: 'gray',
    selected: 'green',
    unchosen: '',
    chosen: '',
    root: 'pink'
};
const DEFAULT_NODE_CLASS = 'node';
// What matters here is the *ratio* of the x and y separation values,
// which determines how quickly the tree "spreads out" in one
// dimension relative to the other when laid out. These values seems
// to provide a reasonable default for hyper/hyponym trees drawn in a
// desktop browser; YMMV:
const DEFAULT_NODE_SEP = [DEFAULT_WIDTH / 10,
                          DEFAULT_HEIGHT / 8];
const DEFAULT_NODE_LABEL_GAP = 6;
const DEFAULT_NODE_LABEL_ANGLE = -30;
const DEFAULT_NODE_LABEL_SETTINGS = {
    gap: DEFAULT_NODE_LABEL_GAP,
    angle: DEFAULT_NODE_LABEL_ANGLE
};
const DEFAULT_NODE_CONFIG = {
    radius: DEFAULT_NODE_RADIUS,
    colors: DEFAULT_NODE_COLORS,
    class: DEFAULT_NODE_CLASS,
    separation: DEFAULT_NODE_SEP,
    labels: DEFAULT_NODE_LABEL_SETTINGS,
    clickHandler: DEFAULT_NODE_CLICK_HANDLER
};

// Links:
const DEFAULT_LINK_CLASS = 'link';
const DEFAULT_LINK_COLOR = '#555'; // a slightly lighter gray than unselected nodes
const DEFAULT_LINK_THICKNESS = 1.5;
const DEFAULT_LINK_OPACITY = 0.4;
const DEFAULT_LINK_CONFIG = {
    class: DEFAULT_LINK_CLASS,
    color: DEFAULT_LINK_COLOR,
    thickness: DEFAULT_LINK_THICKNESS,
    opacity: DEFAULT_LINK_OPACITY 
};

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
//       clickHandler :: event handler function; given the clicked tree node as argument
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
//       
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

    // Basic dimensions for the chart.  flipScalar is used to orient
    // various elements either upward or downward, 
    const flipScalar = (config.flip ? -1 : 1);
    const width = config.width; 
    const height = config.height * flipScalar;
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
          .style("padding", margin.toString()+'px')
          .attr("font-family", "sans-serif")
          .attr("font-size", 10);

    // The chartContainer is a group ("g") element with the
    // "chart-container" class, and should be the only immediate child
    // of the svg element.  (This must be guaranteed by the caller.)
    // It is used as the point to apply zoom transforms: scaling and
    // translating the chartContainer scales and translates the whole
    // chart.
    const chartContainer = svg.select("g.chart-container");

    // This creates the zoom behavior object and sets the zoomed()
    // function as the handler for zoom events.  We use a very simple
    // 'geometric' zoom for now, meaning every element scales the same
    // amount with zoom level (so circles representing nodes, text,
    // etc. will become very large as the user zooms in).  So all we
    // need to do here is apply the zoom transform to the
    // chartContainer.
    function zoomed() {
        chartContainer.attr("transform", d3.event.transform.toString());
    }
    const zoom = d3.zoom().on('zoom', zoomed);

    // This makes the svg node the listener for zoom events, so we can
    // zoom from anywhere inside the chart.  (We don't use the
    // chartContainer itself as the listener because g elements can
    // only listen for events inside children that have a "fill"
    // attribute; this would prevent zooming when the mouse is over a
    // region of empty space.)
    svg.call(zoom);

    
    // D3's tree layout assigns x and y coordinates to each node in
    // the tree.  These coordinates will be referred to as the "tree"
    // coordinates, since their maximum and minimum values determine
    // the rectangle around (0,0) on which the tree (or trees) is laid
    // out, and which therefore determine the size of the whole chart.
    // In the tree coordinates, root is always at (0,0), and x and y
    // can run arbitrarily far in either the negative or positive
    // direction, depending on how many nodes are in the tree.
    //  
    // The "view box" coordinates, by contrast, represent the portion
    // of the chart that is *visible* inside the svg element.  The
    // view box has a fixed width and height, determined by
    // config.width and config.height.  In the view box coordinates,
    // (0,0) represents the upper left corner, and (config.width,
    // config.height) the bottom right.
    //
    // The two scales returned by this function, xScale and yScale,
    // map the tree coordinates for a group of nodes into the view box
    // coordinates, and therefore determine which part of the chart is
    // visible.  We wait to call this function until after all the
    // nodes have been placed in the DOM, and can be gathered into a
    // single selection, because the chart might include nodes
    // outside the tree we are currently drawing.
    function scalesFor(nodeSelection) {
        // Since we are using the .nodeSize layout, which assigns x
        // and y values to nodes in the tree coordinates based on how
        // far apart the nodes should be, we do not know the extent of
        // the tree coordinates in advance; their maximum and minimum
        // depend on the number of nodes in the tree.  Thus, we need
        // to calculate their extent based on all the data in a given
        // selection of nodes before we can determine their domain.
        const allNodePositions = nodeSelection.data();
        const [ xmin, xmax ] = d3.extent(allNodePositions, d => d.x);
        const [ ymin, ymax ] = d3.extent(allNodePositions, d => d.y);

        const xScale = d3.scaleLinear()
              .domain([ xmin, xmax ]) // tree coordinates
              .range([0, config.width]); // view box coordinates
        const yScale = d3.scaleLinear()
              .domain([ ymin, ymax ])
              .range([0, config.height]);

        return [xScale, yScale];
    }


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
            .attr("dy", "0.35em") // TODO: move to config
            .attr("x", flipScalar * config.nodes.labels.gap)
            .attr("text-anchor", config.flip ? "end" : "start")
            .text(d => d.data.name)
            .attr("transform", `rotate(${config.nodes.labels.angle})`)
            // again, the white outline:
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

    // All nodes receive the 'unselected' color by default; those
    // which have been selected transition to a new color below.
    currentNodes.selectAll("circle")
        .attr("fill", config.nodes.colors.unselected);


    // At this point, elements have been created in the DOM for the
    // nodes in the tree.  Thus, we can now create the scales for the
    // chart based on a selection of all the nodes in the *chart*,
    // including those outside the current tree.  This is important so
    // we can ensures that the whole chart is visible before any
    // zooming takes place.
    const allNodes = nodeContainer.selectAll("g");
    const [ xScale, yScale ] = scalesFor(allNodes);
    
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
              // We mark incoming links with an 'incoming' class for
              // the sake of re-selecting and transitioning them later
              .classed(`incoming ${config.links.class}`, true)
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
              .attr("stroke-opacity", 0.0);
    
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
    function moveNodes(nodeSelection) {
        return nodeSelection.transition() 
            .duration(config.duration)
            .attr("transform", d => `translate(${d.x},${d.y})`);
    }
    moveNodes(currentNodes);

    // This transition colors nodes which have been marked as
    // 'selected' by the user, as represented by the .selected
    // property on nodes in the tree data and the original hierarchy.
    function colorSelectedNodes(nodeSelection) {
        return nodeSelection.filter(d => d.data.selected)
            .selectAll("circle")
            .transition()
            .duration(config.duration)
            .attr("fill", config.nodes.colors.selected);
    }
    colorSelectedNodes(currentNodes);

    // This transition moves the link elements to their new positions.
    // Again, we apply it to all links in the current tree, since
    // adding nodes can cause existing links to shift around.
    function moveLinks(linkSelection) {
        return linkSelection.transition()
            .duration(config.duration)
            .attr("d", d3.linkVertical()
                  .x(d => d.x)
                  .y(d => d.y));
    }

    // This transition fades in new links, from 0 (transparent) to
    // their target opacity.
    function fadeInNewLinks(linkSelection) {
        return linkSelection
            // remove the 'incoming' class before running the transition:
            .attr("class", config.links.class)
            .transition() 
            .duration(config.duration)
            .attr("stroke-opacity", config.links.opacity);
    }
    const newLinks = linkContainer.selectAll("path.incoming");

    // We wait to fade in the new links until all the links have been
    // moved, so that we don't see new links in the wrong positions:
    moveLinks(currentLinks).on("end", () => fadeInNewLinks(newLinks));

}

export class VerticalTreeGraph extends React.Component {

    constructor(props) {
        super(props);
        this.svgRef = React.createRef();
    }

    componentDidMount() {
        // TODO: construct config instead of just passing props?
        D3VerticalTreeGraph(this.svgRef.current, this.props.data, {...this.props});
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data) {
            D3VerticalTreeGraph(this.svgRef.current, this.props.data, {...this.props});
        }
        resetViewBox(this.svgRef.current);
    }

    render() {
        const width = this.props.width;
        const flipScalar = this.props.flip ? -1 : 1;
        const height = this.props.height;
        const margin = this.props.margin;
        const ymin = (this.props.flip? flipScalar * height : 0) + (-1 * flipScalar * margin);
        const viewBox = `0 ${ymin} ${width} ${height}`;
        
        return (
            // after long hours of searching and experimenting, I have
            // learned that the svg element won't display properly unless
            // at least one of the dimensions is constrained; there's a
            // good explanation here: https://css-tricks.com/scale-svg/
            <svg ref={this.svgRef} width={width} height={height} viewBox={viewBox}>
              <g id="links"/>
              <g id="nodes"/>
            </svg>
        );
    }

}
VerticalTreeGraph.defaultProps = {
    margin: DEFAULT_MARGIN,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    duration: DEFAULT_TRANSITION_DURATION,
    nodes: DEFAULT_NODE_CONFIG,
};

export class VerticalDoubleTreeGraph extends React.Component {

    constructor(props) {
        super(props);
        this.svgRef = React.createRef();
        this.drawTrees = this.drawTrees.bind(this);
        this.initialDimenions = this.initialDimensions.bind(this);
    }

    initialDimensions() {
        const width = this.props.width;
        const canvasHeight = this.props.height;
        const treeHeight = canvasHeight / 2;
        const margin = this.props.margin;
        const xmin = -0.5 * width;
        const ymin = (-1 * treeHeight) + (-1 * margin);
        const viewBox = [xmin, ymin, width, canvasHeight];
        return {
            width,
            canvasHeight,
            treeHeight,
            margin,
            xmin,
            ymin,
            viewBox
        };
    }

    drawTrees() {
        const dim = this.initialDimensions();
        const upwardConfig = {
            duration: this.props.duration,
            nodes: {...this.props.nodes, clickHandler: this.props.nodeClickHandler, class: 'upward'},
            links: {...this.props.links, class: 'upward'},
            flip: true,
            height: dim.treeHeight,
            ...dim,
        };
        const downwardConfig = {
            duration: this.props.duration,
            nodes: {...this.props.nodes, clickHandler: this.props.nodeClickHandler, class: 'downward'},
            links: {...this.props.links, class: 'downward'},
            flip: false,
            height: dim.treeHeight,
            ...dim,
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
        // todo: this re-draws too often.
        if (prevProps.data != this.props.data) {
            this.drawTrees();
        }
    //    resetViewBox(this.svgRef.current);
    }

    render() {
        // We need to wrap the SVG in a container div to get it to
        // scale to fit the container.  The container must have
        // (max-)width/(max-)height properties for this, and for the
        // overflow property to work.  We then set the SVG viewBox
        // using the width and height of the container.  See:
        //   https://css-tricks.com/scale-svg/

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

        // I am here using "Option 3" as described on that page.

        // TODO: need to do away with element ids, here and above,
        // because there might be more than one graph on a page.
        
        const dim = this.initialDimensions();
        
        return (
            <div className="graph-container" style={{"max-height": dim.canvasHeight.toString() + 'px',
                                                     "max-width": dim.width.toString() + 'px',
                                                     "overflow": "scroll"}} >
              <svg ref={this.svgRef} height="auto" viewBox={`0 0 ${dim.width} ${dim.canvasHeight}`}>
                <g className="chart-container">
                  <g className="links"/>
                  <g className="nodes"/>
                </g>
              </svg>
            </div>
        );
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




class HyperHypoGraph extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            // default values for these props are set in defaultProps, below
            chartWidth: this.props.width - this.props.margin.right - this.props.margin.left,
            centralWidth:(this.props.width - this.props.margin.right - this.props.margin.left) / 2,
            chartHeight:this.props.height - this.props.margin.top - this.props.margin.bottom,
            centralHeight:(this.props.height - this.props.margin.top - this.props.margin.bottom)/2,
            linkLength: this.props.linkLength,
            duration: this.props.duration,
            directions: ['upward', 'downward']
        };
    }
    
    componentDidMount() {
        this.createTreeGraph();
    }
    
    // TODO: is this really needed?
    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data) {
            this.createTreeGraph();
        }
    }
    
    // tree function to disable right click
    disableRightClick() {
        if (d3.event.button == 2) {
            console.log('right click disabled');
            d3.event.stopImmediatePropagation();
        }
    }
    
   
    createTreeGraph() {
        // user interaction -> zoom and click-drag
        //TODO: event
        const redraw = () => d3.select('.graph')
              .attr('transform', 
                    `translate(${d3.event.transform.x},${d3.event.transform.y}) 
            scale(${d3.event.transform.k})`);
        const zoom = d3.zoom().scaleExtent([0.1, 2]).on('zoom', redraw); //TODO: zoom
        d3.select('svg').remove(); //remove old graphs so updates are clean
        
        const svg = d3.select('.tree-graph')
              .append('svg')
              .attr('width', this.props.width)
              .attr('height', this.props.height)
              .on('mousedown', this.disableRightClick)
              .call(zoom)
              .on('dblclick.zoom', null);
        
        // set margins for graph group
        const graph = svg
              .append('g')
              .attr('width', this.state.chartWidth)
              .attr('height', this.state.chartHeight)
              .attr('transform',`translate(${this.props.margin.left},${this.props.margin.top})`)
              .attr('class','graph');
        
        // data[0] is the only item in the data container; it is the tree
        // data for the root node
        const data = this.props.data[0];

        // text for the root node
        graph
            .append('text')
            .text(data.upward.originName) 
            .attr('class', 'centralText font-weight-bold')
            .attr('x', this.state.centralWidth)
            .attr('y', this.state.centralHeight + 5)
            .attr('text-anchor', 'middle');
        
        // Initialise the 2 trees (upward and downward portions)
        for (const i in this.state.directions) {
            const direction = this.state.directions[i];
            const dataDir = data[direction];
            dataDir.x0 = this.state.centralWidth;
            dataDir.y0 = this.state.centralHeight;
            this.updateTreeGraph(dataDir, dataDir, graph);
        }
    }

    updateTreeGraph(sourceData, originalData, graph) {
        // 0: Set up the upward vs downward separation.
        const direction = originalData.direction;
        const downwardSign = direction === 'upward' ? -1 : 1;
        const nodeClass = direction + 'Node';
        const linkClass = direction + 'Link';
        const nodeColor = (direction === 'upward') ? '#37592b' : '#8b4513';
        const nodeSpace = 60;
        
        // 0a: setup Tweens for Transitions
        // const t = d3.transition().duration(this.state.duration); //TODO: the link enter transition
        
        function linksInitTween(d) {
            return function interpolationAt(tick) {
                // d3.interpolate(0) returns a function with
                // start cond x0, y0, end cond d.x d.y
                d3.interpolate(0)(tick);
            };
        }
        
        //0b: clicking functions
        

        // 1. update scales (domains) if they rely on our data
        
        // 2. join updated data to elements
        const tree = d3.tree().nodeSize([nodeSpace,0]);
        if (direction === 'upward') { //otherwise root will move dep on downward nodes
            tree.size([this.state.chartWidth, this.state.chartHeight]);
        }
        
        const treeData = tree(d3.hierarchy(originalData)); // adds x, y props to Nodes 
        const dataForRender = treeData.descendants(); 
        const nodes = graph.selectAll(nodeClass).data(dataForRender); // join the data
        
        let offsetX = 0;
        if (direction === 'downward') {
            let childrenNodes =
                treeData[treeData.children ? 'children' : '_children'];
            if (childrenNodes) offsetX = d3.min([childrenNodes[0].x, 0]);
        }
        
        // Normalize for fixed-depth.
        dataForRender.forEach(d => {
            d.y = downwardSign * (d.depth * this.state.linkLength) + this.state.centralHeight;
            d.x = d.x - offsetX;
            
            if (direction === 'downward' && d.data.name !== 'origin') d.y += 20; //bump the lower ones down a bit
            
            // Position for origin node.
            if (d.data.name === 'origin') {
                d.x = this.state.centralWidth;
                d.y += downwardSign * 25;
            }
        });
        
        // 3. remove unwanted (if any) shapes using the exit selection
        const nodeExit = nodes
              .exit()
              .attr('fill','red')
              .transition()
              .attr('transform', d => `translate(${sourceData.x}, ${sourceData.y})`) //TODO:
              .remove();
        nodeExit.select('circle').attr('r', 1e-6); //make them disappear (but still be in dom)
        nodeExit.select('text').style('fill-opacity', 1e-6);
        
        // 4. update current shapes in the dom
        // var node = graph.selectAll('graph.' + nodeClass)
        //   .data(dataForRender, (d) =>  d.id || (d.id = ++id));
        // 5. append the enter selection to the dom (at parents prev posn)
        //note: for if new els were added to data
        const nodesEnter = nodes.enter()
              .append('g')
              .attr('class', nodeClass)
              .attr('transform', d => `translate(${sourceData.x0}, ${sourceData.y0})`); //start point for enter transition (middle root)

        nodesEnter.append('circle')
            .attr('r', 1e-6)
            .attr('fill','pink');

        nodesEnter
            .append('text')
            .attr('x', d => (direction === 'upward' ? -10 : 10))
            .attr('dy', '.35em')
            .attr('text-anchor', d => (direction === 'upward' ? 'end' : 'start'))
            .style('fill', d => d.data.name === 'origin' && nodeColor) //col for 'click fold/expand'
            .style('fill-opacity', 1e-6)
            .attr('transform', d => (d.data.name !== 'origin' ? 'rotate(-20)' : ''))
            .text(d => {
                if (d.data.name == 'origin') return ''; //'[Click to fold/expand all]'; // Text for origin node.
                return d.data.name;
            })
            .style('cursor', d => 'pointer')
            .on('click', d => {
                // TODO: probably don't want to fire a query on every click...?
                this.props.query({ synsetId: d.data.id });
                this.props.choose(d.data.id);
            });

        // Transition nodes to their new position.
        //end point for enter nodes transition. x0,y0 -> x,y straight line translation
        const nodeUpdate = nodesEnter 
              .transition()
              .attr('transform', d => `translate(${d.x}, ${d.y})`); 

        nodeUpdate.select('circle')
            .attr('r', 9)
            .style('fill', d => (d._children || d.children ? nodeColor : ''))
            .style('fill-opacity', d => d.children && 0.6);
        nodeUpdate.select('text').style('fill-opacity', 1);


        // LINKS
        const diagonal = d3.linkVertical().x(d => d.x).y(d => d.y);

        const links = graph.selectAll('.link')
              .data(treeData.links()); //get links selection and join data -> gives source/target info

        // 3. Links exit
        links.exit().transition().duration(this.state.duration)
            .attr('d', function (d) {
                var o = { x: sourceData.x, y: sourceData.y };
                return diagonal({ sourceData: o, target: o });
            }).remove();

        // 4. Links in dom
        // 5. Links enter
        links.enter().insert('path', 'g')
            .attr('class', linkClass)
            .attr('d', d3.linkVertical().x(d => d.x).y(d => d.y))
            .attr('fill', 'none')
            .attr('stroke', '#aaa')
            .attr('stroke-width', 3);

        links.transition().duration(this.state.duration);

        // Stash the old positions for transition.
        dataForRender.forEach(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    render() {
        if (!(this.props.data)) return null;
        return <div className="tree-graph" />;
    }
}

HyperHypoGraph.defaultProps = {
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    width: 1500,
    height: 1000,
    linkLength: 100,
    duration: 600
};

