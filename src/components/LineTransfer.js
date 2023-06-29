import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin
  ],

  propTypes: {
    stationCode: PropTypes.string.isRequired,
    fromLineCodes: PropTypes.array,
    toLineCodes: PropTypes.array
  },

  render() {
    let fromLineCodes;
    if (this.props.fromLineCodes) {
      fromLineCodes = this.props.fromLineCodes.map((fromLineCode) => {
        return (
          <div className={"line " + fromLineCode.toLowerCase()} key={this.props.stationCode + "-from-" + fromLineCode}
               style={{height: (24 / this.props.fromLineCodes.length)}} />
        );
      });
    }

    let toLineCodes;
    if (this.props.toLineCodes) {
      toLineCodes = this.props.toLineCodes.map((toLineCode) => {
        return (
          <div className={"line " + toLineCode.toLowerCase()} key={this.props.stationCode + "-to-" + toLineCode}
               style={{height: (24 / this.props.toLineCodes.length)}} />
        );
      });
    }

    return (
      <div className="LineTransfer">
        <div className="from">
          {fromLineCodes}
        </div>
        <div className={"to" + (!this.props.fromLineCodes ? " no-from" : "")}>
          {toLineCodes}
        </div>
      </div>
    );
  }
});
