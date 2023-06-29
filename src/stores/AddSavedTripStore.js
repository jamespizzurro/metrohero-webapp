import Reflux from 'reflux';
import ImmutableStoreMixin from 'reflux-immutable';
import ls from 'local-storage';
import request from 'superagent';
import {OrderedMap} from 'immutable';
import moment from 'moment';

import Utilities from '../utilities/Utilities';

import AddSavedTripActions from '../actions/AddSavedTripActions';
import PredictionsActions from '../actions/PredictionsActions';

export default Reflux.createStore({

  listenables: AddSavedTripActions,

  mixins: [
    ImmutableStoreMixin
  ],

  init() {
    let defaultTimeOfDay;

    const now = moment();
    const startOfService = moment('03:00:00', 'HH:mm:ss');
    const noon = moment('12:00:00', 'HH:mm:ss');
    if (now.isAfter(startOfService) && now.isBefore(noon)) {
      defaultTimeOfDay = 'morning';
    } else {
      defaultTimeOfDay = 'evening';
    }

    this.setState({
      showDialog: false,
      selectedTimeOfDay: defaultTimeOfDay,
      selectedSystemName: 'Metrorail',
      selectedFromStationCode: null,
      selectedToStationCode: null,
      savedMorningTrips: Utilities.getSavedMorningTrips(),
      savedEveningTrips: Utilities.getSavedEveningTrips(),
      savedTrip: null,
      isSavedTripLoading: false,
      stationNameCodeMap: OrderedMap(Utilities.getStationNameCodeMap()),
      isAddingSavedTrip: false,

      selectedTrainId: null,
      selectedStationName: null,
      selectedSavedTripKey: null,

      loadedSavedTripsFromARIES: {}
    });
  },

  onUpdateState(obj) {
    this.setState(obj);
  },

  onSaveTrip() {
    const selectedTimeOfDay = this.get('selectedTimeOfDay');
    const selectedSystemName = this.get('selectedSystemName');
    const selectedFromStationCode = this.get('selectedFromStationCode');
    const selectedToStationCode = this.get('selectedToStationCode');

    if (!selectedTimeOfDay || !selectedSystemName || !selectedFromStationCode || !selectedToStationCode) {
      return;
    }

    let savedTrips;
    if (selectedTimeOfDay === 'morning') {
      savedTrips = ls.get('savedMorningTrips');
    } else if (selectedTimeOfDay === 'evening') {
      savedTrips = ls.get('savedEveningTrips');
    } else {
      return;
    }
    savedTrips = savedTrips ? JSON.parse(savedTrips) : [];

    let key = `${selectedFromStationCode}_${selectedToStationCode}${(selectedSystemName === 'Metrorail') ? '' : `_${selectedSystemName}`}`;
    let index = savedTrips.indexOf(key);
    if (index <= -1) {
      const oldKey = `${selectedFromStationCode}_${selectedToStationCode}`;
      index = savedTrips.indexOf(oldKey);
    }

    if (index <= -1) {
      savedTrips.push(key);

      if (selectedTimeOfDay === 'morning') {
        ls.set('savedMorningTrips', JSON.stringify(savedTrips));
        this.setState({
          savedMorningTrips: savedTrips
        });
      } else if (selectedTimeOfDay === 'evening') {
        ls.set('savedEveningTrips', JSON.stringify(savedTrips));
        this.setState({
          savedEveningTrips: savedTrips
        });
      }

      PredictionsActions.resetGetPredictions();
    }
  },

  onDeleteSavedTrip(systemName, fromStationCode, toStationCode) {
    const timeOfDay = this.get('selectedTimeOfDay');
    if (!timeOfDay || !systemName || !fromStationCode || !toStationCode) {
      return;
    }

    let savedTrips;
    if (timeOfDay === 'morning') {
      savedTrips = ls.get('savedMorningTrips');
    } else if (timeOfDay === 'evening') {
      savedTrips = ls.get('savedEveningTrips');
    } else {
      return;
    }
    savedTrips = savedTrips ? JSON.parse(savedTrips) : [];

    let index = savedTrips.indexOf(`${fromStationCode}_${toStationCode}_${systemName}`);
    if (index <= -1) {
      index = savedTrips.indexOf(`${fromStationCode}_${toStationCode}`);
    }

    if (index > -1) {
      savedTrips.splice(index, 1);

      if (timeOfDay === 'morning') {
        ls.set('savedMorningTrips', JSON.stringify(savedTrips));
        this.setState({
          savedMorningTrips: savedTrips
        });
      } else if (timeOfDay === 'evening') {
        ls.set('savedEveningTrips', JSON.stringify(savedTrips));
        this.setState({
          savedEveningTrips: savedTrips
        });
      }

      PredictionsActions.resetGetPredictions();
    }
  },

  _getStationTrip(systemName, fromStationCode, toStationCode, callbackAction) {
    if (systemName === 'Metrorail') {
      const key = `${fromStationCode}_${toStationCode}`;
      request
        .get('%BASE_URL%/trip/' + key)
        .set({
          Accept: 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: 0
        })
        .timeout(3000)
        .end(function (err, res) {
          if (err) {
            callbackAction.failed(systemName, fromStationCode, toStationCode, err);
          } else {
            callbackAction.completed(systemName, fromStationCode, toStationCode, res.body);
          }
        });
    } else {
      request
        .get(`https://aries.dcmetrohero.com/api/v1/system/${systemName}/trip/${fromStationCode}/${toStationCode}/prediction`)
        .set({
          Accept: 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: 0
        })
        .timeout(3000)
        .end(function (err, res) {
          if (err) {
            callbackAction.failed(systemName, fromStationCode, toStationCode, err);
          } else {
            callbackAction.completed(systemName, fromStationCode, toStationCode, res.body);
          }
        });
    }
  },

  onGetSavedTripsFromARIES() {
    const savedMorningTripKeys = JSON.parse(ls.get('savedMorningTrips') || '[]');
    const savedEveningTripKeys = JSON.parse(ls.get('savedEveningTrips') || '[]');
    const savedTripKeys = savedMorningTripKeys.concat(savedEveningTripKeys);

    for (let i = 0; i < savedTripKeys.length; i++) {
      const savedTripKey = savedTripKeys[i];

      const splitSavedTripKey = savedTripKey.split("_");
      const fromStationCode = splitSavedTripKey[0];
      const toStationCode = splitSavedTripKey[1];
      const systemName = (splitSavedTripKey.length > 2) ? splitSavedTripKey[2] : 'Metrorail';

      if (systemName !== 'Metrorail') {
        this._getStationTrip(systemName, fromStationCode, toStationCode, AddSavedTripActions.getSavedTripsFromARIES);
      }
    }
  },

  onGetSavedTripsFromARIESFailed(systemName, fromStationCode, toStationCode, err) {
    const savedTripKey = `${fromStationCode}_${toStationCode}_${systemName}`;

    setTimeout(() => {
      this.setState({
        loadedSavedTripsFromARIES: this.get('loadedSavedTripsFromARIES').set(savedTripKey, null)
      });
    }, 500);
  },

  onGetSavedTripsFromARIESCompleted(systemName, fromStationCode, toStationCode, savedTrip) {
    const savedTripKey = `${fromStationCode}_${toStationCode}_${systemName}`;

    setTimeout(() => {
      this.setState({
        loadedSavedTripsFromARIES: this.get('loadedSavedTripsFromARIES').set(savedTripKey, savedTrip)
      });
    }, 500);
  },

  onGetStationTrip() {
    const selectedSystemName = this.get('selectedSystemName');
    const selectedFromStationCode = this.get('selectedFromStationCode');
    const selectedToStationCode = this.get('selectedToStationCode');

    if (!selectedSystemName || !selectedFromStationCode || !selectedToStationCode) {
      if (this.get('savedTrip')) {
        this.setState({
          savedTrip: null
        });
      }
      return;
    }

    this.setState({
      savedTrip: null,
      isSavedTripLoading: true
    });

    this._getStationTrip(selectedSystemName, selectedFromStationCode, selectedToStationCode, AddSavedTripActions.getStationTrip);
  },

  onGetStationTripFailed(systemName, fromStationCode, toStationCode, err) {
    setTimeout(() => {
      this.setState({
        savedTrip: null,
        isSavedTripLoading: false
      });
    }, 500);
  },

  onGetStationTripCompleted(systemName, fromStationCode, toStationCode, savedTrip) {
    setTimeout(() => {
      this.setState({
        savedTrip: savedTrip,
        isSavedTripLoading: false
      });
    }, 500);
  }
});
