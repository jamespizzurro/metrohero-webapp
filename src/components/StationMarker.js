import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import {white} from 'material-ui/styles/colors';

import Paper from 'material-ui/Paper';

export default createReactClass({

  propTypes: {
    onClick: PropTypes.func.isRequired,
    muiTheme: PropTypes.object.isRequired
  },

  childContextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  getChildContext() {
    return {
      muiTheme: this.props.muiTheme
    };
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return false;
  },

  render() {
    return (
      <Paper
        className="StationDot StationMarker"
        zDepth={1}
        circle={true}
        style={{zIndex: 1, backgroundColor: white}}
        onClick={this.props.onClick}
      />
    );
  }
});
