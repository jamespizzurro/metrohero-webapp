import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import {white} from 'material-ui/styles/colors';

import Paper from 'material-ui/Paper';

export default createReactClass({

  propTypes: {
    onClick: PropTypes.func.isRequired
  },

  render() {
    return (
      <Paper
        className="StationDot"
        zDepth={1}
        circle={true}
        style={{zIndex: 1, backgroundColor: white}}
        onClick={this.props.onClick} />
    );
  }
});
