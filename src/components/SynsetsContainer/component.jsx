// SynsetsContainer/component.jsx
// Definition of SynsetsContainer component

import { registerSource } from './actions';
import { synsets as getSynsets } from './selectors';
import { asDataContainer } from '../DataContainer/component';

import React from 'react';
import { connect } from 'react-redux';

class SynsetsContainer extends React.Component {
    constructor(props){
        super(props);
        this.props.register();
        
        //this.handleToggleCheckIgnoreCase = this.handleToggleCheckIgnoreCase.bind(this); 
    }

    // handleToggleCheckIgnoreCase () {
    //     this.props.updateIgnoreCase();
    // }

    render() {
        return ( 
            <div>There are {this.props.synsets.length} synsets in this container.</div>
        )
    }
}

function mapStateToProps (state, ownProps) {
    return { synsets: getSynsets(ownProps.id, state) };
}

function mapDispatchToProps (dispatch, ownProps) {
    return {
        register: () => dispatch(registerSource(ownProps.id, ownProps.source)),
        //updateIgnoreCase: () => dispatch(updateIgnoreCase(ownProps.id)),
    };
}

SynsetsContainer = connect(mapStateToProps, mapDispatchToProps)(SynsetsContainer);
export { SynsetsContainer };

