// ORIGINAL SOURCE: https://github.com/chtefi/react-line

import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';

export default createReactClass({

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    circuitId: PropTypes.number,
    from: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }),
    to: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }),
    tooltipLabel: PropTypes.string,
    style: PropTypes.string,
    boxShadow: PropTypes.string,
    label: PropTypes.string,
    zIndex: PropTypes.number
  },

  render() {
    let from = this.props.from;
    let to = this.props.to;
    if (to.x < from.x) {
      from = this.props.to;
      to = this.props.from;
    }

    const len = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
    const angle = Math.atan((to.y - from.y) / (to.x - from.x));

    const style = {
      position: 'absolute',
      transform: `translate(${from.x - .5 * len * (1 - Math.cos(angle))}px, ${from.y + .5 * len * Math.sin(angle)}px) rotate(${angle}rad)`,
      width: `${len}px`,
      height: `${0}px`,
      borderBottom: this.props.style || '4px solid transparent',
      boxShadow: this.props.boxShadow || '',
      fontSize: 8,
      textAlign: 'center',
      borderRight: '2px solid black',
      borderLeft: '2px solid black',
      zIndex: this.props.zIndex || 0,
      color: this.context.muiTheme.palette.textColor,
      cursor: this.props.tooltipLabel ? 'pointer' : 'initial'
    };

    return (
      <div style={style}>
        {this.props.children}
        {this.props.label}
      </div>
    );
  }
});
