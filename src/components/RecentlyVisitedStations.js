import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import ga from 'react-ga4';

import Utilities from '../utilities/Utilities';

import RecentlyVisitedStationsActions from '../actions/RecentlyVisitedStationsActions';
import RecentlyVisitedStationsStore from '../stores/RecentlyVisitedStationsStore';
import SettingsStore from '../stores/SettingsStore';

import {Card, CardText} from 'material-ui/Card';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more';
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(RecentlyVisitedStationsStore, 'onStoreChange'),
    Reflux.listenTo(SettingsStore, 'onStoreChange')
  ],

  propTypes: {
    onClickNavItem: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired
  },

  getStoreState() {
    return {
      shouldShowMoreStations: RecentlyVisitedStationsStore.get('shouldShowMoreStations'),
      isPersonalized: SettingsStore.get('isPersonalized')
    };
  },

  _buildLineDot(line) {
    const lineDotStyle = {
      height: 24,
      width: 24,
      margin: 2,
      marginRight: 8,
      textAlign: 'center',
      display: 'inline-block',
      color: '#ffffff',
      paddingTop: 8,
      fontSize: 13
    };

    if (line === 'red') {
      lineDotStyle.backgroundColor = "#E51636"
    } else if (line === 'orange') {
      lineDotStyle.backgroundColor = "#F68712"
    } else if (line === 'silver') {
      lineDotStyle.backgroundColor = "#9D9F9C"
    } else if (line === 'blue') {
      lineDotStyle.backgroundColor = "#1574C4"
    } else if (line === 'yellow') {
      lineDotStyle.backgroundColor = "#FCD006"
    } else if (line === 'green') {
      lineDotStyle.backgroundColor = "#0FAB4B"
    }

    return (
      <Paper className="station-list-item-component" style={lineDotStyle} zDepth={1} circle={true} />
    )
  },

  _onTapRecentlyVisitedStation(station) {
    ga.event({
      category: 'Dashboard',
      action: 'Tapped Recent Station'
    });
    const path = `/line-${station.lineColor}#${station.stationCode}`;
    ga.send({
      hitType: "pageview",
      page: path
    });

    this.props.onClickNavItem(path);
  },

  _onTapShowMoreStations() {
    RecentlyVisitedStationsActions.updateState({
      shouldShowMoreStations: !this.state.shouldShowMoreStations
    });
  },

  _buildRecentlyVisitedStationComponents(stations) {
    const stationComponents = [];

    stations.some((station, index) => {
      if (!this.state.shouldShowMoreStations && index >= 3) {
        return true;
      }

      stationComponents.push(
        <div key={station.lineColor + '-' + station.stationCode} className="station-list-item"
             onClick={this._onTapRecentlyVisitedStation.bind(null, station)}>
          {this._buildLineDot(station.lineColor)}
          <div className="station-list-item-component station-list-item-text">
            {station.stationName}
          </div>
        </div>
      );
    });

    return stationComponents;
  },

  render() {
    if (!this.props.isPersonalized) {
      return false;
    }

    let content;

    const stations = Utilities.getRecentlyVisitedStations();
    const stationComponents = this._buildRecentlyVisitedStationComponents(stations);
    if (typeof stationComponents !== 'undefined' && stationComponents.length > 0) {
      let showMoreButton;
      if (stations.length > 3) {
        showMoreButton = (
          <div>
            <Divider className="station-list-divider"/>
            <FlatButton label={this.state.shouldShowMoreStations ? 'Show Less' : 'Show More'} labelPosition="before"
                        icon={this.state.shouldShowMoreStations ? <NavigationExpandLess /> : <NavigationExpandMore />}
                        style={{width: 200}} onClick={this._onTapShowMoreStations}
              />
          </div>
        );
      }

      content = (
        <div>
          <div>
            <span style={{fontWeight: 500}}>Last Visited Stations</span>
            <br />
            <span style={{fontSize: 12}}>(tap a station name to see current train ETAs)</span>
          </div>
          <Divider className="station-list-divider" />
          <div className="station-list">
            {stationComponents}
          </div>
          {showMoreButton}
        </div>
      );
    } else {
      content = (
        <div style={{fontSize: 12}}>
          Your last visited stations will appear here as you tap into stations on our Line Maps.
        </div>
      );
    }

    return (
      <Card className="RecentlyVisitedStations" containerStyle={{paddingBottom: 0}}>
        <CardText>
          {content}
        </CardText>
      </Card>
    );
  }
});
