import Reflux from 'reflux';

export default Reflux.createActions({

  updateState: {},
  saveTrip: {},
  deleteSavedTrip: {},
  getSavedTripsFromARIES: {asyncResult: true},
  getStationTrip: {asyncResult: true}
});
