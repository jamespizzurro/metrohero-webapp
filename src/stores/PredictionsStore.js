import Reflux from 'reflux';
import request from 'superagent';
import ImmutableStoreMixin from 'reflux-immutable';
import {OrderedMap} from 'immutable';

import Utilities from '../utilities/Utilities';

import PredictionsActions from '../actions/PredictionsActions';

export default Reflux.createStore({

  listenables: PredictionsActions,

  mixins: [
    ImmutableStoreMixin
  ],

  init() {
    this.setState({
      isLoading: false,
      error: null,
      data: null,
      playback: {
        enabled: false,
        loaded: false,
        isPlaying: false,
        timestamp: null,
        timer: null
      }
    });
  },

  _primaryTimeoutId: null,

  onResetGetPredictions() {
    if (this._primaryTimeoutId) {
      clearTimeout(this._primaryTimeoutId);
    }
    this._primaryTimeoutId = null;
    PredictionsActions.getPredictions();
  },

  onGetPredictions(timestamp) {
    this.setState({
      isLoading: true,
      playback: {
        enabled: !!timestamp,
        loaded: this.get('playback').get('loaded'),
        isPlaying: this.get('playback').get('isPlaying'),
        timestamp: timestamp
      }
    });

    if (!!timestamp) {
      request
        .get('%BASE_URL%/trains/history')
        .query({timestamp: this.get('playback').get('timestamp')})
        .set({
          Accept: 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: 0
        })
        .end((err, res) => {
          if (err) {
            PredictionsActions.getPredictions.failed(err, true);
          } else {
            PredictionsActions.getPredictions.completed(res.body, true);
          }
        });
    } else {
      request
        .get('%BASE_URL%/system')
        .query({
          tripStationCodesKeys: Utilities.getSavedMorningTrips().concat(Utilities.getSavedEveningTrips())
        })
        .set({
          Accept: 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: 0
        })
        .timeout(4000)
        .end((err, res) => {
          if (err) {
            PredictionsActions.getPredictions.failed(err, false);
          } else {
            PredictionsActions.getPredictions.completed(res.body, false);
          }
        });
    }
  },

  onGetPredictionsFailed(err, wasPlaybackRequested) {
    if (wasPlaybackRequested !== this.get('playback').get('enabled')) {
      return;
    }

    if (!wasPlaybackRequested) {
      this._primaryTimeoutId = setTimeout(() => {
        if (!wasPlaybackRequested && !this.get('playback').get('enabled')) {
          PredictionsActions.getPredictions();
        }
      }, 5000);
    }

    this.setState({
      error: err,
      playback: {
        enabled: wasPlaybackRequested,
        loaded: wasPlaybackRequested,
        isPlaying: false,
        timestamp: this.get('playback').get('timestamp')
      }
    });

    setTimeout(() => {
      if (!wasPlaybackRequested && !this.get('playback').get('enabled')) {
        this.setState({
          isLoading: false
        });
      }
    }, 1000);
  },

  onGetPredictionsCompleted(data, wasPlaybackRequested) {
    if (wasPlaybackRequested !== this.get('playback').get('enabled')) {
      return;
    }

    let timer = null;
    if (!wasPlaybackRequested) {
      this._primaryTimeoutId = setTimeout(() => {
        if (!wasPlaybackRequested && !this.get('playback').get('enabled')) {
          PredictionsActions.getPredictions();
        }
      }, 5000);
    } else {
      this._clearTimeout();
      timer = setTimeout(() => {
        if (wasPlaybackRequested && this.get('playback').get('enabled') && this.get('playback').get('isPlaying')) {
          PredictionsActions.getPredictions(this.get('playback').get('timestamp') + 1);
        }
      }, 1000);
    }

    if (data && data.savedTrips) {
      data.savedTrips = OrderedMap(data.savedTrips);
    }

    this.setState({
      error: null,
      data: data,
      playback: {
        enabled: wasPlaybackRequested,
        loaded: wasPlaybackRequested,
        isPlaying: this.get('playback').get('isPlaying'),
        timestamp: this.get('playback').get('timestamp'),
        timer: timer
      }
    });

    if (wasPlaybackRequested) {
      this.setState({
        isLoading: false
      });
    } else {
      setTimeout(() => {
        if (!wasPlaybackRequested && !this.get('playback').get('enabled')) {
          this.setState({
            isLoading: false
          });
        }
      }, 1000);
    }
  },

  onTogglePlayback() {
    this._clearTimeout();

    this.setState({
      playback: {
        enabled: this.get('playback').get('enabled'),
        loaded: this.get('playback').get('loaded'),
        isPlaying: !this.get('playback').get('isPlaying'),
        timestamp: this.get('playback').get('timestamp'),
        timer: null
      }
    });

    if (this.get('playback').get('isPlaying')) {
      PredictionsActions.getPredictions(this.get('playback').get('timestamp'));
    }
  },

  _clearTimeout() {
    if (this.get('playback').get('timer')) {
      clearTimeout(this.get('playback').get('timer'));
    }
  }
});
