// Helper components for search engine optimization

import React from 'react';

// Dynamically sets title and description for "pages" in a single page
// app. This helps identify the pages in the application to search
// engines. The component always renders as null; its *only* job is to
// set these pieces of document metadata via side-effects.
//
// All props are optional.
// 
// props:
//   title :: String, a title for the page. Sets document.title.
//   children :: String. Sets the <meta name="description"> value.
//
// WARNING: The page description is specified as children because
//   <Meta>foo...</Meta>
// is more ergonomic to write than
//   <Meta description="foo...">
// when the description is too long to fit on one line. But the
// description *must* be a pure string value; you cannot use any nested
// elements here.
// 
// Note that the description meta tag is assumed to already be in the
// DOM and will *not* be created if it is not found, so make sure this
// tag is served in the app's static HTML.
export function Meta(props) {
    React.useEffect(() => {
        const descNode = document.querySelector('meta[name="description"]');
        const oldValues = {
            title: document.title,
            description:  descNode ? descNode.getAttribute("content") : null,
        };

        // page title:
        if (props.title && typeof props.title === "string") {
            document.title = props.title;   
        } 

        // description meta tag:
        if (descNode && props.children && typeof props.children === "string") {
            descNode.setAttribute("content", props.children);
        } 

        return function cleanup() {
            document.title = oldValues.title;
            if (descNode) {
                descNode.setAttribute("content", oldValues.description);
            }
        };

    });

    return null;

}
