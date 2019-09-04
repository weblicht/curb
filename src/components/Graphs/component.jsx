import { doGraphRetrieval } from './actions';
import { selectD3Data } from './selectors';
import { dataContainerFor } from '../DataContainer/component';
import { connectWithApiQuery } from '../APIWrapper';

import * as d3 from 'd3';
import { connect } from 'react-redux';
import React from 'react';

// these functions automatically set the viewBox of a graph so that it
// includes the entire image
function autoViewBox() {
    // .getBBox is a browser API on <svg> elements that makes it easy
    // to compute the size of the box needed to display the element.
    // It is, however, very finicky; browsers throw an error, or do
    // the wrong thing, if it is called before the element is actually
    // rendered by the browser, which does not play well with React's
    // virtual DOM.  Thus, we need to wrap this in a try/catch block,
    // and call it on component updates.  'this' is bound by the .attr
    // selection in resetViewBox.
    try {
        const {x, y, width, height} = this.getBBox(); 
        return [x, y, width, height];
    } catch(e) {
        return [0, 0, 0, 0];
    }
}
function resetViewBox(svg) {
    d3.select(svg).attr("viewBox", autoViewBox);
}


const DEFAULT_WIDTH = 600;
const DEFAULT_RADIUS = DEFAULT_WIDTH / 2;

