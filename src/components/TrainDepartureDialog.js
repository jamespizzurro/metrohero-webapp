import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';

import TrainDepartureDialogActions from '../actions/TrainDepartureDialogActions';
import TrainDepartureDialogStore from '../stores/TrainDepartureDialogStore';
import AppStore from '../stores/AppStore';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(TrainDepartureDialogStore, 'onStoreChange'),
    Reflux.listenTo(AppStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    isDarkMode: PropTypes.bool.isRequired
  },

  getStoreState() {
    return {
      line: TrainDepartureDialogStore.get('line'),
      direction: TrainDepartureDialogStore.get('direction'),
      departureStation: TrainDepartureDialogStore.get('departureStation'),
      destinationStation: TrainDepartureDialogStore.get('destinationStation'),
      scheduledDeparture: TrainDepartureDialogStore.get('scheduledDeparture'),
      observedDeparture: TrainDepartureDialogStore.get('observedDeparture'),
      realTrainId: TrainDepartureDialogStore.get('realTrainId'),
      trainId: TrainDepartureDialogStore.get('trainId'),
      numCars: TrainDepartureDialogStore.get('numCars'),
      observedHeadway: TrainDepartureDialogStore.get('observedHeadway'),
      scheduledHeadway: TrainDepartureDialogStore.get('scheduledHeadway'),
      headwayDeviation: TrainDepartureDialogStore.get('headwayDeviation'),
      scheduleDeviation: TrainDepartureDialogStore.get('scheduleDeviation'),
      isDialogOpen: TrainDepartureDialogStore.get('isDialogOpen'),
      isMobileDevice: AppStore.get('isMobileDevice')
    };
  },

  _close() {
    TrainDepartureDialogActions.closeDialog();
  },

  render() {
    const labelStyle = {
      fontWeight: 500,
      color: this.context.muiTheme.palette.textColor
    };

    return (
      <Dialog
        className="TrainDepartureDialog"
        actions={<FlatButton label="Close" primary={true} onClick={this._close} />}
        modal={this.state.isMobileDevice}
        open={this.state.isDialogOpen}
        onRequestClose={this._close}
        autoScrollBodyContent={true}
        contentStyle={{maxWidth: 500}}
      >
        <div><span style={labelStyle}>Line:</span> {this.state.line || 'N/A'}</div>
        <div><span style={labelStyle}>Direction:</span> {this.state.direction || 'N/A'}</div>
        <div><span style={labelStyle}>Departure Station:</span> {this.state.departureStation || 'N/A'}</div>
        <div><span style={labelStyle}>Destination Station:</span> {this.state.destinationStation || 'N/A'}</div>
        <div><span style={labelStyle}>Observed Departure Time:</span> {this.state.observedDeparture || 'N/A'}</div>
        <div><span style={labelStyle}>Scheduled Departure Time:</span> {this.state.scheduledDeparture || 'N/A'}</div>
        <div><span style={labelStyle}>Train ID:</span> {this.state.realTrainId || 'N/A'}</div>
        <div><span style={labelStyle}>AIMS Train ID:</span> #{this.state.trainId || 'N/A'}</div>
        <div><span style={labelStyle}>Number of Train Cars:</span> {this.state.numCars || 'N/A'}</div>
        <div><span style={labelStyle}>Observed Headway (in minutes):</span> {this.state.observedHeadway || 'N/A'}</div>
        <div><span style={labelStyle}>Scheduled Headway (in minutes):</span> {this.state.scheduledHeadway || 'N/A'}</div>
        <div><span style={labelStyle}>Headway Deviation (in minutes):</span> {(this.state.headwayDeviation > 0) ? '+' : ''}{this.state.headwayDeviation || 'N/A'}</div>
        <div><span style={labelStyle}>Schedule Deviation (in minutes):</span> {(this.state.scheduleDeviation > 0) ? '+' : ''}{this.state.scheduleDeviation || 'N/A'}</div>
      </Dialog>
    );
  }
});
