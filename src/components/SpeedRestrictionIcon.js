import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin
  ],

  propTypes: {
    maximumSpeed: PropTypes.number,
    onClick: PropTypes.func,
    isDarkMode: PropTypes.bool.isRequired,
    x: PropTypes.number,
    y: PropTypes.number
  },

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  render() {
    if (this.props.x == null || this.props.y == null) {
      return false;
    }

    const style = {
      border: `1px solid ${this.context.muiTheme.palette.textColor}`,
      color: this.context.muiTheme.palette.textColor,
      background: this.context.muiTheme.palette.canvasColor,
      WebkitTransform: `translate(${this.props.x}px, ${this.props.y}px)`,
      MozTransform: `translate(${this.props.x}px, ${this.props.y}px)`,
      msTransform: `translate(${this.props.x}px, ${this.props.y}px)`,
      Otransform: `translate(${this.props.x}px, ${this.props.y}px)`,
      transform: `translate(${this.props.x}px, ${this.props.y}px)`
    };

    return (
      <div className="SpeedRestrictionsIcon" onClick={this.props.onClick ? this.props.onClick : null} style={style}>
        <div style={{fontSize: '5px', fontWeight: 500, lineHeight: '6px', marginTop: '1px'}}>SPEED</div>
        <div style={{fontSize: '5px', fontWeight: 500, lineHeight: '6px'}}>LIMIT</div>
        <div style={{fontSize: '12px', fontWeight: 600, lineHeight: '12px'}}>{this.props.maximumSpeed ? this.props.maximumSpeed : '!'}</div>
      </div>
    );
  }
});