function D3RadialTreeGraph(svgNode, data, config) {
   
    const radius = config.radius || DEFAULT_RADIUS;
    const tree = d3.cluster().size([2 * Math.PI, radius - 100]);

    const root = tree(d3.hierarchy(data)
                      .sort((a, b) => (a.height - b.height) || a.data.name.localeCompare(b.data.name)));

    const svg = d3.select(svgNode)
          .style("max-width", "100%")
          .style("max-height", "100%")
          .style("height", "auto")
          .style("font", "10px sans-serif")
          .style("margin", "5px");

    const fullGraph = svg.append("g");
    
    const link = fullGraph.append("g") // <g> groups elements in SVG for inheritance of styling
          .attr("fill", "none")
          .attr("stroke", "#555")
          .attr("stroke-opacity", 0.4)
          .attr("stroke-width", 1.5)
          .selectAll("path")
    // root.links returns an array of links for the root node: objects that have nodes as .source and .target properties
    // .data binds these links to the paths
          .data(root.links()) 
    // <path> element is an SVG path. .enter loads the link objects
    // "If there are fewer nodes than data, the extra data elements form the enter selection, which you can instantiate by appending to the enter selection."
          .enter().append("path")
    // the "d" attribute defines the shape of the path
          .attr("d", d3.linkRadial()
                .angle(d => d.x)
                .radius(d => d.y));

    // now, the dom should look like <svg><g><path d=...>...</path>...</g></svg>
    
    const node = fullGraph.append("g")
          .attr("stroke-linejoin", "round")
          .attr("stroke-width", 3)
          .selectAll("g")
          .data(root.descendants().reverse())
          .enter().append("g")
          .attr("transform", d => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${d.y},0)
      `);
    
    node.append("circle")
        .attr("fill", d => d.children ? "#555" : "#999")
        .attr("r", 2.5);
    
    node.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
        .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
        .text(d => d.data.name)
        .filter(d => d.children)
        .clone(true).lower()
        .attr("stroke", "white");
}


export class RadialTreeGraph extends React.Component {

    constructor(props) {
        super(props);
        this.svgRef = React.createRef();
    }

    componentDidMount() {
        // TODO: construct config instead of just passing props?
        const svg = this.svgRef.current;
        D3RadialTreeGraph(svg, this.props.data, {...this.props});
    }

    componentDidUpdate(prevProps) {
        resetViewBox(this.svgRef.current);
    }

    render(){
        return (
            // TODO: initial size?
            // 
            // after long hours of searching and experimenting, I have
            // learned that the svg element won't display properly unless
            // at least one of the dimensions is constrained; there's a
            // good explanation here: https://css-tricks.com/scale-svg/
            //
            // For now, I'm just setting a fixed height of 600px so I
            // can get back to making the actual logic work
            <svg ref={this.svgRef} viewBox="0 0 100 100" height="600"/>
        );
    }

}

function D3VerticalTreeGraph(svgNode, data, config) {
    var debug;
    
    // adapted from https://observablehq.com/@d3/cluster-dendrogram
    var hier = d3.hierarchy(data);
    // TODO: I don't really understand how the numbers passed to "size" work.
    // In at least one example I saw, they should be the same as the width and height of the svg element.
    // What seems to matter is not their units but their ratio: roughly, the
    // tree spreads out faster in whichever dimension's number is
    // bigger.  But this is good enough for now...
    //root = d3.tree().size([1000, 300])(root);
    var deepest = hier.descendants().slice(-1)[0];
    var root = d3.tree().size([1000, 100 * deepest.depth])(hier);

    const svg = d3.select(svgNode)
          .style("max-width", "100%")
          .style("height", "auto")
          //.style("font", "10px sans-serif")
          .style("padding", "20px")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10);
    
    function pathKey(d) {
        // a path is identified by the IDs of its source and target nodes:
        return `${d.source.data.id}to${d.target.data.id}`;
    }
    const links = svg.selectAll("g#links")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", 1.5)
          .selectAll("path")
            .data(root.links(), pathKey);

    const newLinks = links.enter().append("path")
          .attr("d", d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y))
          .merge(links);
    
    const oldLinks = links.exit().remove();
    
    function nodeKey(d) {
        // a node is identified by the .id of its datum
        return d.data.id;
    }
    const nodes = svg.selectAll("g#nodes")
          .attr("class", "nodes")
          .attr("stroke-linejoin", "round")
          .attr("stroke-width", 3)
          .selectAll("g")
          .data(root.descendants(), nodeKey);

    const newNodes = nodes
          .enter().append("g")
          .on("click", config.nodeClickHandler)
          .attr("transform", d => `translate(${d.x},${d.y})`);
    
    newNodes.append("circle")
        .attr("fill", d => d.data.children.length ? "#555" : "#999") // todo: this isn't working
        .attr("r", 5) ;
    
    newNodes.append("text")
        .attr("dy", "0.35em")
        .attr("x", d => d.children ? -6 : 6)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name)
        .attr("transform", "rotate(-30)")
        .clone(true).lower()
        .attr("stroke", "white");

    newNodes.merge(nodes);

    const oldNodes = nodes.exit().remove();

    // On update, it is important to re-bind the click handler, since
    // it can depend on the value of the rendering component's props,
    // and those might have changed
    const nodesUpdate = nodes
          .on("click", config.nodeClickHandler)
    // Transition nodes to their new positions:
          .transition() 
          .duration(750)
          .attr("transform", d => `translate(${d.x},${d.y})`);
    // Transition links to their new positions:
    const linksUpdate = links.transition()
          .duration(750)
          .attr("d", d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y));

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

    render(){
        return (
            // TODO: initial size?
            // 
            // after long hours of searching and experimenting, I have
            // learned that the svg element won't display properly unless
            // at least one of the dimensions is constrained; there's a
            // good explanation here: https://css-tricks.com/scale-svg/
            //
            // For now, I'm just setting a fixed height of 600px so I
            // can get back to making the actual logic work
            <svg ref={this.svgRef} viewBox="0 0 100 100" height="600">
              <g id="links"/>
              <g id="nodes"/>
            </svg>
        );
    }

}



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

// We use a data container here to automatically get access to
// choosing/selecting functions, even though the array of data will
// consist of a single object for now.
function propsToParams(props) {
    return { synsetId: props.synsetId };
}
var GraphsContainer = dataContainerFor('Graphs', selectD3Data,
                                       tree => tree.upward.id);
GraphsContainer = connectWithApiQuery(GraphsContainer,
                                      { doQuery: doGraphRetrieval },
                                      propsToParams
                                     );

function Graph(props) {
    return (<GraphsContainer {...props} displayAs={HyperHypoGraph} />);
}

export { Graph };
