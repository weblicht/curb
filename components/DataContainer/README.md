# DataContainer

A 'data container' is a component that acts as a container for a set
of *data objects*.  A data object is simply a Javascript object
representing a particular unit of data, such as a particular synset or
lexical unit.

A data container handles three functions:

  1. pulling data objects out of the Redux store into an array. This
     is achieved via a [selector
     function](https://medium.com/@matthew.holman/what-is-a-redux-selector-a517acee1fe8)
     that maps the entire Redux state to an array of data objects.
  2. keeping track of state concerning those objects, e.g., whether
     they have been selected by the user in the UI.  This state is
     managed via Redux: data containers have a standard set of
     actions, and a reducer to handle them.
  3. rendering the data objects in some way that makes sense for them,
     e.g. as a table or form control.  This is achieved by passing a
     *rendering component* as a prop to the data container.

## Component

Data containers are implemented as higher-order components (i.e.,
functions that *return* a React component).  There are two such
components defined here: `dataContainerFor`, which creates a data
container where data is stored as an *array*; and `treeContainerFor`,
which creates a data container where data is stored as a *tree*.

Both of these functions accept three arguments:

  - a name for the type of data in the container
  - a Redux selector function for that data, 
  - a function mapping each object in the container to its unique ID
  
The third argument is optional. If not supplied, it will default to a
function that maps data objects to the value of their `.id` field.
**Note**: it is important to supply this function if your data objects
do not have this field, because many other components assume they will
be able to identify data objects via this function (for example, to
generate keys for table rows or list items).

`dataContainerFor` and `treeContainerFor` return components that you
can instantiate to be a container for a certain type of data. For
example, you call `dataContainerFor` like this:

```
import { dataContainerFor } from '@sfstuebingen/germanet-common/components';

const SynsetsContainer = dataContainerFor('Synsets', selectSynsets);
```

The returned component (`SynsetsContainer`, in the example above) will accept props:

  - `data`: the array of data objects in the container
  - `displayAs`: a component to render the data in this container
  - `containerId`: an identifier for the container
  - `idFor`: the function that maps a data object in the container to
    its unique identifier
  
The `data` will automatically be loaded into the container by the
selector function from the Redux store when the container is rendered,
and the `idFor` function will also be automatically supplied.
You must pass `displayAs` and `containerId` yourself.

So in this example, you could instantiate `SynsetsContainer` like so:

``` 
<SynsetsContainer containerId="searchResults" displayAs={SynsetsAsList} />
``` 

where `SynsetsAsList` is a component that renders an array of
synsets as an HTML list.

## Conventions

### Container types

There are at present two types of containers, representing two common
formats for a set of data objects: *row* containers (created by
`dataContainerFor`) and *tree* containers (created by
`treeContainerFor`).  The two types of container provide the same
props interface, but differ in the data format that they expect from
their selector functions and provide to their rendering components.

### Selector functions

The data objects in a data container are loaded into its `data` prop
from the Redux store by the selector function.  This function should
accept two arguments:

  1. `globalState`, the global state in the Redux store
  2. `ownProps`, the props of the data container component instance
  
It should return the data objects in an appropriate format for the
container, namely:

  - as an array, for a row container
  - as a tree, for a tree container
  
A tree is a recursive data object, consisting of *nodes* representing
the data objects in the container.  Each node must be uniquely
identifiable by the `idFor` function, and must have at least the
`children` property, which should be a (possibly empty) array of
nodes.  A selector function for a tree data container should return
the root node object.

For both types of containers, if the data is not yet in the Redux
store (e.g., if it has not yet been fetched from the API), the
selector function should return `undefined`.  If on the other hand the
data is available but *empty*, the selector function should return a
defined-but-empty value, such as `[]`.  This allows rendering a
different interface when data is unavailable with the
`displayUnavailable` prop; see below.

### "Selecting" and "Choosing" data objects

In a user interface, there are two senses in which an object in a
data container can be 'selected'[^1] by the user:
  
  1. it might be part of a subset of those objects selected from among
     the total set in the container. This is here known as *selecting*
     one or more objects, which can also be *unselected* (think:
     checkboxes).
  2. it might be selected to the exclusion of any other object in the
     container. This is here known as *choosing* an object (think:
     radio buttons).  No more than one object in a container can be
     chosen, although a chosen object can be unchosen.
     
[^1]: Note that these two senses of 'selecting' an object *in a
    user interface* are both different from the sense in which objects
    are selected *from the Redux store* by a selector function
 
**Important**: if you want your data container to support choosing and
selecting data objects inside it, you *must* give it a `containerId` prop that
is unique for the entire application.  This is because the state for
each data container is managed in Redux using its `containerId`.

If a `containerId` is specified, the container will automatically receive
these additional *control* props:

  - `choose`
  - `unchoose`
  - `select`
  - `unselect`

These are callbacks that accept an item ID, and dispatch a Redux
action to indicate that a particular item in the container has been
(un)chosen or (un)selected.  The container also receives an additional
control prop, `reset`, which resets the container to its default
state, where no item is selected or chosen.  These control props will
be passed on to the rendering component.

In addition, the data objects in the `data` prop will have Boolean
`.selected` and `.chosen` properties, which you can test for when
rendering them in the UI.

(The `containerId` prop can be left off.  This is to support creating data
containers in contexts where you might not be able to choose a unique
id, such as when creating a data container programmatically as a child
of another component.  But in that case the container cannot support
choosing and selecting actions.)

### Rendering data in a container 

When instantiating a data container, you must supply a component as
the value of its `displayAs` prop.  This component is responsible for
rendering the data container in a suitable way.

The rendering component will receive all the props from the data
container (except `containerId`), including the data and, if the
container has a `containerId`, the control props.

Several components in the [GenericDisplay](../GenericDisplay)
directory are designed to work well with data containers, and make it
easy to write the rendering component for a data container.  Their
names start with 'Data' (e.g., `DataTable`).  These components make
use of the data container control props if they are given, and pass
them on to their children.

Here is an example of how to write a `displayAs` component for a data
container.  Suppose we have a data container containing synset objects
that we want to display. Here is a definition of a component that
renders the synsets in the container as an ordered list of checkboxes,
where toggling a checkbox will toggle the highlighting of the item in
the list:
```
import { Checkbox, List, ListItem } from '@sfstuebingen/germanet-common/components';

function SynsetsAsHighlightableList(props) {
    if (!(props.data && props.data.length)) return null;

    function toggle(synset) {
        if (synset.selected) {
            props.unselect(synset.id);
        } else {
            props.select(synset.id);
        }
    }

    return (
        <List ordered={true}>
          {props.data.map(
              synset =>
                  <ListItem extras={ {active: synset.selected} }>
                    <Checkbox id={"select-synset-" + synset.id}
                              label={synset.orthForms.join(', ')}
                              checked={synset.selected}
                              onChange={e => toggle(synset)} />
                  </ListItem>
          )}
        </List>
    );
}

// ...
<SynsetsContainer containerId="highlightable-synsets"
                  displayAs={SysetsAsHighlightableList} />

``` 

Notice:

  - the use of the `select` and `unselect` control props in the
    `toggle` function to select and unselect synsets in the data
    container when the checkbox is clicked
  - the use of the `selected` property on the synset data objects to
    set the `active` class on the list item, which highlights the list
    item via CSS, as well as the `checked` attribute on the checkbox

For illustration purposes, the whole list is constructed here
directly, by looping over the synsets in the `data`.  But you can
avoid writing the boilerplate of the containing list and the loop by
using the `SynsetsAsList` display component in [Synsets](../Synsets).
In that case you can reduce this component to one that renders a
single synset as a list item, passing it as the `displayItemAs` prop
to the data container, which will pass it on to `SynsetsAsList`.
Here's what that looks like:

```
import { Checkbox, ListItem, SynsetsAsList } from '@sfstuebingen/germanet-common/components';

function HighlightableSynset(props) {

    const synset = props.data;

    function toggle(e) {
        if (synset.selected) {
            props.unselect(synset.id);
        } else {
            props.select(synset.id);
        }
    }

    return (
        <ListItem extras={ {active: synset.selected} }>
          <Checkbox id={"select-synset-" + synset.id}
                    label={synset.orthForms.join(', ')}
                    checked={synset.selected}
                    onChange={toggle} />
        </ListItem>
    );
}

// ...
<SynsetsContainer containerId="highlightable-synsets"
                  displayAs={SynsetsAsList}
                  displayItemAs={HighlightableSynset} />

```

This is a general pattern that the data containers defined in this
library conform to: if all you need to customize is how individual
data objects are rendered *within* an HTML container like a table or
list, you can just pass a custom component for `displayItemAs`, using
a more generic component provided by the library for the data
container's `displayAs` prop.  Data containers thus make it easy to define
*just the portion of the rendering which is specific to your
application*.

### Sorting data in a container

It is often useful to sort the data in a data container in different
ways.  You can, of course, statically sort the data before displaying
it inside the data container's `displayAs` component.  But it is also
often useful to sort based on state that depends on user interactions,
like clicking a button or choosing a sort order from a dropdown.  To
support this, the DataContainer component provides a `sortWith`
control prop (to containers that have a `containerId`).  This prop
allows you to record a sorting *comparison function* in the data
container's state.  The comparison function detemines how the data is
sorted.

When a data container has a sorting comparison function, the data is
sorted before it is passed to the `displayAs` component.  (It is
sorted *after* adding the `selected` and `chosen` metadata fields to
the data, so your sorting comparison can make use of those.)  Sorting
is currently only implemented for row containers.

Internally, the comparison function is passed to
[Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
and must conform to its interface: it should accept two objects, and
return a negative number if the first object should appear earlier in
the result set, and a positive number if the second object should
appear earlier.  The `comparisonOn` function in [helpers.js](../../)
makes it easy to create such comparison functions for the common case
where you want to compare two objects based on a property that they
both share.

For example, suppose you want to provide a button that sorts a data
container of [LexUnit](../LexUnit) objects based on their `.orthForm`
property. You can do that like this:
```
import { comparisonOn } from '@sfstuebingen/germanet-common/helpers';
import { Button } from '@sfstuebingen/germanet-common/components';

// somewhere inside your container's displayAs component, where the
// .sortWith prop is available: 
const orthFormComparison = comparisonOn('orthForm');

<Button text="Sort by orth form" onClick={e => props.sortWith(orthFormComparison)} />
```

### Rendering containers when data is not available

The component passed as the container's `displayAs` prop will only be
rendered when the data for the container is *available*: that is, when
the container's selector function does not return `undefined`.  If you
need to render something even when data is not available, pass a
component as the value of the `displayUnavailable` prop.

The `displayUnavailable` component, if given, *only* renders when the
data is `=== undefined`, and not when the data is defined-but-empty
(e.g., an empty array).  This allows you to render a different user
interface when e.g. you are still waiting for data to be returned by
the backend, vs. when the backend has returned but there is no data to
display. The `displayUnavailable` component receives all the same prop
values that the `displayAs` component would (except of course `data`).

If `displayUnavailable` is not a component, the data container will
not render anything (i.e., it will render as `null`) until data is
available.  Thus, you do not need to check whether `props.data` is
undefined inside your `displayAs` component.  (You may, however, still
need to check whether it is defined-but-empty.)
