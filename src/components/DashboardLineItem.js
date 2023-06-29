import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import moment from 'moment';
import Linkify from 'react-linkify';

import DashboardLineItemActions from '../actions/DashboardLineItemActions';
import DashboardLineItemStore from '../stores/DashboardLineItemStore';
import PredictionsStore from '../stores/PredictionsStore';

import {Card, CardTitle, CardText} from 'material-ui/Card';
import {List, ListItem} from 'material-ui/List';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import AlertWarning from 'material-ui/svg-icons/alert/warning';
import Divider from 'material-ui/Divider';
import MapsMap from 'material-ui/svg-icons/maps/map';
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more';
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less';
import Subheader from 'material-ui/Subheader';

import {Tooltip} from 'react-tippy';

import ActionInfoOutline from 'material-ui/svg-icons/action/info-outline';
import ActionSettingsEthernet from 'material-ui/svg-icons/action/settings-ethernet';

import DashboardLineItemDetails from './DashboardLineItemDetails';
import DashboardLineItemChart from './DashboardLineItemChart';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(DashboardLineItemStore, 'onStoreChange'),
    Reflux.listenTo(PredictionsStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    lineName: PropTypes.string.isRequired,
    lineCode: PropTypes.string.isRequired,
    onClickNavItem: PropTypes.func,
    isDarkMode: PropTypes.bool.isRequired
  },

  getStoreState() {
    let numTrains;
    let numEightCarTrains;
    let numDelayedTrains;
    let expectedNumTrains;
    let averageHeadwayAdherence;
    let averageScheduleAdherence;
    let serviceGaps;

    const lineMetrics = (
      PredictionsStore.get('data') ?
        PredictionsStore.get('data').get('systemMetrics') ?
          PredictionsStore.get('data').get('systemMetrics').get('lineMetricsByLine') ?
            PredictionsStore.get('data').get('systemMetrics').get('lineMetricsByLine').get(this.props.lineCode)
            : null
          : null
        : null
    );
    if (lineMetrics) {
      numTrains = lineMetrics.get('numTrains');
      numEightCarTrains = lineMetrics.get('numEightCarTrains');
      numDelayedTrains = lineMetrics.get('numDelayedTrains');
      expectedNumTrains = lineMetrics.get('expectedNumTrains');
      averageHeadwayAdherence = lineMetrics.get('averageHeadwayAdherence');
      averageScheduleAdherence = lineMetrics.get('averageScheduleAdherence');
      serviceGaps = lineMetrics.get('serviceGaps');
    }

    return {
      showDetails: DashboardLineItemStore.get('showDetails'),
      numTrains,
      numEightCarTrains,
      numDelayedTrains,
      expectedNumTrains,
      numRailIncidents: PredictionsStore.get('data') ? PredictionsStore.get('data').get('lineRailIncidents') ? PredictionsStore.get('data').get('lineRailIncidents').filter(x => x.get('lineCodes') ? x.get('lineCodes').contains(this.props.lineCode) : false).size : null : null,
      averageHeadwayAdherence,
      averageScheduleAdherence,
      serviceGaps
    };
  },

  _onClickNavItem(path) {
    if (this.props.onClickNavItem) {
      this.props.onClickNavItem(path);
    }
  },

  _shouldShowDetails() {
    return this.state.showDetails.contains(this.props.lineCode);
  },

  _toggleShowDetails() {
    if (this._shouldShowDetails()) {
      DashboardLineItemActions.updateState({
        showDetails: this.state.showDetails.filter(x => x !== this.props.lineCode)
      });
    } else {
      DashboardLineItemActions.updateState({
        showDetails: this.state.showDetails.push(this.props.lineCode)
      });
    }
  },

  _getLineDot() {
    const lineDotStyle = {
      height: 64,
      width: 64,
      margin: 2,
      textAlign: 'center',
      display: 'inline-block',
      color: '#ffffff',
      paddingTop: 16,
      fontSize: 26,
      cursor: 'pointer'
    };

    if (this.props.lineCode === 'RD') {
      lineDotStyle.backgroundColor = "#E51636"
    } else if (this.props.lineCode === 'OR') {
      lineDotStyle.backgroundColor = "#F68712"
    } else if (this.props.lineCode === 'SV') {
      lineDotStyle.backgroundColor = "#9D9F9C"
    } else if (this.props.lineCode === 'BL') {
      lineDotStyle.backgroundColor = "#1574C4"
    } else if (this.props.lineCode === 'YL') {
      lineDotStyle.backgroundColor = "#FCD006"
    } else if (this.props.lineCode === 'GR') {
      lineDotStyle.backgroundColor = "#0FAB4B"
    }

    return (
      <Paper style={lineDotStyle} zDepth={1} circle={true} onClick={this._onClickNavItem.bind(null, '/line-' + this.props.lineName.toLowerCase())}>{this.props.lineCode}</Paper>
    );
  },

  render() {
    let incidentsContainer;
    if (this.state.numRailIncidents) {
      incidentsContainer = (
        <div>
          <List className="rail-incidents-list"
                style={{paddingBottom: 0}}>
            <Subheader style={{textAlign: 'center', lineHeight: 'initial', padding: 0}}>
              <div className="center-icon-container">
                <AlertWarning
                  className="center-icon-container-component-icon"
                  color={'#FFC107'}
                />
                <span className="center-icon-container-component">
                  {this.state.numRailIncidents} {this.state.numRailIncidents === 1 ? 'MetroAlert' : 'MetroAlerts'}
                </span>
              </div>
              {!this._shouldShowDetails() ?
                <span style={{fontWeight: 'normal', fontSize: 12}}>(tap 'Detail' button below for more info)</span>
                : null
              }
            </Subheader>
            {this._shouldShowDetails() ? <LineRailIncidents lineCode={this.props.lineCode} /> : null}
          </List>
        </div>
      );
    }

    const numTrains = this.state.numTrains;

    let expectedNumTrainsListItem;
    const expectedNumTrains = this.state.expectedNumTrains;
    if ((numTrains || numTrains === 0) && (expectedNumTrains || expectedNumTrains === 0)) {
      const diff = numTrains - expectedNumTrains;
      if (diff > 0) {
        expectedNumTrainsListItem = (
          <li>{diff} more than scheduled</li>
        );
      } else {
        expectedNumTrainsListItem = (
          <li>{Math.abs(diff)} fewer than scheduled</li>
        );
      }
    }

    let percentageEightCarTrains;
    if ((this.state.numEightCarTrains || this.state.numEightCarTrains === 0) && numTrains) {
      percentageEightCarTrains = Math.round((this.state.numEightCarTrains / numTrains) * 100);
    } else if (numTrains === 0) {
      percentageEightCarTrains = 0;
    } else {
      percentageEightCarTrains = '?';
    }

    let percentageDelayedTrains;
    if ((this.state.numDelayedTrains || this.state.numDelayedTrains === 0) && numTrains) {
      percentageDelayedTrains = Math.round((this.state.numDelayedTrains / numTrains) * 100);
    } else if (numTrains === 0) {
      percentageDelayedTrains = 0;
    } else {
      percentageDelayedTrains = '?';
    }

    let numServiceGapsListItem;
    if (this.state.serviceGaps) {
      numServiceGapsListItem = (
        <li>{this.state.serviceGaps.size} notable service gap{(this.state.serviceGaps.size !== 1) ? "s" : ""}</li>
      );
    } else {
      numServiceGapsListItem = (
        <li>? notable service gaps</li>
      );
    }

    let serviceGaps;
    if (this.state.serviceGaps && this._shouldShowDetails()) {
      const serviceGapItems = [];

      this.state.serviceGaps.forEach((serviceGap) => {
        const timeBetweenTrains = serviceGap.get('timeBetweenTrains');
        const scheduledTimeBetweenTrains = serviceGap.get('scheduledTimeBetweenTrains');
        const diffTimeBetweenTrains = (timeBetweenTrains - scheduledTimeBetweenTrains);

        const percentDifference = Math.round((diffTimeBetweenTrains / scheduledTimeBetweenTrains) * 100);

        serviceGapItems.push(
          <li
            key={`${serviceGap.get('fromTrainId')}-${serviceGap.get('toTrainId')}`}
            style={{
              textAlign: 'left'
            }}
          >
            {Math.round(timeBetweenTrains)}-minute service gap for {serviceGap.get('direction').toLowerCase()} trains from {serviceGap.get('fromStationName')} to {serviceGap.get('toStationName')}, {Math.round(diffTimeBetweenTrains)} minutes ({percentDifference}%) longer than scheduled
          </li>
        );
      });

      serviceGaps = (
        <div
          style={{
            marginTop: 12,
            marginBottom: 6,
            border: `1px solid ${this.context.muiTheme.palette.borderColor}`,
            padding: this.state.serviceGaps.size ? '6px 6px 10px' : 6,
            backgroundColor: this.context.muiTheme.palette.clockCircleColor
          }}
        >
          <div
            className="center-icon-container"
          >
            <ActionSettingsEthernet
              className="center-icon-container-component-icon"
            />
            <span
              className="center-icon-container-component"
            >
              {this.state.serviceGaps.size ? this.state.serviceGaps.size : "No"} notable service gap{(this.state.serviceGaps.size !== 1) ? "s" : ""}{(this.state.serviceGaps.size !== 0) ? ":" : ""}
            </span>
          </div>
          <ul
            style={{
              paddingLeft: 18,
              margin: 0,
              color: this.context.muiTheme.palette.textColor,
              fontSize: 12
            }}
          >
            {serviceGapItems}
          </ul>
        </div>
      );
    }

    return (
      <Card className="DashboardLineItem">
        <div className={"line-description " + this.props.lineName.toLowerCase()}>
          <CardTitle title={this._getLineDot()}
                     titleColor={this.context.muiTheme.palette.alternateTextColor}
                     style={{display: 'inline-block', width: '40%', padding: 0, verticalAlign: 'middle'}} />
          <div style={{display: 'inline-block', width: '60%', textAlign: 'left', verticalAlign: 'middle'}}>
            <div><strong>{(numTrains || numTrains === 0) ? numTrains : '?'}</strong> active train{(numTrains === 1) ? '' : 's'}</div>
            <ul style={{paddingLeft: 18, margin: 0, color: this.context.muiTheme.palette.textColor, fontSize: 12}}>
              <li>{(this.state.numEightCarTrains || this.state.numEightCarTrains === 0) ? this.state.numEightCarTrains : '?'} ({percentageEightCarTrains}%) eight-car</li>
              <li>{(this.state.numDelayedTrains || this.state.numDelayedTrains === 0) ? this.state.numDelayedTrains : '?'} ({percentageDelayedTrains}%) tardy</li>
              {expectedNumTrainsListItem}
              {numServiceGapsListItem}
            </ul>
          </div>
        </div>
        <CardText style={{paddingTop: 8, paddingBottom: 8}}>
          {incidentsContainer}
          <div style={{padding: 8}}>
            <div style={{display: 'inline-block', width: '50%'}}>
              <div style={{fontSize: 12}}>
                Headway Adherence
              </div>
              <div style={{fontSize: 24}}>
                {(this.state.averageHeadwayAdherence != null) ? `${Math.round(this.state.averageHeadwayAdherence)}%` : "N/A"}
                <Tooltip
                  title="How often trains are arriving at scheduled station stops in no more than 2 minutes later than their scheduled headways. This is measuring the accuracy of WMATA's scheduled train frequencies."
                  position="bottom"
                  arrow={true}
                  animateFill={false}
                  distance={4}
                >
                  <ActionInfoOutline
                    style={{
                      width: 16,
                      height: 16,
                      color: this.context.muiTheme.palette.secondaryTextColor
                    }}
                  />
                </Tooltip>
              </div>
            </div>
            <div style={{display: 'inline-block', width: '50%'}}>
              <div style={{fontSize: 12}}>
                Schedule Adherence
              </div>
              <div style={{fontSize: 24}}>
                {(this.state.averageScheduleAdherence != null) ? `${Math.round(this.state.averageScheduleAdherence)}%` : "N/A"}
                <Tooltip
                  title="How often trains are arriving at scheduled station stops within 2 minutes of their scheduled arrival time. This is measuring the accuracy of the arrival times shown in WMATA's official Trip Planner on their website."
                  position="bottom"
                  arrow={true}
                  animateFill={false}
                  distance={4}
                >
                  <ActionInfoOutline
                    style={{
                      width: 16,
                      height: 16,
                      color: this.context.muiTheme.palette.secondaryTextColor
                    }}
                  />
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="destinations">
            {(numTrains && !this._shouldShowDetails()) ?
              <div style={{marginBottom: 4}}>
                <div style={{color: this.context.muiTheme.palette.secondaryTextColor}}>
                  <div className="line-item-details-header left" />
                  <div className="line-item-details-header right">avg time btwn trains</div>
                </div>
                <Divider style={{margin: 0}} />
              </div>
              : null
            }
            <LineItemDetails
              lineCode={this.props.lineCode}
              shouldShowDetails={this._shouldShowDetails()}
            />
          </div>
          {serviceGaps}
          <DashboardLineItemChart
            key={this.props.isDarkMode}
            lineCode={this.props.lineCode}
          />
          <div style={{marginTop: 8}}>
            <RaisedButton
              label={'Live Map'}
              onClick={this._onClickNavItem.bind(null, '/line-' + this.props.lineName.toLowerCase())}
              icon={<MapsMap />}
              style={{width: 125, marginRight: 4}}
            />
            <RaisedButton
              label='Detail'
              onClick={this._toggleShowDetails}
              labelPosition="before"
              icon={this._shouldShowDetails() ? <NavigationExpandLess /> : <NavigationExpandMore />}
              style={{width: 125, marginLeft: 4}}
            />
          </div>
        </CardText>
      </Card>
    );
  }
});

