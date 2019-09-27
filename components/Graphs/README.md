# Graphs 

This directory defines components for displaying animated graphs of
relation data, such as [conceptual relations](../ConRels).

## Data object

The graph components expect to be passed one or more *trees*.  A tree
is a recursive data object, consisting of *nodes* that have the
following properties:

  - `id`: a unique identifier for the node
  - `name`: a label to display for the node
  - `children`: a (possibly empty) array of node objects with these
    same properties
    
A tree is simply a node object representing the root node of the tree.
Additional properties can be provided on nodes, but all nodes should
define at least these three properties.
    
## Components defined here

`VerticalTreeGraph`: draws a single tree, either upward or downward,
from a root node.

`VerticalDoubleTreeGraph`: draws two trees, one upward and one
downward, from a common root node.

There are *many* configuration options available to tweak the
appearance and animation of the graphs; see the constants section in
the code for complete documentation.

### Example

```
import { components } from '@sfstuebingen/germanet-common';
const { VerticalTreeGraph } = components;

<VerticalTreeGraph tree={someTree} flip={true} />
```
