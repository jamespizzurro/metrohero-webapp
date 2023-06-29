import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';

import TrainDeparturesActions from '../actions/TrainDeparturesActions';
import TrainDeparturesStore from '../stores/TrainDeparturesStore';

import RaisedButton from 'material-ui/RaisedButton';
import NavigationRefresh from 'material-ui/svg-icons/navigation/refresh';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(TrainDeparturesStore, 'onStoreChange')
  ],

  propTypes: {
    isDarkMode: PropTypes.bool.isRequired
  },

  getStoreState() {
    return {
      isDirty: TrainDeparturesStore.get('isDirty'),
      isLoadingMetrics: TrainDeparturesStore.get('isLoadingMetrics'),
      isLoadingTable: TrainDeparturesStore.get('isLoadingTable')
    };
  },

  render() {
    const shouldDisable = this.state.isLoadingTable || this.state.isLoadingMetrics || this.state.isDirty;

    return (
      <RaisedButton
        label="Refresh"
        icon={<NavigationRefresh />}
        onClick={() => {
          TrainDeparturesActions.getTrainDepartureMetrics();
          TrainDeparturesActions.getTrainDepartures();
        }}
        disabled={shouldDisable}
        style={{
          marginTop: 8
        }}
      />
    );
  }
});
