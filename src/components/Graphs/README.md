# Graphs 

This directory defines a component for displaying a graph of the
hypernym/hyponym relation, rooted at a particular synset.


## Components defined here

`Graph`: a graph for a particular synset.
The data to draw the graph is fetched from the API.

### Example

```
import { components } from 'germanet-common';
const { Graph } = components;

<Graph synsetId={someSynset.id} />
```
