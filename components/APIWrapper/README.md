# APIWrapper

**Note**: this README is directed at programmers working internally on
this library (rather than programmers who are *using* this library
from another application), since the whole point is that external
users of this library shouldn't have to worry about the details of
loading data via the API.

An API wrapper is a higher-order component for transparently
interacting with the backend API for Germanet data.  Given a component
for rendering some data (typically a
[DataContainer](../DataContainer)), it returns a component which will
emit a Redux action to query that data from the API when the data is
not yet present.

To wrap a component with an API wrapper, you need to define actions
and reducers which manage the process of retrieving the data from the
API and loading it into the Redux store.  There are three important
functions here that help with that task:

1. `connectWithApiQuery` (in [component.jsx](./component.jsx)) is a
    higher-order component that wraps a given component with the
    functions necessary to fetch data via an API query
2. `makeQueryActions` (in [actions.js](./actions.js)) provides a simple
    and consistent way to define action types and action creators for
    making API queries.
3. `makeSimpleApiReducer` (in [reducers.js](./reducers.js)) extracts
    the logic of handling API responses in the simple case where all
    that's needed is to stick the data from the API response into the
    Redux store

## API call conventions

### 'Querying' vs. CRUD operations

There is an important distinction between two kinds of API calls:

  1. calls that provide some criteria for querying the underlying
     database, and return the results of the query.  Such calls are
     always GET requests.  In these calls, it is not known whether
     there will be zero, one, or many results; any list of results is
     a successful response.  These are here known as *query* calls.
  2. calls that concern one particular data object.  Such calls
     can use various HTTP methods to represent different 'CRUD'
     operations on that object (create, retrieve, update, delete).  It
     is an error in these calls if the information in the request is
     not sufficient to determine a *unique* object to which the
     operation applies.
     
At the moment, this library only supports query calls, but may in the
future gain support for CRUD operations; and the URL scheme has been
designed with this in mind.
  
### URL scheme

Every GermaNet data type (synsets, lex units, etc.) has a corresponding API
endpoint defined in [constants.js](../../constants.js).  Queries that
should return that data type are made as GET requests to the endpoint
with query parameters in the URL:

```
/<data type>?<query parameters>
```

e.g., `/lexunits?synsetId=someId` or `/synsets?word=someLemma&ignoreCase=true`.

If support for CRUD operations is added in the future, such calls will
put the identifier in the URL path (when it is known):

```
/<data type>/<identifier>
```

The type of operation can then be represented via the request method
(POST for update, DELETE for delete, and so on).  A create operation
can be a PUT request to `/<data type>` without an identifier.

## Defining API actions

