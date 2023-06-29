import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import moment from 'moment';

import PredictionsStore from '../stores/PredictionsStore';
import AppStore from '../stores/AppStore';
import AppActions from '../actions/AppActions';

import Snackbar from 'material-ui/Snackbar';

import AppCacheSnackbar from './AppCacheSnackbar';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(PredictionsStore, 'onStoreChange'),
    Reflux.listenTo(AppStore, 'onStoreChange')
  ],

  getStoreState() {
    const isError = !!PredictionsStore.get('error');
    const lastUpdatedTrainStatuses = PredictionsStore.get('data') ? PredictionsStore.get('data').get('lastUpdatedTimestamp') : null;
    const lastUpdatedTimestamp = lastUpdatedTrainStatuses ? moment.unix(lastUpdatedTrainStatuses) : null;
    const lastUpdatedTimestampFromNow = lastUpdatedTimestamp ? lastUpdatedTimestamp.fromNow(true) : null;

    const isDataStale = !isError && !!lastUpdatedTimestampFromNow && (lastUpdatedTimestampFromNow !== 'a few seconds');
    const isNetworkProblem = isError;
    const isAppUpdateAvailable = AppStore.get('isAppUpdateAvailable');
    const isShowingAnySnackbar = isDataStale || isNetworkProblem || isAppUpdateAvailable;

    return {
      lastUpdatedTimestampFromNow: lastUpdatedTimestampFromNow,
      isDataStale: isDataStale,
      isNetworkProblem: isNetworkProblem,
      isAppUpdateAvailable: isAppUpdateAvailable,
      isShowingAnySnackbar: isShowingAnySnackbar
    };
  },

  _timerId: null,

  componentDidMount() {
    this._checkIfUpdateReady();
    this._updateIsShowingAnySnackbar();
  },

  componentDidUpdate(prevProps, prevState) {
    this._updateIsShowingAnySnackbar();
  },

  componentWillUnmount() {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  },

  _updateApplicationCache() {
    const applicationCacheIframe = document.getElementById('applicationCacheIframe')
    if (!applicationCacheIframe) {
      console.log('Unable to get application cache iframe');
      return;
    }

    const applicationCacheIframeWindow = applicationCacheIframe.contentWindow;
    if (!applicationCacheIframeWindow) {
      console.log('Unable to get application cache iframe window');
      return;
    }

    if (!applicationCacheIframeWindow.applicationCache) {
      console.log('AppCache not supported');
      return;
    }

    if (applicationCacheIframeWindow.location.hostname === 'localhost') {
      // => development environment
      // don't use application cache
    } else {
      // => non-development environment
      // use application cache
      try {
        function onError(err) {
          console.log('AppCache update failed', err);
        }

        function onUpdateReady() {
          console.log('App update available via AppCache!');

          applicationCacheIframeWindow.applicationCache.swapCache();

          AppActions.updateState({
            isAppUpdateAvailable: true
          });
        }

        if (applicationCacheIframeWindow.applicationCache.status === applicationCacheIframeWindow.applicationCache.UPDATEREADY) {
          onUpdateReady();
        } else {
          applicationCacheIframeWindow.applicationCache.onerror = onError;
          applicationCacheIframeWindow.applicationCache.onupdateready = onUpdateReady;
          applicationCacheIframeWindow.applicationCache.update();
        }
      } catch (err) {
        console.log('AppCache update failed', err);
      }
    }
  },

  _updateServiceWorker() {
    if (!navigator.serviceWorker) {
      console.log('ServiceWorker not supported');
      return;
    }

    if (window.location.hostname === 'localhost') {
      // => development environment
      // don't use service workers for caching
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    } else {
      // => non-development environment
      // use service workers for caching
      try {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('App update available via ServiceWorker!');

                AppActions.updateState({
                  isAppUpdateAvailable: true
                });
              }
            };
          };
          registration.update();
        }, (err) => {
          console.log('ServiceWorker registration failed, falling back to using AppCache', err);
          this._updateApplicationCache();
        });
      } catch (err) {
        console.log('ServiceWorker registration failed, falling back to using Appcache', err);
        this._updateApplicationCache();
      }
    }
  },

  _checkIfUpdateReady() {
    if ('serviceWorker' in navigator) {
      this._updateServiceWorker();
      this._timerId = setInterval(() => {
        this._updateServiceWorker();
      }, 60000);
    } else if ('applicationCache' in window) {
      this._updateApplicationCache();
    }
  },

  _updateIsShowingAnySnackbar() {
    AppActions.updateState({
      isShowingAnySnackbar: this.state.isShowingAnySnackbar
    });
  },

  render() {
    return (
      <div>
        <Snackbar
          message={'WMATA\'s data feed is down! 😞\r\n(data up to ' + this.state.lastUpdatedTimestampFromNow + ' old)'}
          bodyStyle={{height: 'auto', lineHeight: 1, paddingTop: 8, paddingBottom: 8, whiteSpace: 'pre-line', textAlign: 'center', minWidth: 272}}
          open={this.state.isDataStale}
          onRequestClose={() => { /* do nothing; do not dismiss */ }}
        />
        <Snackbar
          message={'Network Problem, Retrying…' + (this.state.lastUpdatedTimestampFromNow ? '\r\n(data up to ' + this.state.lastUpdatedTimestampFromNow + ' old)' : '')}
          bodyStyle={{height: 'auto', lineHeight: 1, paddingTop: 8, paddingBottom: 8, whiteSpace: 'pre-line', textAlign: 'center', minWidth: 272}}
          open={this.state.isNetworkProblem}
          onRequestClose={() => { /* do nothing; do not dismiss */ }}
        />
        <AppCacheSnackbar
          isDataStale={this.state.isDataStale}
          isNetworkProblem={this.state.isNetworkProblem}
          isAppUpdateAvailable={this.state.isAppUpdateAvailable}
        />
      </div>
    );
  }
});
