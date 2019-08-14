import React from 'react';
import { connect } from 'react-redux';  

// Higher-order component to transparently connect a component to both the
// backend API and the redux store
//
// params:
//   fetchActions: an object containing API action creators for fetching, e.g. as
//     returned by makeApiActions.
// 
// ConnectedSomeComponent = connectWithApi(SomeComponent, fetchActions);
export function connectWithApi(Component, fetchActions) {
    // TODO: again, there's room to expand here to other REST methods
    // In that case we want not just fetchActions, but a whole API actions object

    class APIWrapper extends React.Component {

        constructor(props) {
            super(props);
        }
        
        // TODO: for some applications we will actually want to
        // reload the data before every render.  Moreover, that's
        // simpler.  
        componentDidMount() {
            if (this.props.data === undefined) {
                this.props.fetchData();
            }
        }

        render() {
            return (
                <Component data={this.props.data} {...this.props}/>
            );
        }
    };
    
    function mapDispatchToProps(dispatch, ownProps) {
        return {
            // for now, user must supply fetchParams 
            fetchData: () => dispatch(fetchActions.doFetch(ownProps.fetchParams)),
        };
    };

    const Connected = connect(undefined, mapDispatchToProps)(APIWrapper);
    Connected.displayName = (Component.displayName || Component.name || 'Component') + 'WithApi';

    return Connected;
}

