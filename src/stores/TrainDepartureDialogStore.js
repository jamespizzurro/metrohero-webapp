import Reflux from 'reflux';
import ImmutableStoreMixin from 'reflux-immutable';

import TrainDepartureDialogActions from '../actions/TrainDepartureDialogActions';

export default Reflux.createStore({

  listenables: TrainDepartureDialogActions,

  mixins: [
    ImmutableStoreMixin
  ],

  _defaultProps: {
    line: null,
    departureStation: null,
    destinationStation: null,
    scheduledDeparture: null,
    observedDeparture: null,
    trainId: null,
    realTrainId: null,
    scheduledHeadway: null,
    minutesOffSchedule: null,
    wasLateDeparture: null,
    isDialogOpen: false
  },

  init() {
    this.setState(this._defaultProps);
  },

  onUpdateState(obj) {
    this.setState(obj);
  },

  onCloseDialog() {
    this.setState(this._defaultProps);  // reset
  }
});
