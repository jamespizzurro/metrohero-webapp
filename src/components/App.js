import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import moment from 'moment';
import ga from 'react-ga4';
import ls from 'local-storage';

import Utilities from '../utilities/Utilities';

import PredictionsActions from '../actions/PredictionsActions';
import PredictionsStore from '../stores/PredictionsStore';
import AppActions from '../actions/AppActions';
import AppStore from '../stores/AppStore';
import SettingsStore from '../stores/SettingsStore';

import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';
import Chip from 'material-ui/Chip';

import Dashboard from './Dashboard';
import MyCommute from './MyCommute';
import SystemMap from './SystemMap';
import DashboardHistory from './DashboardHistory';
import Faq from './Faq';
import Line from './Line';
import RealtimeMap from './RealtimeMap';
import TrainDepartures from './TrainDepartures';
import CircuitMapApp from './CircuitMapApp';
import AppSnackbars from './AppSnackbars';
import AppLoadingSpinner from './AppLoadingSpinner';
import PerformanceSummary from './PerformanceSummary';
import Notification from './Notification';
import Audit from './Audit';
import Settings from './Settings';
import MareyDiagram from './MareyDiagram';

import LightTheme from '../LightTheme';
import DarkTheme from '../DarkTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(PredictionsStore, 'onStoreChange'),
    Reflux.listenTo(AppStore, 'onStoreChange'),
    Reflux.listenTo(SettingsStore, 'onStoreChange')
  ],

  getStoreState() {
    return {
      isDrawerOpen: AppStore.get('isDrawerOpen'),
      playbackEnabled: AppStore.get('playbackEnabled'),
      playbackLoaded: PredictionsStore.get('playback').get('loaded'),
      isMobileDevice: AppStore.get('isMobileDevice'),
      isDarkMode: SettingsStore.get('isDarkMode'),
      defaultPage: AppStore.get('defaultPage')
    };
  },

  childContextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  getChildContext() {
    return {
      muiTheme: getMuiTheme(this.state.isDarkMode ? DarkTheme : LightTheme)
    };
  },

  UNSAFE_componentWillMount() {
    ga.initialize('G-7PMPTFBSB3');
    ga.send({
      hitType: "pageview",
      page: window.location.pathname
    });

    AppActions.updateState({
      effectiveViewportHeight: document.body.scrollHeight
    });
  },

  componentDidMount() {
    this._addListeners();

    PredictionsActions.getPredictions();

    AppActions.updateState({
      playbackEnabled: (window.location.hash === '#playback')
    });

    const now = moment();
    const lastActive = ls.get('lastActive');
    const shouldRestoreState = lastActive && (now.diff(lastActive, 'minutes') <= 2) && this.state.isMobileDevice;
    if (shouldRestoreState) {
      const lastActivePage = ls.get('lastActivePage');
      if (lastActivePage) {
        this.props.history.replace(lastActivePage);
      }
    } else if (this.props.location.pathname === '/') {
      this.props.history.replace(this.state.defaultPage);
    }

    ls.set('lastActive', moment().format());
    ls.set('lastActivePage', this.props.location.pathname);
    setInterval(() => {
      ls.set('lastActive', moment().format());
    }, 5000);
  },

  componentDidUpdate(prevProps, prevState) {
    AppActions.updateState({
      playbackEnabled: (window.location.hash === '#playback')
    });

    const playbackModeChanged = (this.state.playbackEnabled !== prevState.playbackEnabled);
    if (playbackModeChanged) {
      if (this.state.playbackEnabled) {
        PredictionsActions.getPredictions(moment().unix());
      } else {
        PredictionsActions.getPredictions();
      }
    }

    ls.set('lastActivePage', this.props.location.pathname);
  },

  componentWillUnmount() {
    this._removeListeners();
  },

  _isScrollableOrHasScrollableAncestor(event) {
    let el = event.target;

    while (el != null && el instanceof Element) {
      const style = window.getComputedStyle(el);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        return true;
      }

      el = el.parentNode;
    }

    return false;
  },
  _onTouchMove(event) {
    // don't allow zooming
    // https://stackoverflow.com/a/42780478/1072621
    if (event.scale != null && event.scale !== 1) {
      event.preventDefault();
      return;
    }

    // don't allow anything other than vertically scrollable elements to be scrolled
    if (!this._isScrollableOrHasScrollableAncestor(event)) {
      event.preventDefault();
      return;
    }
  },
  _onResize() {
    AppActions.updateState({
      effectiveViewportHeight: document.body.scrollHeight
    });
  },
  _addListeners() {
    window.addEventListener('touchmove', this._onTouchMove, {passive: false});
    window.addEventListener('resize', this._onResize);
  },
  _removeListeners() {
    window.removeEventListener('touchmove', this._onTouchMove, {passive: false});
    window.removeEventListener('resize', this._onResize);
  },

  _toggleDrawer(shouldShow) {
    AppActions.updateState({
      isDrawerOpen: shouldShow
    });
  },

  _getLineCodeFromLineColor(lineColor) {
    let lineCode;
    if (lineColor === 'red') {
      lineCode = 'RD';
    } else if (lineColor === 'orange') {
      lineCode = 'OR';
    } else if (lineColor === 'silver') {
      lineCode = 'SV';
    } else if (lineColor === 'blue') {
      lineCode = 'BL';
    } else if (lineColor === 'yellow') {
      lineCode = 'YL';
    } else if (lineColor === 'green') {
      lineCode = 'GR';
    }
    return lineCode;
  },

  _onClickNavItem(path) {
    if (path.indexOf('/line-') > -1) {
      Utilities.addRecentlyVisitedLine(this._getLineCodeFromLineColor(path.split('/line-')[1].split('#')[0]));
    }

    ga.send({
      hitType: "pageview",
      page: path
    });

    this.props.history.push(path);

    if (this.state.isDrawerOpen) {
      AppActions.updateState({
        isDrawerOpen: false
      });
    }

    // scroll to top of the page
    window.scrollTo(0, 0);
  },

  _onClickNavItemLink(action, url) {
    ga.outboundLink({label: action});
    window.open(url, '_blank');
  },

  _getLineDot(lineCode) {
    const lineDotStyle = {
      height: 24,
      width: 24,
      margin: 2,
      top: 10,
      right: 12,
      textAlign: 'center',
      display: 'inline-block',
      color: '#ffffff',
      paddingTop: 16,
      fontSize: 26
    };

    if (lineCode === 'RD') {
      lineDotStyle.backgroundColor = "#E51636"
    } else if (lineCode === 'OR') {
      lineDotStyle.backgroundColor = "#F68712"
    } else if (lineCode === 'SV') {
      lineDotStyle.backgroundColor = "#9D9F9C"
    } else if (lineCode === 'BL') {
      lineDotStyle.backgroundColor = "#1574C4"
    } else if (lineCode === 'YL') {
      lineDotStyle.backgroundColor = "#FCD006"
    } else if (lineCode === 'GR') {
      lineDotStyle.backgroundColor = "#0FAB4B"
    }

    return (
      <Paper style={lineDotStyle} zDepth={1} circle={true} />
    );
  },

  render() {
    const muiTheme = getMuiTheme(this.state.isDarkMode ? DarkTheme : LightTheme);

    let routeContent;
    if (this.props.location.pathname === '/system-map') {
      routeContent = (
        <SystemMap
          isDarkMode={this.state.isDarkMode}
        />
      );
    } else if (this.props.location.pathname === '/realtime-map') {
      routeContent = (
        <RealtimeMap
          isPlaybackLoaded={this.state.playbackLoaded}
          isDarkMode={this.state.isDarkMode}
          isMobileDevice={this.state.isMobileDevice}
        />
      );
    } else if (this.props.location.pathname === '/history') {
      routeContent = (
        <DashboardHistory
          isDarkMode={this.state.isDarkMode}
        />
      );
    } else if (this.props.location.pathname === '/departures') {
      routeContent = (
        <TrainDepartures
          isDarkMode={this.state.isDarkMode}
        />
      );
    } else if (this.props.location.pathname === '/performance') {
      routeContent = (
        <PerformanceSummary
          isDarkMode={this.state.isDarkMode}
        />
      );
    } else if (this.props.location.pathname === '/faq') {
      routeContent = (
        <Faq
          isDarkMode={this.state.isDarkMode}
        />
      );
    } else if (this.props.location.pathname === '/circuit-map') {
      routeContent = (
        <CircuitMapApp
          isPlaybackLoaded={this.state.playbackLoaded}
          isDarkMode={this.state.isDarkMode}
        />
      );
    } else if (this.props.location.pathname === '/realtime-audit') {
      routeContent = (
        <Audit
          isDarkMode={this.state.isDarkMode}
        />
      );
    } else if (this.props.location.pathname.indexOf('/line-') > -1) {
      routeContent = (
        <Line
          lineColor={this.props.location.pathname.split('/line-')[1].split('#')[0]}
          isPlaybackLoaded={this.state.playbackLoaded}
          onClickNavItem={this._onClickNavItem}
          isDarkMode={this.state.isDarkMode}
        />
      );
    } else if (this.props.location.pathname === '/dashboard') {
      routeContent = (
        <Dashboard
          onClickNavItem={this._onClickNavItem}
          isDarkMode={this.state.isDarkMode}
        />
      );
    } else if (this.props.location.pathname === '/my-commute') {
      routeContent = (
        <MyCommute
          onClickNavItem={this._onClickNavItem}
          isDarkMode={this.state.isDarkMode}
        />
      );
    } else if (this.props.location.pathname === '/settings') {
      routeContent = (
        <Settings />
      );
    } else if (this.props.location.pathname === '/mareydiagram') {
      routeContent = (
        <MareyDiagram
          isDarkMode={this.state.isDarkMode}
        />
      );
    } else {
      // default depends on whether this is a mobile device or not
      if (this.state.isMobileDevice) {
        routeContent = (
          <MyCommute
            onClickNavItem={this._onClickNavItem}
            isDarkMode={this.state.isDarkMode}
          />
        );
      } else {
        routeContent = (
          <Dashboard
            onClickNavItem={this._onClickNavItem}
            isDarkMode={this.state.isDarkMode}
          />
        );
      }
    }

    return (
      <div style={{position: 'relative', width: '100%', height: '100%', background: muiTheme.background, overflow: 'hidden'}}>
        <AppBar className="app-bar"
                title="MetroHero"
                iconElementRight={<AppLoadingSpinner />}
                onLeftIconButtonClick={this._toggleDrawer.bind(null, true)}
                style={{position: 'fixed', overflow: 'hidden'}} />
        <Drawer containerClassName='vertical-scrolling' docked={false} open={this.state.isDrawerOpen} onRequestChange={this._toggleDrawer}>
          <div
            style={{
              height: 8
            }}
          />
          <MenuItem className="left-nav-item" onClick={this._onClickNavItem.bind(null, '/dashboard')}>Dashboard</MenuItem>
          <MenuItem
            className="left-nav-item"
            onClick={this._onClickNavItem.bind(null, '/my-commute')}
          >
            My Commute
          </MenuItem>
          <MenuItem className="left-nav-item" onClick={this._onClickNavItem.bind(null, '/system-map')}>System Map</MenuItem>
          <MenuItem className="left-nav-item" onClick={this._onClickNavItem.bind(null, '/faq')}>FAQ</MenuItem>
          <MenuItem className="left-nav-item" onClick={this._onClickNavItem.bind(null, '/settings')}>Settings</MenuItem>
          <Subheader className="left-nav-subheader">Real-Time Line Maps</Subheader>
          <MenuItem className="left-nav-item" rightIcon={this._getLineDot('RD')} onClick={this._onClickNavItem.bind(null, '/line-red')}>Red</MenuItem>
          <MenuItem className="left-nav-item" rightIcon={this._getLineDot('OR')} onClick={this._onClickNavItem.bind(null, '/line-orange')}>Orange</MenuItem>
          <MenuItem className="left-nav-item" rightIcon={this._getLineDot('SV')} onClick={this._onClickNavItem.bind(null, '/line-silver')}>Silver</MenuItem>
          <MenuItem className="left-nav-item" rightIcon={this._getLineDot('BL')} onClick={this._onClickNavItem.bind(null, '/line-blue')}>Blue</MenuItem>
          <MenuItem className="left-nav-item" rightIcon={this._getLineDot('YL')} onClick={this._onClickNavItem.bind(null, '/line-yellow')}>Yellow</MenuItem>
          <MenuItem className="left-nav-item" rightIcon={this._getLineDot('GR')} onClick={this._onClickNavItem.bind(null, '/line-green')}>Green</MenuItem>
          <Subheader className="left-nav-subheader">Extras</Subheader>
          <MenuItem className="left-nav-item" onClick={this._onClickNavItem.bind(null, '/realtime-map')}>Live Google Map</MenuItem>
          <MenuItem className="left-nav-item" onClick={this._onClickNavItem.bind(null, '/realtime-audit')}>Live Performance Audit</MenuItem>
          <MenuItem className="left-nav-item" onClick={this._onClickNavItem.bind(null, '/mareydiagram')}>Marey Diagram</MenuItem>
          <MenuItem
            className="left-nav-item"
            onClick={this._onClickNavItemLink.bind(null, 'Clicked Link to ARIES', 'https://aries.dcmetrohero.com')}
          >
            ARIES for Transit
          </MenuItem>
          <Subheader className="left-nav-subheader">Historical Data</Subheader>
          <MenuItem className="left-nav-item" onClick={this._onClickNavItem.bind(null, '/performance')}>Performance Summary</MenuItem>
          <MenuItem className="left-nav-item" onClick={!this.state.isMobileDevice ? this._onClickNavItem.bind(null, '/departures') : null} disabled={this.state.isMobileDevice}>
            {`Departures${this.state.isMobileDevice ? ' (desktop only)' : ''}`}
          </MenuItem>
          <MenuItem className="left-nav-item" onClick={!this.state.isMobileDevice ? this._onClickNavItem.bind(null, '/history') : null} disabled={this.state.isMobileDevice}>
            {`Metrics${this.state.isMobileDevice ? ' (desktop only)' : ''}`}
          </MenuItem>
          <Subheader className="left-nav-subheader">Developer Support</Subheader>
          <MenuItem className="left-nav-item" onClick={this._onClickNavItemLink.bind(null, 'Clicked Link to Public API Docs', '/apis')}>Public API Documentation</MenuItem>
          <Subheader className="left-nav-subheader">External Links</Subheader>
          {!this.state.isMobileDevice ? <MenuItem className="left-nav-item" onClick={this._onClickNavItemLink.bind(null, 'Clicked Link to App on Google Play', 'https://play.google.com/store/apps/details?id=com.hodgepig.wmata')}>Download our Android app</MenuItem> : null}
          {!this.state.isMobileDevice ? <MenuItem className="left-nav-item" onClick={this._onClickNavItemLink.bind(null, 'Clicked Link to App on Apple App Store', 'https://itunes.apple.com/us/app/metrohero/id1375269139')}>Download our iOS app</MenuItem> : null}
          <MenuItem className="left-nav-item" onClick={this._onClickNavItemLink.bind(null, 'Clicked Link to @metroheroapp Twitter', 'https://twitter.com/dcmetrohero')}>Follow us on Twitter</MenuItem>
          <MenuItem className="left-nav-item" onClick={this._onClickNavItemLink.bind(null, 'Clicked Link to MetroHero Facebook', 'https://www.facebook.com/dcmetrohero')}>Like us on Facebook</MenuItem>
          <MenuItem className="left-nav-item" onClick={this._onClickNavItemLink.bind(null, 'Clicked Link to r/dcmetrohero Subreddit', 'https://www.reddit.com/r/dcmetrohero')}>Browse our Subreddit</MenuItem>
          <MenuItem className="left-nav-item" onClick={this._onClickNavItemLink.bind(null, 'Clicked Link to Patreon', 'https://www.patreon.com/metrohero')}>Become a Patron</MenuItem>
          <MenuItem className="left-nav-item" onClick={this._onClickNavItemLink.bind(null, 'Clicked Link to T-shirt', 'https://www.amazon.com/dp/B07N1BJQZ5')}>Buy a MetroHero T-shirt</MenuItem>
          <MenuItem className="left-nav-item" onClick={this._onClickNavItemLink.bind(null, 'Clicked Link to Trello', 'https://trello.com/b/82MKv5uq')}>Browse our To-do List</MenuItem>
          <div
            style={{
              height: 48
            }}
          />
        </Drawer>
        {routeContent}
        <Notification />
        <AppSnackbars />
      </div>
    );
  }
});
