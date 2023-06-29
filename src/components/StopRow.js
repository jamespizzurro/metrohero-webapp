import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';

import ActionThumbUp from 'material-ui/svg-icons/action/thumb-up';
import ActionThumbDown from 'material-ui/svg-icons/action/thumb-down';

import StopDot from './StopDot';

import {red400, green400} from 'material-ui/styles/colors';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    stopName: PropTypes.string.isRequired,
    shouldHighlight: PropTypes.bool,
    hasPositiveTags: PropTypes.bool,
    hasNegativeTags: PropTypes.bool,
    onClick: PropTypes.func,
    isDarkMode: PropTypes.bool.isRequired
  },

  render() {
    let textColor;
    if (this.props.shouldHighlight) {
      textColor = this.context.muiTheme.palette.accent1Color;
    } else {
      textColor = this.context.muiTheme.palette.secondaryTextColor;
    }

    const stopTags = [];
    if (this.props.hasPositiveTags || this.props.hasNegativeTags) {
      const iconStyle = {
        display: 'inline-block',
        fill: '#fff',
        width: 12,
        height: 12,
        marginBottom: 1,
        marginLeft: 0,
        marginRight: 2
      };
      if (this.props.hasPositiveTags) {
        const ratingStyle = {
          width: 16,
          height: 16,
          zIndex: 2,
          borderRadius: '50%',
          color: 'rgb(255, 255, 255)',
          backgroundColor: green400,
          border: '1px ${this.context.muiTheme.palette.canvasColor} solid',
          float: 'left'
        };
        stopTags.push(
          <div
            key={this.props.stopName + "-positive"}
            className={this.props.onClick ? "clickable" : "not-clickable"}
            style={ratingStyle}
            onClick={this.props.onClick}
          >
            <ActionThumbUp style={iconStyle}/>
          </div>
        );
      }
      if (this.props.hasNegativeTags) {
        const ratingStyle = {
          width: 16,
          height: 16,
          zIndex: 2,
          borderRadius: '50%',
          color: 'rgb(255, 255, 255)',
          backgroundColor: red400,
          border: `1px ${this.context.muiTheme.palette.canvasColor} solid`,
          float: 'left'
        };
        stopTags.push(
          <div
            key={this.props.stopName + "-negative"}
            className={this.props.onClick ? "clickable" : "not-clickable"}
            style={ratingStyle}
            onClick={this.props.onClick}
          >
            <ActionThumbDown style={iconStyle}/>
          </div>
        );
      }
    }

    return (
      <div className='StopRow'>
        <StopDot
          shouldHighlight={this.props.shouldHighlight}
          onClick={this.props.onClick}
        />
        <span
          className={`stop-name${this.props.onClick ? " clickable" : ""}`}
          style={{color: textColor}}
          onClick={this.props.onClick}
        >
          {this.props.stopName}
        </span>
        <div className="station-problems">
          {stopTags}
        </div>
      </div>
    );
  }
});
