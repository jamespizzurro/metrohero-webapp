import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import moment from 'moment';

import TrainDepartureFilters from './TrainDepartureFilters';
import TrainDepartureMetrics from './TrainDepartureMetrics';
import TrainDeparturesTable from './TrainDeparturesTable';
import TrainDepartureDialog from './TrainDepartureDialog';
import TrainDepartureRefreshButton from "./TrainDepartureRefreshButton";
import TrainDeparturesStore from "../stores/TrainDeparturesStore";

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(TrainDeparturesStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    isDarkMode: PropTypes.bool.isRequired
  },

  getStoreState() {
    return {
      lastUpdated: TrainDeparturesStore.get('lastUpdated')
    };
  },

  render() {
    const dataLastUpdatedMessage = (
      <div className="data-updated-message" style={{color: this.context.muiTheme.palette.textColor}}>
        data last updated on <span style={{whiteSpace: 'nowrap'}}>{this.state.lastUpdated ? moment(this.state.lastUpdated).format("M/D/YY") : "…"} at {this.state.lastUpdated ? moment(this.state.lastUpdated).format("h:mma") : "…"}</span>
      </div>
    );

    return (
      <div className="TrainDepartures">
        <div style={{marginTop: 24, marginLeft: 24, marginRight: 24, marginBottom: 56}}>
          <TrainDepartureFilters isDarkMode={this.props.isDarkMode} />
          {dataLastUpdatedMessage}
          <TrainDepartureMetrics isDarkMode={this.props.isDarkMode} />
          <TrainDeparturesTable isDarkMode={this.props.isDarkMode} />
          {dataLastUpdatedMessage}
          <TrainDepartureRefreshButton
            isDarkMode={this.props.isDarkMode}
          />
        </div>
        <TrainDepartureDialog isDarkMode={this.props.isDarkMode} />
      </div>
    );
  }
});
