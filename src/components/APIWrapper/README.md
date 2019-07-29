# APIWrapper

The code in this directory defines a higher-order component for
transparently interacting with the backend API for Germanet data.
This reduces a *lot* of boilerplate in the components that have to
manage data via the API.

There are three important functions defined here:

1. `connectWithApi`, analogous to Redux's `connect`, is a higher-order
    component that wraps a given component with the functions
    necessary to fetch data from the API
2. `makeApiActions` provides a simple and consistent way to define
    action types and action creators for making API calls
3. `makeSimpleApiReducer` extracts the logic of handling API responses
    in the simple case where all that's needed is to stick the data
    from the API response into the Redux store
    


## Recipe: component connected to API

To write a new component that transparently loads data via the API:

  1. Define the API endpoint in `constants.js` (at the top level).
  
  1. Create a new directory for your component with the usual files

  1. Decide what props your component needs and define the component
     as you normally would in `component.jsx`.  To hook up to the API,
     your component will *also* need a `fetchParams` prop that defines
     the request parameters for fetching the data.  Once the data
     comes back from the API, it will be available on the `data` prop,
     in whatever shape is returned by the selector you define (see
     below).
     ```
     // props:
     //   fetchParams: { lexUnitId: ... }
     function ILIDefs(props) {
        return (<p>Here are the ILI defs for {props.lexUnitId}:
     {props.data.map( d => </p>);
     }
     ```
     
  1. Define action types in `actions.js` for the type of data loaded
     from the API using the `makeApiActions` helper, e.g.,
     ```
     import { makeApiActions } from '../../helpers';
     ...
     const iliEndpoints = { get: apiPath.displayilirecords }
     export const iliActions = makeApiActions('ILI_DEFS', iliEndpoints);
     ```
     
  1. Define a reducer to handle those actions in `reducers.js`.  If
     all you want to do is load the returned data into the state tree,
     you can use the `makeSimpleApiReducer` to create the reducer:
     
     ```
     import { iliActions } from './actions';
     import { makeSimpleApiReducer } from '../APIWrapper';

     const iliActionTypes = iliActions.actionTypes;
     const iliDefs = makeSimpleApiReducer(iliActionTypes, ["byLexUnitId"], "lexUnitId");

     export { iliDefs };
     ```

     If you need to write the reducer yourself, keep in mind that this
     reducer should handle at least three different actions:
     PREFIX_REQUESTED, PREFIX_RETURNED, and PREFIX_ERROR, where PREFIX
     is the prefix you passed to makeApiActions.  Also keep in mind
     that the request parameters sent to the backend are available as
     the `params` property on any of the actions defined by
     `makeApiActions`, and that the response data will be available on
     the `data` property of a (successful) response.

     Don't forget to add the reducer wherever you want to handle this
     data in the state tree:
     ```
     apiData = combineReducers({
         ...
         iliDefs,
         ...
      });
     ```
     
  1. Define a selector in `selectors.js` to find this data in the
     global state.  The selector should take the *global state* and
     your *component's props* as arguments.  It should return
     *undefined* if and only if the data is not yet in the store.  (If
     the data is in the store but simply empty, it should return an
     empty-but-true-ish data type, like `[]` or `{}`.)
     ```
     export function selectIliDefs(globalState, props) {
         try {
             const selected = globalState.apiData.iliDefs.byLexUnitId[props.fetchParams.lexUnitId] || [];
             return selected;
         } catch (e) {
             // if one of the properties in the middle is not defined yet,
             // it raises a TypeError; this indicates the data is not yet
             // in the store, and we should return undefined
             return undefined;
         }

     }
     ```
     
  1. To hook up your component to the API, wrap its
     definition in `component.jsx` with `connectWithApi`, using the
     selector defined in the previous step, and the API fetch actions
     defined earler step: 
     ```
     // props:
     //   fetchParams :: { lexUnitId: ... }
     function ILIDefs(props) {
         const terms = props.data.map( d => d.relation.replace('_', ' '));
         const defs = props.data.map( d => d.pwn20Paraphrase );
         return ( <DefList className="ili" terms={terms} defs={defs} /> );
     }
     ILIDefs = connectWithApi(selectIliDefs, iliActions.fetchActions)(ILIDefs);
     export { ILIDefs };
     ```
     Don't forget to export the wrapped component.

  1. Finally, wherever you actually *instantiate* the component,
     remember to pass the correct `fetchParams` in addition to your
     other props.
     
     