const LineRailIncidents = createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(PredictionsStore, 'onStoreChange')
  ],

  propTypes: {
    lineCode: PropTypes.string.isRequired
  },

  getStoreState() {
    return {
      lineRailIncidents: PredictionsStore.get('data') ? PredictionsStore.get('data').get('lineRailIncidents') ? PredictionsStore.get('data').get('lineRailIncidents').filter(x => x.get('lineCodes') ? x.get('lineCodes').contains(this.props.lineCode) : false) : null : null
    };
  },

  render() {
    if (!this.state.lineRailIncidents) {
      return false;
    }

    const incidents = [];

    this.state.lineRailIncidents.forEach((incident) => {
      const time = moment.unix(incident.get('timestamp'));
      incidents.push(
        <ListItem key={incident.get('description')}
                  primaryText={<Linkify properties={{target: 'blank'}}>{incident.get('description')}</Linkify>}
                  secondaryText={<div style={{textAlign: 'right', fontSize: 12}}>{"as of " + time.fromNow() + " (" + time.format("h:mm a") + ")"}</div>}
                  innerDivStyle={{padding: 8, fontSize: 13}}
                  disabled />
      );
    });

    return (
      <div>
        {incidents}
      </div>
    );
  }
});

const LineItemDetails = createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(PredictionsStore, 'onStoreChange')
  ],

  propTypes: {
    lineCode: PropTypes.string.isRequired,
    shouldShowDetails: PropTypes.bool.isRequired
  },

  getStoreState() {
    return {
      lineMetrics: (
        PredictionsStore.get('data') ?
          PredictionsStore.get('data').get('systemMetrics') ?
            PredictionsStore.get('data').get('systemMetrics').get('lineMetricsByLine') ?
              PredictionsStore.get('data').get('systemMetrics').get('lineMetricsByLine').get(this.props.lineCode)
              : null
            : null
          : null
      )
    };
  },

  render() {
    if (!this.state.lineMetrics) {
      return false;
    }

    const lineItemDetails = [];

    this.state.lineMetrics.get('directionMetricsByDirection').forEach((destinationMetrics, directionNumber) => {
      lineItemDetails.push(
        <DashboardLineItemDetails
          key={"dlid-" + this.props.lineCode + "-" + directionNumber}
          lineCode={this.props.lineCode}
          directionNumber={directionNumber}
          destinationMetrics={destinationMetrics}
          showDetails={this.props.shouldShowDetails}
        />
      );
    });

    return (
      <div>
        {lineItemDetails}
      </div>
    );
  }
});
