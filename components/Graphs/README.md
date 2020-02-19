# Graphs 

This directory defines components for displaying interactive graphs of
relation data, such as [conceptual relations](../ConRels).

## Data object

The graph components expect to be passed an object representing a
graph of a relation. A graph object contains the following properties:

  - `nodes`: an array of objects representing the nodes of the graph.
    Each node should have an `id` property and an `orthForms` array of
    strings, which are used to construct a label for the node.
  - `edges`: an array of objects representing the edges of the graph.
    Each edge should have `from` and `to` properties, which should be
    strings containing the IDs of the nodes connected by the edge.
  - `highlights`: an array of IDs for nodes in the graph that are
    special and should be highlighted when displayed, such as the
    least common subsumers of the two endpoint nodes. The highlights
    array should *not* include the IDs of the two endpoint nodes in a
    graph representing the paths between two endpoints.
    
## Components defined here

`NetworkContainer`: low-level component that interfaces with the
[vis.js](https://visjs.org/) Network library to draw graphs.

`HnymPathsBetweenGraph`: high-level component to render the paths in the
hypernym relation between two synsets via their least common
subsumers. Fetches graph data objects from the backend given two
synset IDs.

`HnymPathsToRootGraph`: high-level component to render all the paths in
the hypernym relation between a given synset and the GNROOT node.

**Note**: by default, the graphs rendered by the components support
zooming and moving via control buttons provided by vis.js. Vis.js
distributes CSS and images for these control buttons with its NPM
package. You must serve these assets from your site if you want the
control buttons to be rendered. Resetting the zoom level to fit the
entire graph on the canvas, in particular, can only be done via these
buttons, so make sure to serve them if you need this function. The
required CSS is at `visjs-network/dist/vis-network.min.css`. The
required images are in `visjs-network/lib/network/img/*.png`, and
should be served from `./img` relative to the URL of the CSS.

There are *many* configuration options available to tweak the
appearance and interactivity of the graphs; see the constants section
in the code and the [vis.js Network
documentation](https://visjs.github.io/vis-network/docs/network/) for
complete details.

### Example

```
import { HnymPathsBetweenGraph } from '@sfstuebingen/germanet-common/components';

<HnymPathsBetweenGraph fromSynsetId={someSynset.id} toSynsetId={someOtherSynset.id} />
```
