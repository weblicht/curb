
# Recipe: component connected to API

To write a new component that transparently loads data via the API:

  1. Define the API endpoint in `constants.js`.
  
  1. Decide what props your component needs and define the component
     as you normally would in `component.jsx`.  To hook up to the API,
     your component will *also* need a `fetchParams` prop that defines
     the request parameters for fetching the data.  Some of the props
     you need for display can live inside the `fetchParams` prop.
     Once the data comes back from the API, it will be available on
     the `data` prop, in whatever shape is returned by the selector
     you define (see below).
     ```
     // props:
     //   fetchParams: { lexUnitId: ... }
     function ILIDefs(props) {
        return (<p>Here are the ILI defs for {props.lexUnitId}:
     {props.data.map( d => </p>);
     }
     ```
     TODO: would it be nicer to write `<ILIDefs by='lexUnitId' key={aLexUnitId}/>`?
     Then API code could generate the right endpoint from by and key,
     instead of us having to unpack them in the component.  Not a huge
     difference but feels a little cleaner.

  1. Define action types in `actions.js` for the type of data loaded
     from the API using the `makeApiActions` helper, e.g.,
     ```
     import { makeApiActions } from '../../helpers';
     ...
     const iliEndpoints = { get: apiPath.displayilirecords }
     export const iliActions = makeApiActions('ILI_DEFS', iliEndpoints);
     ```
     
  1. Define a reducer to handle those actions in `reducers.js`.  This
     reducer should handle at least three different actions:
     PREFIX_REQUESTED, PREFIX_RETURNED, and PREFIX_ERROR, where PREFIX
     is the prefix you passed to makeApiActions.  (TODO: this reducer
     is also boilerplate in many cases; can we make a helper?)

     Keep in mind that the request parameters sent to
     the backend are available as the `params` property on any of
     these actions, and that the response data will be available on
     the `data` property.  (Also, since the response data is likely
     wrapped in a JSON object, you probably need to unpack it!)
     ```
     const iliActionTypes = iliActions.actionTypes;
     function iliDefs(state = SI({}), action) {
         switch (action.type) {
         case iliActionTypes.ILI_DEFS_RETURNED: {
             // recover important identifiers from request params:
             const lexUnitId = action.params.lexUnitId;
             // unwrap the records inside the data object:
             return SI.setIn(state, ["byLexUnitId", lexUnitId],
                             action.data.iliRecords);
         }
         default:
             return state;
         }
    }
    ```
    Don't forget to add the reducer wherever you want to handle this
    data in the state tree:
    ```
    data = combineReducers({
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
             const selected = globalState.data.iliDefs.byLexUnitId[props.fetchParams.lexUnitId] || [];
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
     defined in the second step: 
     ```
     // props:
     //   fetchParams :: { lexUnitId: ... }
     function ILIDefs(props) {
         const terms = [ "PWN 2.0 Synonyms",
                         "PWN 2.0 Paraphrase"
                       ];

         const defs = [ props.data[0].pwn20Synonyms,
                        props.data[0].pwn20Paraphrase,
                      ];
         return ( <DefList className="ili" terms={terms} defs={defs} /> );
     }
     ILIDefs = connectWithApi(selectIliDefs, iliActions.fetchActions)(ILIDefs);
     export { ILIDefs };
     ```
     Don't forget to export the wrapped component.

  1. Finally, wherever you actually *instantiate* the component,
     remember to pass the correct `fetchParams` in addition to your
     other props.
     
     
