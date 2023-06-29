import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import Immutable from 'immutable';
import {Tooltip} from 'react-tippy';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin
  ],

  propTypes: {
    data: PropTypes.instanceOf(Immutable.Map)
  },

  render() {
    if (!this.props.data) {
      return null;
    }

    const trackCircuits = [];

    this.props.data.forEach((trackCircuit, trackCircuitId) => {
      let component = trackCircuit.toJS();

      if (component.props.tooltipLabel) {
        component = (
          <Tooltip
            key={component.props.circuitId}
            title={component.props.tooltipLabel}
            position="bottom"
            animateFill={false}
            distance={4}
            followCursor={true}
          >
            {component}
          </Tooltip>
        );
      }

      trackCircuits.push(component);
    });

    return (
      <div>
        {trackCircuits}
      </div>
    );
  }
});
