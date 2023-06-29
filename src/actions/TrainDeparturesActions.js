import Reflux from 'reflux';

export default Reflux.createActions({

  updateParams: {},
  getFirstDepartureTime: {asyncResult: true},
  getTrainDepartureMetrics: {asyncResult: true},
  getTrainDepartures: {asyncResult: true}
});