Managing the request-response cycle for querying the API for data
generally requires three types of actions in Redux (see the [Redux
async actions](https://redux.js.org/advanced/async-actions) tutorial):
one to indicate a request has been made; another to indicate a
response was returned successfully; and a third to indicate when the
response returns an error, rather than the requested data.

You can use the `makeQueryActions` function to create these action
types, as well as the associated action creators, for a given type of
data.  This function has two mandatory arguments:

  1. `prefix`, a string used to name the action types
  2. `endpoint`, a URL

It returns an object with the following properties:

  - `actionTypes`, an object whose properties are the names of the
    action types to be handled by the corresponding reducer.  These
    look like `<PREFIX>_<ACTION>`, e.g., `LEX_UNITS_REQUESTED`.
  - `queryActions`, an object whose properties are the action creators
    for the three types of action involved in an API request.

The important thing to know is that `queryActions.doQuery` is an
asynchronous action creator that manages the whole request-response
cycle, and API wrappers rely on having such a `doQuery` function
available to them.  See the code for other details.

## Defining reducers

You must also define a reducer to handle these three types of
actions.  You can use the `makeSimpleApiReducer` function to do this
if all you want to do is load the returned data into an appropriate
place in the Redux state.  This function accepts two arguments:

  1. an object containing the action types to be handled by the
     reducer (as returned for example by `makeQueryActions`)
  2. a string which specifies a property in the request parameters
     that can be used to identify the request and the returned data
     objects.  This is normally the name of a property whose value is
     an identifier for an object related to those being queried from
     the API, e.g., "lexUnitId".

## Wrapping a component with an API wrapper

Once your actions and reducers are defined, you can connect a
component to load its data from the API by wrapping its definition
with the `connectWithApiQuery` function.  This function accepts the
following arguments:

  1. a component to be connected to the API.  This component should
     have a `data` prop which will contain the data from the API if it
     is already available in the Redux store, and will be `undefined`
     otherwise.
  1. a `queryActions` object of the sort returned by
     `makeQueryActions`. If you construct this object yourself, make
     sure it has a `doQuery` property which accepts a request
     parameters object, and returns a
     [thunk](https://redux.js.org/advanced/async-actions#async-action-creators).
  1. an optional `propsToParams` function that maps the component's
     props to an object representing query parameters for the API
     query.  If this function is not given, instances of this
     component should instead directly define the query parameters
     object as the value of their `queryParams` prop.

`connectWithApiQuery` returns the wrapped component, so you can use its
return value to replace the original component definition.  See the
recipe below for more details.

A component created with `connectWithApiQuery` will automatically try
to query the API when the component first mounts, with the request
parameters given by the `queryParams` prop, or the return value of the
`propsToParams` function.  If both of these values are undefined, no
request will be made automatically; but you can make the request
explicitly at any time in your component's lifecycle (for example, in
an event handler) by calling the `query` prop.  This prop is a
function which exposes the `doQuery` action creator.  Calling this
function with a request parameters object results in a new API query.
You can use this to e.g. fetch additional data into a data container
based on user interactions.

## Recipe: component connected to API

To write a new component that transparently loads data via the API:

  1. Define the API endpoint in `constants.js` (at the top level).
  
  1. Create a new directory for your component with the usual files

  1. Define the component as you normally would in `component.jsx`.
     To hook up to the API, your component will need a `queryParams`
     prop that defines the request parameters for fetching the data,
     or a `propsToParams` function that creates such an object from
     the component's other props (see above).

  1. Define action types in `actions.js` for the type of data loaded
     from the API using the `makeQueryActions` helper, e.g.,
     ```
     import { makeQueryActions } from '../APIWrapper';
     import { apiPath } from '../../constants';
     
     export const lexUnitsQueries = makeQueryActions('LEX_UNITS', apiPath.lexUnits);
     ```
     
  1. Define a reducer to handle those actions in `reducers.js`.
     ```
     import { lexUnitsQueries } from './actions';
     import { makeSimpleApiReducer } from '../APIWrapper';

     const queryActionTypes = lexUnitsQueries.actionTypes;
     export const lexUnits = makeSimpleApiReducer(queryActionTypes, "synsetId");
     ```

     If you write the reducer yourself, keep in mind that this reducer
     should handle at least three different actions: PREFIX_REQUESTED,
     PREFIX_RETURNED, and PREFIX_ERROR, where PREFIX is the prefix you
     passed to makeQueryActions.  Also keep in mind that the request
     parameters sent to the backend are available as the `params`
     property on any of the actions defined by `makeQueryActions`, and
     that the response data will be available on the `data` property
     of a (successful) response.

  1. Install the reducer as a sub-reducer of the `fullAPIReducer` in the
     top-level [reducers.js](../../reducers.js):
     ```
     fullAPIReducer = combineReducers({
         ...
         lexUnits,
         ...
      });
     ```
     
  1. To hook up your component to the API, pass it to
     `connectWithApiQuery`, along with the API query actions object
     defined earlier, and (optionally) a `propsToParams` function: 
     ```
     import { lexUnitsQueries } from './actions';
     import { connectWithApiQuery } from '../APIWrapper';

     // props:
     //   queryParams :: { synsetId: ... }
     //   ...
     var LexUnitsContainer = // define component to be wrapped

     LexUnitsContainer = connectWithApiQuery(LexUnitsContainer, lexUnitsQueries.queryActions);
     ```
     Don't forget to export the wrapped component.

  1. Wherever you actually *instantiate* the component,
     remember to pass the correct `queryParams` in addition to your
     other props, if you did not pass a `propsToParams` function to connectWithApiQuery.
     ```
     <LexUnitsContainer queryParams={{ synsetId: someId }} .../>
     ```
     
