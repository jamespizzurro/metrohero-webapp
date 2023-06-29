import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import ga from 'react-ga4';

import Utilities from '../utilities/Utilities';

import CircuitMapAppActions from '../actions/CircuitMapAppActions';
import CircuitMapAppStore from '../stores/CircuitMapAppStore';
import PredictionsStore from '../stores/PredictionsStore';

import TrackCircuitMap from './TrackCircuitMap';
import CircuitMapTrainIcon from './CircuitMapTrainIcon';
import TrainDialog from './TrainDialog';
import PlaybackControls from './PlaybackControls';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(CircuitMapAppStore, 'onStoreChange'),
    Reflux.listenTo(PredictionsStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    isPlaybackLoaded: PropTypes.bool.isRequired,
    isDarkMode: PropTypes.bool
  },

  getStoreState() {
    return {
      trainStatuses: PredictionsStore.get('data') ? (this.props.isPlaybackLoaded ? PredictionsStore.get('data') : PredictionsStore.get('data').get('trainStatuses')) : null,
      circuits: CircuitMapAppStore.get('circuits'),
      selectedTrainId: CircuitMapAppStore.get('selectedTrainId')
    };
  },

  UNSAFE_componentWillMount() {
    CircuitMapAppActions.getCircuits();
  },

  _handleClickTrain(trainStatus) {
    ga.send(Utilities.getDataForModalView(window.location.pathname + "#" + trainStatus.get('trainId')));
    ga.event({
      category: 'Circuit Map',
      action: 'Displayed Train Modal'
    });

    CircuitMapAppActions.updateState({
      selectedTrainId: trainStatus.get('trainId')
    });
    this.refs.trainDialog.show();
  },

  _onTrainDialogHide() {
    CircuitMapAppActions.updateState({
      selectedTrainId: null
    });
  },

  render() {
    const trainIcons = [];

    if (this.state.circuits && this.state.trainStatuses) {
      this.state.trainStatuses.forEach((trainStatus, index) => {
        const trackCircuitId = trainStatus.get('rawTrackCircuitId') ? trainStatus.get('rawTrackCircuitId') : trainStatus.get('trackCircuitId');
        const trackCircuit = this.state.circuits.get(trackCircuitId.toString()) ? this.state.circuits.get(trackCircuitId.toString()).toJS() : null;
        if (trackCircuit) {
          let from = trackCircuit.props.from;
          let to = trackCircuit.props.to;
          if (to.x < from.x) {
            from = trackCircuit.props.to;
            to = trackCircuit.props.from;
          }

          trainIcons.push(
            <CircuitMapTrainIcon
              key={trainStatus.get('trainId')}
              numCars={trainStatus.get('Car')}
              lineCode={trainStatus.get('Line')}
              destinationName={trainStatus.get('DestinationName')}
              trainId={trainStatus.get('realTrainId')}
              isNotOnRevenueTrack={trainStatus.get('isNotOnRevenueTrack')}
              numPositiveTags={trainStatus.get('numPositiveTags')}
              numNegativeTags={trainStatus.get('numNegativeTags')}
              areDoorsOpenOnLeft={trainStatus.get('areDoorsOpenOnLeft')}
              areDoorsOpenOnRight={trainStatus.get('areDoorsOpenOnRight')}
              trackCircuitId={trackCircuitId}
              trackCircuitFromX={from.x}
              trackCircuitFromY={from.y}
              trackCircuitToX={to.x}
              trackCircuitToY={to.y}
              trackCircuitZIndex={trackCircuit.props.zIndex}
              isDarkMode={this.props.isDarkMode}
              onClick={this._handleClickTrain.bind(null, trainStatus)}
            />
          );
        }
      });
    }

    return (
      <div className='CircuitMapApp'>
        <TrackCircuitMap data={this.state.circuits} />
        {trainIcons}
        <TrainDialog
          ref="trainDialog"
          trainId={this.state.selectedTrainId}
          stationName={null}
          shouldRender={true}
          storeName={'PredictionsStore'}
          onHide={this._onTrainDialogHide}
        />
        <PlaybackControls
          shouldRenderTop={true}
        />
      </div>
    );
  }
});
