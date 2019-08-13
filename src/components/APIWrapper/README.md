# APIWrapper

**Note**: this README is directed at programmers working interally on
this library (rather than programmers who are *using* this library
from another application), since the whole point is that external
users of this library shouldn't have to worry about the details of
loading data via the API.

An API wrapper is a higher-order component for transparently
interacting with the backend API for Germanet data.  Given a component
for rendering some data (typically a
[DataContainer](../DataContainer)), it returns a component which will
emit a Redux action to fetch that data from the API when the data is
not yet present.

**Note**: at the moment, API wrappers only support *retrieving* data,
but in the future they might be expanded to support one or more of the
other CRUD operations (creation, update, and deletion), at which point
this component may change.

To wrap a component with an API wrapper, you need to define actions
and reducers which manage the process of retrieving the data from the
API and loading it into the Redux store.  There are three important
functions here that help with that task:

1. `connectWithApi` (in [component.jsx](./component.jsx)) is a
    higher-order component that wraps a given component with the
    functions necessary to fetch data from the API
2. `makeApiActions` (in [actions.js](./actions.js)) provides a simple
    and consistent way to define action types and action creators for
    making API calls.
3. `makeSimpleApiReducer` (in [reducers.js](./reducers.js)) extracts
    the logic of handling API responses in the simple case where all
    that's needed is to stick the data from the API response into the
    Redux store

## Defining API actions

Managing the request-response cycle for fetching data from the API in
Redux generally requires three types of actions (see the [Redux async
actions](https://redux.js.org/advanced/async-actions) tutorial): one
to indicate a request has been made; another to indicate a response
was returned successfully; and a third to indicate when the response
returns an error, rather than the requested data.

You can use the `makeApiActions` function to create these action
types, as well as the associated action creators, for a given type of
data.  This function has two mandatory arguments:

  1. `prefix`, a string used to name the action types
  2. `endpoints`, an object mapping HTTP method names to endpoint URLs
     At the moment, the only supported method is 'get', so this object
     should look like: `{ get: URL, ... }`

It returns an object with the following properties:

  - `actionTypes`, an object whose properties are the names of the
    action types to be handled by the corresponding reducer.  These
    look like `<PREFIX>_<ACTION>`, e.g., `LEX_UNITS_REQUESTED`.
  - `fetchActions`, an object whose properties are the action creators
    for the three types of action involved in an API request.

The important thing to know is that `fetchActions.doFetch` is an
asynchronous action creator that manages the whole request-response
cycle, and API wrappers rely on having such a `doFetch` function
available to them.  See the code for other details.

## Defining reducers

You must also define a reducer to handle these three types of
actions.  You can use the `makeSimpleApiReducer` function to do this
if all you want to do is load the returned data into an appropriate
place in the Redux state.

**Warning**: a better implementation of this function is waiting on
changes to the backend API, so its interface is not documented here.
See the code for details.

## Wrapping a component with an API wrapper

Once your actions and reducers are defined, you can connect a
component to load its data from the API by wrapping its definition
with the `connectWithApi` function.  This function accepts the
following arguments:

  1. a component to be connected to the API.  This component should
     have a `data` prop which will contain the data from the API if it
     is already available in the Redux store, and will be `undefined`
     otherwise.
  1. a `fetchActions` object of the sort returned by
     `makeApiActions`. If you construct this object yourself, make
     sure it has a `doFetch` property which accepts a request
     parameters object, and returns a
     [thunk](https://redux.js.org/advanced/async-actions#async-action-creators).

`connectWithApi` returns the wrapped component, so you can use its
return value to replace the original component definition.  See the
recipe below for more details.

## Recipe: component connected to API

To write a new component that transparently loads data via the API:

  1. Define the API endpoint in `constants.js` (at the top level).
  
  1. Create a new directory for your component with the usual files

  1. Define the component as you normally would in `component.jsx`.
     To hook up to the API, your component will need a `fetchParams`
     prop that defines the request parameters for fetching the data.

  1. Define action types in `actions.js` for the type of data loaded
     from the API using the `makeApiActions` helper, e.g.,
     ```
     import { makeApiActions } from '../APIWrapper';
     import { apiPath } from '../../constants';
     
     const lexUnitsEndpoints = { get: apiPath.displaylexunits }
     export const lexUnitsActions = makeApiActions('LEX_UNITS', lexUnitsEndpoints);
     ```
     
  1. Define a reducer to handle those actions in `reducers.js`.
     ```
     import { lexUnitsActions, iliActions, examplesActions } from './actions';
     import { makeSimpleApiReducer } from '../APIWrapper';

     const lexUnitsActionTypes = lexUnitsActions.actionTypes;
     export const lexUnits = makeSimpleApiReducer(lexUnitsActionTypes, ["bySynsetId"], "synsetId");
     ```

     If you need to write the reducer yourself, keep in mind that this
     reducer should handle at least three different actions:
     PREFIX_REQUESTED, PREFIX_RETURNED, and PREFIX_ERROR, where PREFIX
     is the prefix you passed to makeApiActions.  Also keep in mind
     that the request parameters sent to the backend are available as
     the `params` property on any of the actions defined by
     `makeApiActions`, and that the response data will be available on
     the `data` property of a (successful) response.

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
     `connectWithApi`, along with the API fetch actions object defined earlier: 
     ```
     import { lexUnitsActions } from './actions';
     import { connectWithApi } from '../APIWrapper';

     // props:
     //   fetchParams :: { synsetId: ... }
     //   ...
     var LexUnitsContainer = // define component to be wrapped

     LexUnitsContainer = connectWithApi(LexUnitsContainer, lexUnitsActions.fetchActions);
     ```
     Don't forget to export the wrapped component.

  1. Finally, wherever you actually *instantiate* the component,
     remember to pass the correct `fetchParams` in addition to your
     other props.
     ```
     <LexUnitContainer fetchParams={{ synsetId: someId }} .../>
     ```
     
     
