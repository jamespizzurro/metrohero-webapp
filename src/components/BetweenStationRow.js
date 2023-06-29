import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';

import LineStore from '../stores/LineStore';
import PredictionsStore from '../stores/PredictionsStore';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(LineStore, 'onStoreChange'),
    Reflux.listenTo(PredictionsStore, 'onStoreChange')
  ],

  propTypes: {
    code: PropTypes.string.isRequired,
    isOnLeft: PropTypes.bool.isRequired
  },

  getStoreState() {
    const SCALE_FACTOR = 50;

    return {
      stationToStationDistance: Math.round(LineStore.get('stationToStationDistances').get(this.props.code) / SCALE_FACTOR),
      status: PredictionsStore.get('data') ? PredictionsStore.get('data').get('betweenStationDelayStatuses') ? PredictionsStore.get('data').get('betweenStationDelayStatuses').get(this.props.code) : null : null
    }
  },

  render() {
    const { stationToStationDistance } = this.state;

    let height = stationToStationDistance + 24;
    let shouldRenderHalfway = false;
    if (this.props.isOnLeft) {
      if (this.state.status && this.state.status.indexOf("OK_") > -1) {
        shouldRenderHalfway = true;
        height = 24;
      }
    } else {
      if (this.state.status && this.state.status.indexOf("_OK") > -1) {
        shouldRenderHalfway = true;
        height = 24;
      }
    }

    return (
      <div className={"BetweenStationRow " + (this.props.isOnLeft ? "on-left": "on-right")} style={{height: stationToStationDistance}}>
        <div
          className={"Heatmap " + (this.props.isOnLeft ? "on-left ": "on-right ") + (shouldRenderHalfway ? "halfway ": "") + (this.state.status ? this.state.status.toLowerCase() : '')}
          style={{height: height}}
        />
      </div>
    );
  }
});
