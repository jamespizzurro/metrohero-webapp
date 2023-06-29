import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';

import PredictionsStore from '../stores/PredictionsStore';
import SettingsStore from "../stores/SettingsStore";

import FontIcon from 'material-ui/FontIcon';
import ActionThumbUp from 'material-ui/svg-icons/action/thumb-up';
import ActionThumbDown from 'material-ui/svg-icons/action/thumb-down';
import AlertWarning from 'material-ui/svg-icons/alert/warning';

import StationDot from './StationDot';
import LineTransfer from './LineTransfer';

import {red400, green400} from 'material-ui/styles/colors';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(PredictionsStore, 'onStoreChange'),
    Reflux.listenTo(SettingsStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    stationName: PropTypes.string.isRequired,
    stationCode: PropTypes.string.isRequired,
    fromLineCodes: PropTypes.array,
    toLineCodes: PropTypes.array,
    onClick: PropTypes.func.isRequired,
    stationTwitterOnClick: PropTypes.func.isRequired,
    onTapOutage: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired
  },

  getStoreState() {
    return this._getStoreState(this.props.stationCode);
  },

  _getStoreState(stationCode) {
    let hasPositiveTags;
    let hasNegativeTags;
    let hasRailIncidents;
    let hasTwitterProblems;
    let hasElevatorOutages;
    let hasEscalatorOutages;

    const isPlaybackLoaded = PredictionsStore.get('playback') ? PredictionsStore.get('playback').get('enabled') : false;
    const data = PredictionsStore.get('data');
    if (!isPlaybackLoaded && data) {
      hasPositiveTags = data.get('stationNumPositiveTagsMap') ? !!data.get('stationNumPositiveTagsMap').get(stationCode) : false;
      hasNegativeTags = data.get('stationNumNegativeTagsMap') ? !!data.get('stationNumNegativeTagsMap').get(stationCode) : false;
      hasRailIncidents = data.get('stationHasRailIncidentsMap') ? !!data.get('stationHasRailIncidentsMap').get(stationCode) : false;
      hasTwitterProblems = data.get('stationHasTwitterProblemMap') ? !!data.get('stationHasTwitterProblemMap').get(stationCode) : false;
      hasElevatorOutages = data.get('hasElevatorOutagesByStation') ? !!data.get('hasElevatorOutagesByStation').get(stationCode) : false;
      hasEscalatorOutages = data.get('hasEscalatorOutagesByStation') ? !!data.get('hasEscalatorOutagesByStation').get(stationCode) : false;
    } else {
      hasPositiveTags = false;
      hasNegativeTags = false;
      hasRailIncidents = false;
      hasTwitterProblems = false;
      hasElevatorOutages = false;
      hasEscalatorOutages = false;
    }

    return {
      hasPositiveTags,
      hasNegativeTags,
      hasRailIncidents,
      hasTwitterProblems,
      hasElevatorOutages,
      hasEscalatorOutages,
      isNerdMode: SettingsStore.get('isNerdMode')
    };
  },

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.stationCode !== this.props.stationCode) {
      // using this.props.stationCode in getStoreState necessitates a manual state update when this.props.stationCode changes
      this.setState(this._getStoreState(nextProps.stationCode));
    }
  },

  render() {
    const stationTags = [];
    if (this.state.hasRailIncidents) {
      stationTags.push(
        <AlertWarning
          key={this.props.stationCode + "-alerts"}
          color={'#FFC107'}
          style={{width: 18, height: 18, cursor: 'pointer'}}
          onClick={this.props.stationTwitterOnClick}
        />
      );
    }
    if (this.state.hasElevatorOutages) {
      const svg = `
        <svg
          id="svg4579"
          viewBox="0 0 100 100"
          version="1.1"
          width="18px"
          height="18px">
          <path
            style="fill:none;stroke:#F34235;stroke-width:7.30151558;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"
            d="M 64.892215,34.772014 93.01971,64.238911 z"
            id="path3868" />
          <path
            style="fill:none;stroke:#F34235;stroke-width:7.30151558;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"
            d="M 93.01971,34.772014 64.892215,64.238911 z"
            id="path3868-3" />
          <g
            id="g4688"
            transform="translate(-19.06753,0)">
            <path
              id="path4690"
              d="m 36.171,46.3 c 0,0 -3.69,0 -2.125,-3.038 14.556,-29.037 14.556,-29.037 14.556,-29.037 0,0 1.361,-3.038 2.907,0 14.574,29.037 14.574,29.037 14.574,29.037 0,0 1.361,3.038 -2.143,3.038 H 36.171 z m 0,7.4 c 0,0 -3.69,0 -2.125,3.019 14.556,29.056 14.556,29.056 14.556,29.056 0,0 1.361,3.019 2.907,0 14.574,-29.056 14.574,-29.056 14.574,-29.056 0,0 1.361,-3.019 -2.143,-3.019 H 36.171 z m 32.075,33.155 c 0.951,0 1.715,0.783 1.715,1.733 0,0.95 -0.764,1.715 -1.715,1.715 -0.951,0 -1.733,-0.764 -1.733,-1.715 0,-0.951 0.783,-1.733 1.733,-1.733 l 0,0 z M 31.754,9.678 c 0.951,0 1.733,0.783 1.733,1.733 0,0.95 -0.783,1.733 -1.733,1.733 -0.95,0 -1.715,-0.783 -1.715,-1.733 0,-0.95 0.764,-1.733 1.715,-1.733 l 0,0 z M 29.033,5 h 41.916 c 1.696,0 3.094,1.398 3.094,3.075 V 91.906 C 74.043,93.602 72.645,95 70.949,95 H 29.033 c -1.677,0 -3.075,-1.398 -3.075,-3.094 V 8.075 C 25.958,6.398 27.356,5 29.033,5 l 0,0 z"
              style="fill:${this.context.muiTheme.palette.secondaryTextColor};fill-rule:evenodd" />
          </g>
        </svg>
      `;
      stationTags.push(
        <div
          key={this.props.stationCode + "-elevator"}
          className="station-problem"
          dangerouslySetInnerHTML={{__html: svg}}
          style={{cursor: "pointer"}}
          onClick={this.props.onTapOutage}
        />
      );
    }
    if (this.state.hasEscalatorOutages) {
      const svg = `
        <svg
           version="1.1"
           x="0px"
           y="0px"
           viewBox="0 0 375 375"
           enable-background="new 0 0 512 512"
           id="svg3974"
           width="18px"
           height="18px"
           style="fill:${this.context.muiTheme.palette.secondaryTextColor}">
          <path
             id="path3978"
             d="m 311,68.5 -88.5,88.6 c -6.2,-18.7 -23.6,-32.3 -44.3,-32.3 -25.9,0 -46.9,21 -46.9,46.9 v 76.6 L 86,293.5 H 0 V 331 h 101.5 l 225,-225 H 375 V 68.5 h -64 z" /><circle
             id="circle3980"
             r="28.1"
             cy="190.39999"
             cx="246.60001"
             transform="translate(-68.5,-112.5)"
             style="fill:${this.context.muiTheme.palette.secondaryTextColor}" />
          <g
             id="g4623"
             transform="translate(-68.5,-112.5)">
            <path
                 id="path3868"
                 d="m 320.05173,326.46459 96.30704,100.89308 z"
                 style="fill:none;stroke:#F34235;stroke-width:25;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" />
            <path
                 id="path3868-3"
                 d="M 416.35877,326.46459 320.05173,427.35767 z"
                 style="fill:none;stroke:#F34235;stroke-width:25;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" />
          </g>
        </svg>
      `;
      stationTags.push(
        <div
          key={this.props.stationCode + "-escalator"}
          className="station-problem"
          dangerouslySetInnerHTML={{__html: svg}}
          style={{cursor: "pointer"}}
          onClick={this.props.onTapOutage}
        />
      );
    }
    if (this.state.hasTwitterProblems) {
      stationTags.push(
        <FontIcon key={this.props.stationCode + "-twitter"}
                  className="station-problem metrohero-twitter"
                  onClick={this.props.stationTwitterOnClick} />
      );
    }
    if (this.state.hasPositiveTags || this.state.hasNegativeTags) {
      const iconStyle = {
        display: 'inline-block',
        fill: '#fff',
        width: 12,
        height: 12,
        marginBottom: 1,
        marginLeft: 0,
        marginRight: 2
      };
      if (this.state.hasPositiveTags) {
        const ratingStyle = {
          width: 16,
          height: 16,
          zIndex: 2,
          borderRadius: '50%',
          color: 'rgb(255, 255, 255)',
          backgroundColor: green400,
          border: '1px ${this.context.muiTheme.palette.canvasColor} solid',
          float: 'right'
        };
        stationTags.push(
          <div key={this.props.stationCode + "-positive"} className="clickable"
               style={ratingStyle} onClick={this.props.stationTwitterOnClick}>
            <ActionThumbUp style={iconStyle}/>
          </div>
        );
      }
      if (this.state.hasNegativeTags) {
        const ratingStyle = {
          width: 16,
          height: 16,
          zIndex: 2,
          borderRadius: '50%',
          color: 'rgb(255, 255, 255)',
          backgroundColor: red400,
          border: `1px ${this.context.muiTheme.palette.canvasColor} solid`,
          float: 'right'
        };
        stationTags.push(
          <div key={this.props.stationCode + "-negative"} className="clickable"
               style={ratingStyle} onClick={this.props.stationTwitterOnClick}>
            <ActionThumbDown style={iconStyle}/>
          </div>
        );
      }
    }

    let lineTransfer;
    if (this.props.fromLineCodes || this.props.toLineCodes) {
      lineTransfer = (
        <LineTransfer stationCode={this.props.stationCode} fromLineCodes={this.props.fromLineCodes} toLineCodes={this.props.toLineCodes} />
      );
    }

    return (
      <div className="StationRow">
        {lineTransfer}
        <StationDot onClick={this.props.onClick} />
        <span className="station-name" style={{color: this.context.muiTheme.palette.secondaryTextColor}}
              onClick={this.props.onClick}>
          {this.state.isNerdMode ? this.props.stationCode : this.props.stationName}
        </span>
        <div className="station-problems">
          {stationTags}
        </div>
      </div>
    );
  }
});
