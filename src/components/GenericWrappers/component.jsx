// GenericWrappers/component.jsx
// Definition of generic wrapper components that are reused elsewhere

import React from 'react';

// DefList
// props:
//   className :: String  (CSS class for dl)
//   terms :: [ String ]
//   defs :: [ String ]
// terms and defs should be co-indexed
export function DefList(props) {
    return (
        <dl className={props.className}>
                {props.terms.map(
                    (term, idx) =>
                        <React.Fragment key={term}>
                          <dt>{term}</dt>
                          <dd>{props.defs[idx]}</dd>
                        </React.Fragment>
                )}
        </dl>
    );
}

