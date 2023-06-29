import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin
  ],

  propTypes: {
    code: PropTypes.string
  },

  render() {
    let shouldRenderHalfway = false;
    if (this.props.code && this.props.code.indexOf("_OK") > -1) {
      shouldRenderHalfway = true;
    }

    return (
      <div className={'StopHeatmap' + (shouldRenderHalfway ? ' halfway' : '') + (this.props.code ? ' ' + this.props.code.toLowerCase() : '')} />
    );
  }
});
