import { doGraphRetrieval } from './actions';
import { selectD3Data } from './selectors';
import { dataContainerFor } from '../DataContainer/component';
import { connectWithApiQuery } from '../APIWrapper';

import * as d3 from 'd3';
import { connect } from 'react-redux';
import React from 'react';

// Layout sizing:
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 800;
const DEFAULT_MARGIN = 20;
const DEFAULT_RADIUS = DEFAULT_WIDTH / 2;

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
const DEFAULT_NODE_SEP = [DEFAULT_WIDTH / 10,
                          DEFAULT_HEIGHT / 8];
const DEFAULT_NODE_CONFIG = {
    radius: DEFAULT_NODE_RADIUS,
    colors: DEFAULT_NODE_COLORS,
    class: DEFAULT_NODE_CLASS,
    separation: DEFAULT_NODE_SEP,
    clickHandler: DEFAULT_NODE_CLICK_HANDLER
};

// Links:
const DEFAULT_LINK_CLASS = 'link';
const DEFAULT_LINK_CONFIG = {
    class: DEFAULT_LINK_CLASS
};

function D3VerticalTreeGraph(svgNode, data, config) {
    // adapted from https://observablehq.com/@d3/cluster-dendrogram
    const hier = d3.hierarchy(data);
    const width = config.width; 
    const flipScalar = (config.flip ? -1 : 1);
    const height = config.height * flipScalar;
    const margin = config.margin;
    const sep = config.nodes.separation;
    const root = d3.tree().nodeSize([sep[0], sep[1] * flipScalar])(hier);

    const svg = d3.select(svgNode)
          .style("max-width", "100%")
          .style("height", "auto")
          .style("padding", margin.toString()+'px')
          .attr("font-family", "sans-serif")
          .attr("font-size", 10);

    function pathKey(d) {
        // a path is identified by the IDs of its source and target nodes:
        return `${d.source.data.id}to${d.target.data.id}`;
    }
    function appendNewLinks(enter) {
        const newLinks = enter.append("path")
              .attr("class", config.links.class)
              .attr("d", d3.linkVertical()
                    .x(d => d.x)
                    .y(d => d.y))
              .attr("stroke", "white");
    
        return newLinks;
    }
    const links = svg.selectAll("g#links")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", 1.5)
          .selectAll(`.${config.links.class}`)
          .data(root.links(), pathKey)
          .join(
            enter => appendNewLinks(enter)
          );
    
    // we handle the root node separately, to allow drawing multiple
    // trees with the same root, coloring the root separately, etc.
    function appendRootNode(enter) {
        const rootNode = enter.append("g")
              .attr("id", "root")
              .attr("transform", d => `translate(${d.x},${d.y})`);

        // root gets a special color
        rootNode.append("circle")
            .attr("r", config.nodes.radius)
            .attr("fill", config.nodes.colors.root);
    
        // root text is drawn flat and to the right
        rootNode.append("text") 
            .attr("x", 6)
            .attr("text-anchor", "start")
            .text(d => d.data.name)
            .clone(true).lower()
            .attr("stroke", "white");

        return rootNode;
    }
    const rootNode = svg
          .selectAll("g#nodes")
          .selectAll("g#root")
          .data([root], nodeKey)
          .join( enter => appendRootNode(enter));
    // TODO: root node click handler?
    
    function nodeKey(d) {
        // a node is identified by the .id of its datum
        return d.data.id;
    }
    function appendNewNodes(enter) {
        
        const newNodes = enter.append("g")
              .on("click", config.nodes.clickHandler)
              .attr("class", config.nodes.class)
              .attr("transform", d => {
                  // start new nodes at the same position as the
                  // parent (if they have one) so they 'grow out'
                  // during the transition:
                  const parent = d.ancestors()[1] || d;
                  return `translate(${parent.x},${parent.y})`;
              });
        
        newNodes.append("circle")
            .attr("r", config.nodes.radius);
    
        newNodes.append("text")
            .attr("dy", "0.35em")
            .attr("x", flipScalar * 6)
            .attr("text-anchor", config.flip ? "end" : "start")
            .text(d => d.data.name)
            .attr("transform", "rotate(-30)")
            .clone(true).lower()
            .attr("stroke", "white");

        return newNodes;

    }

    const nodes = svg.selectAll("g#nodes")
          .attr("class", "nodes")
          .attr("stroke-linejoin", "round")
          .attr("stroke-width", 3)
          .selectAll(`.${config.nodes.class}`)
        .data(root.descendants().slice(1), nodeKey)
        .join(
            enter => appendNewNodes(enter)
        );
    // it is important to re-bind the click handler for *all* nodes, since
    // it can depend on the value of the rendering component's props,
    // and those might have changed
    nodes.on("click", config.nodes.clickHandler);

    // all nodes are unselected by default; those which have
    // been selected transition to a new color below
    nodes.selectAll("circle")
        .attr("fill", config.nodes.colors.unselected);

    // Remove now-hidden nodes and edges:
    nodes.exit().remove();
    links.exit().remove();

    // Transition all elements to their new positions:
    function transitionNodes() {
        nodes.transition() 
            .duration(config.duration)
            .attr("transform", d => `translate(${d.x},${d.y})`);
        nodes.filter(d => d.data.selected)
            .selectAll("circle")
            .transition()
            .duration(config.duration)
            .attr("fill", config.nodes.colors.selected);
    }

    function transitionLinks() {
        return links.transition()
            .duration(config.duration)
            .attr("d", d3.linkVertical()
                  .x(d => d.x)
                  .y(d => d.y));
    }
    function fadeInNewLinks() {
        return links.transition() 
            .duration(config.duration)
            .attr("stroke", "#555");
    }
    function resetViewBox() {
        // recompute the view box for the svg element so the browser
        // can scale it automatically.  This *would* be super easy
        // through the browser .getBBox() API, which works great from
        // the console, but for whatever reason, it doesn't work here,
        // in a setting where the node is initially rendered by React.
        var xmin = 0, xmax= 0, ymin= 0, ymax= 0;
        svg.selectAll("g#nodes").selectAll("g")
            .each(d => {
                xmin = Math.min(xmin, d.x);
                ymin = Math.min(ymin, d.y);
                xmax = Math.max(xmax, d.x);
                ymax = Math.max(ymax, d.y);
            });
        const newWidth = 2 * Math.max(xmax, Math.abs(xmin)) + 2 * margin;
        const newHeight = 2 * Math.max(ymax, Math.abs(ymin)) + 2 * margin;
        // don't change the viewbox unless the graph has grown beyond the original boundaries:
        const viewWidth = Math.max(config.width, newWidth);
        const viewHeight = Math.max(config.canvasHeight, newHeight);
        const viewXMin = Math.min(config.xmin, xmin + -1 * margin);
        const viewYMin = Math.min(config.ymin, ymin + -1 * margin);

        svg.attr("viewBox", `${viewXMin} ${viewYMin} ${viewWidth} ${viewHeight}`);
        
    }
    transitionNodes();
    // wait until links are moved to fade in the new links, because
    // otherwise we see them in the wrong place:
    transitionLinks().on("end", fadeInNewLinks);
    resetViewBox();
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
        const dim = this.initialDimensions();
        
        return (
            <div className="graph-container" style={{"max-height": dim.canvasHeight.toString() + 'px',
                                                     "max-width": dim.width.toString() + 'px',
                                                     "overflow": "scroll"}} >
              <svg ref={this.svgRef} height="auto" viewBox={dim.viewBox.join(" ")}>
                <g id="links"/>
                <g id="nodes"/>
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

