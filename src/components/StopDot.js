import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import {white} from 'material-ui/styles/colors';

import Paper from 'material-ui/Paper';

export default createReactClass({

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    shouldHighlight: PropTypes.bool,
    onClick: PropTypes.func
  },

  render() {
    const style = {
      zIndex: 1,
      backgroundColor: white
    };

    if (this.props.shouldHighlight) {
      style.border = `3px ${this.context.muiTheme.palette.accent1Color} solid`;
    }

    return (
      <Paper
        className={`StopDot${this.props.onClick ? " clickable" : ""}`}
        zDepth={1}
        circle={true}
        style={style}
        onClick={this.props.onClick} />
    );
  }
});
