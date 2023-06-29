import Reflux from 'reflux';
import ImmutableStoreMixin from 'reflux-immutable';

import RealtimeMapActions from '../actions/RealtimeMapActions';

export default Reflux.createStore({

  listenables: RealtimeMapActions,

  mixins: [
    ImmutableStoreMixin
  ],

  init() {
    this.setState({
      stationCodeCoordsMap: null,
      selectedStationName: null,
      selectedStationCode: null,
      selectedTrainId: null,
      standardRoutes: null,
      connectedCircuitIdsByCircuitId: null,
      coordsData: null
    });
  },

  onUpdateState(obj) {
    this.setState(obj);
  }
});
