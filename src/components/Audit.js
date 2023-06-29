import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import Reflux from 'reflux';
import _ from 'lodash';

import AuditActions from '../actions/AuditActions';
import AuditStore from '../stores/AuditStore';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {Card, CardTitle, CardHeader, CardText} from 'material-ui/Card';
import AlertErrorOutline from 'material-ui/svg-icons/alert/error-outline';
import ActionHourglassEmpty from 'material-ui/svg-icons/action/hourglass-empty';
import Paper from 'material-ui/Paper';
import ActionInfoOutline from 'material-ui/svg-icons/action/info-outline';

import MDSpinner from "react-md-spinner";
import {Tooltip} from 'react-tippy';

import AuditTrainIcon from './AuditTrainIcon';

import Utilities from "../utilities/Utilities";

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(AuditStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    isDarkMode: PropTypes.bool.isRequired
  },

  getStoreState() {
    return {
      isLoading: AuditStore.get('isLoading'),
      error: !!AuditStore.get('error'),
      data: AuditStore.get('data'),

      selectedDepartureStationCode: AuditStore.get('selectedDepartureStationCode'),
      selectedLineCode: AuditStore.get('selectedLineCode'),
      selectedDirectionNumber: AuditStore.get('selectedDirectionNumber'),
      selectedDestinationStationCode: AuditStore.get('selectedDestinationStationCode'),
      selectedMetric: AuditStore.get('selectedMetric')
    };
  },

  UNSAFE_componentWillMount() {
    AuditActions.getData({});
  },

  componentWillUnmount() {
    AuditActions.resetState();
  },

  _getLineDot(lineName) {
    if (!lineName || lineName === 'N/A') {
      return null;
    }

    const lineDotStyle = {
      display: 'inline-block',
      height: 16,
      width: 16,
      marginRight: 8
    };

    if (lineName === 'Red') {
      lineDotStyle.backgroundColor = "#E51636"
    } else if (lineName === 'Orange') {
      lineDotStyle.backgroundColor = "#F68712"
    } else if (lineName === 'Silver') {
      lineDotStyle.backgroundColor = "#9D9F9C"
    } else if (lineName === 'Blue') {
      lineDotStyle.backgroundColor = "#1574C4"
    } else if (lineName === 'Yellow') {
      lineDotStyle.backgroundColor = "#FCD006"
    } else if (lineName === 'Green') {
      lineDotStyle.backgroundColor = "#0FAB4B"
    }

    return (
      <Paper
        style={lineDotStyle}
        zDepth={1}
        circle={true}
      />
    );
  },

  _getMetricsHeaderColor(value) {
    // slightly modified version of AuditTrainIcon._getTrainColor
    const hue= ((1 - value) * 120).toString(10);
    return ["hsl(", hue, ",65%,75%)"].join("");
  },

  _buildMetricCard(title, color, count, total) {
    return (
      <Card
        style={{display: 'inline-block', minWidth: 200, maxWidth: 250, margin: 4}}
      >
        <CardHeader
          title={title}
          style={{padding: 6, backgroundColor: color}}
          textStyle={{paddingRight: 0}}
          titleStyle={{color: 'rgba(0, 0, 0, 0.87)'}}
        />
        <CardText
          style={{paddingTop: 4, paddingBottom: 0}}
        >
          <div style={{fontSize: 36}}>{Math.round((count / total) * 100)}%</div>
          <div>{count} of {total} departures</div>
        </CardText>
      </Card>
    );
  },

  render() {
    const shouldDisableComponents = this.state.isLoading && !this.state.data;

    // metric selection
    const metricSelectorComponent = (
      <SelectField
        style={{
          width: 225,
          marginLeft: 8,
          marginRight: 8,
          textAlign: 'left'
        }}
        floatingLabelText={"Metric"}
        value={this.state.selectedMetric}
        onChange={(e, index, value) => {
          AuditActions.getData({
            selectedMetric: value
          });
        }}
        disabled={shouldDisableComponents}
        autoWidth
      >
        <MenuItem value={'headwayDeviation'} primaryText={"Headway Adherence"} />
        <MenuItem value={'scheduleDeviation'} primaryText={"Schedule Adherence"} />
      </SelectField>
    );

    let metricExplainerText;
    if (this.state.selectedMetric === 'headwayDeviation') {
      metricExplainerText = "Headway Adherence compares the amount of time between train departures (i.e. train frequency) to scheduled headways. A train is considered \"on time\" if it departs no more than 2 minutes later than its scheduled headway.";
    } else if (this.state.selectedMetric === 'scheduleDeviation') {
      metricExplainerText = "Schedule Adherence compares scheduled train departure times to their actual departures. A train is considered \"on time\" if it departs within 2 minutes of its scheduled time.";
    }

    // direction of travel filter
    const directionNumberSelectorComponent = (
      <SelectField
        style={{
          width: 230,
          marginLeft: 8,
          marginRight: 8,
          textAlign: 'left'
        }}
        floatingLabelText={"Direction of Travel"}
        value={this.state.selectedDirectionNumber}
        onChange={(e, index, value) => {
          AuditActions.getData({
            selectedDirectionNumber: value
          });
        }}
        disabled={shouldDisableComponents}
        autoWidth
      >
        <MenuItem value={null} primaryText="" />
        <MenuItem value={1} primaryText={"Northbound/Eastbound"} />
        <MenuItem value={2} primaryText={"Southbound/Westbound"} />
      </SelectField>
    );

    // line filter
    const lineSelectorComponent = (
      <SelectField
        style={{
          width: 145,
          marginLeft: 8,
          marginRight: 8,
          textAlign: 'left'
        }}
        floatingLabelText={"Line"}
        value={this.state.selectedLineCode}
        onChange={(e, index, value) => {
          AuditActions.getData({
            selectedLineCode: value
          });
        }}
        disabled={shouldDisableComponents}
        autoWidth
      >
        <MenuItem value={null} primaryText="" />
        <MenuItem value={'RD'} primaryText={"Red Line"} />
        <MenuItem value={'OR'} primaryText={"Orange Line"} />
        <MenuItem value={'SV'} primaryText={"Silver Line"} />
        <MenuItem value={'BL'} primaryText={"Blue Line"} />
        <MenuItem value={'YL'} primaryText={"Yellow Line"} />
        <MenuItem value={'GR'} primaryText={"Green Line"} />
      </SelectField>
    );

    const stationSelectorMenuItemComponents = [];
    const stationCodesByName = Utilities.getStationNameCodeMap();
    Object.keys(stationCodesByName).forEach((stationName) => {
      const stationCode = stationCodesByName[stationName];
      stationSelectorMenuItemComponents.push(
        <MenuItem
          key={stationCode}
          value={stationCode}
          primaryText={stationName}
        />
      );
    });

    // destination station filter
    // const destinationStationSelectorComponent = (
    //   <SelectField
    //     style={{
    //       marginLeft: 8,
    //       marginRight: 8,
    //       textAlign: 'left'
    //     }}
    //     floatingLabelText={"Destination Station"}
    //     value={this.state.selectedDestinationStationCode}
    //     onChange={(e, index, value) => {
    //       AuditActions.getData({
    //         selectedDestinationStationCode: value
    //       });
    //     }}
    //     disabled={shouldDisableComponents}
    //     autoWidth
    //   >
    //     <MenuItem value={null} primaryText="" />
    //     {stationSelectorMenuItemComponents}
    //   </SelectField>
    // );

    // departure station filter
    const departureStationSelectorComponent = (
      <SelectField
        style={{
          marginLeft: 8,
          marginRight: 8,
          textAlign: 'left'
        }}
        floatingLabelText={"Station"}
        value={this.state.selectedDepartureStationCode}
        onChange={(e, index, value) => {
          AuditActions.getData({
            selectedDepartureStationCode: value
          });
        }}
        disabled={shouldDisableComponents}
        autoWidth
      >
        <MenuItem value={null} primaryText="" />
        {stationSelectorMenuItemComponents}
      </SelectField>
    );

    let content;
    if (this.state.isLoading && !this.state.data) {
      content = (
        <div style={{textAlign: 'center'}}>
          <MDSpinner
            size={48}
            singleColor={this.context.muiTheme.palette.accent1Color}
          />
        </div>
      );
    } else if (this.state.data) {
      const trainComponentCardByLine = {};

      this.state.data.forEach((instances, lineName) => {
        if (instances && !instances.isEmpty()) {
          let numOnTimeDepartures = 0;
          let numLateDepartures = 0;
          let numVeryLateDepartures = 0;
          let numDepartures = 0;

          const trainComponentsForLine = [];

          instances.forEach((instance) => {
            let selectedMetricValue;
            if (this.state.selectedMetric === 'headwayDeviation') {
              selectedMetricValue = instance.get(this.state.selectedMetric);
            } else if (this.state.selectedMetric === 'scheduleDeviation' && instance.get('scheduledDepartureTime')) {
              selectedMetricValue = Math.abs(instance.get(this.state.selectedMetric));
            }

            if (selectedMetricValue || selectedMetricValue === 0) {
              if (selectedMetricValue >= 4) {
                numVeryLateDepartures++;
              } else if (selectedMetricValue >= 2) {
                numLateDepartures++;
              } else {
                numOnTimeDepartures++;
              }
            }

            if (this.state.selectedMetric !== 'headwayDeviation' || instance.get('observedDepartureTime')) {
              numDepartures++;

              const id = [
                instance.get('observedDepartureTime'),
                instance.get('scheduledDepartureTime'),
                instance.get('directionNumber'),
                instance.get('lineCode'),
                instance.get('departureStationCode')
              ].join();

              trainComponentsForLine.push(
                <AuditTrainIcon
                  key={id}
                  departureStationCode={instance.get('departureStationCode')}
                  lineCode={instance.get('lineCode')}
                  directionNumber={instance.get('directionNumber')}
                  observedDepartureTime={instance.get('observedDepartureTime')}
                  scheduledDepartureTime={instance.get('scheduledDepartureTime')}
                  observedTimeSinceLastDeparture={instance.get('observedTimeSinceLastDeparture')}
                  directionName={instance.get('directionName')}
                  lineName={instance.get('lineName')}
                  trainId={instance.get('realTrainId')}
                  observedNumCars={instance.get('observedNumCars')}
                  observedDestinationStationName={instance.get('observedDestinationStationName')}
                  departureStationName={instance.get('departureStationName')}
                  selectedMetricValue={instance.get(this.state.selectedMetric)}
                  selectedMetric={this.state.selectedMetric}
                />
              );
            }
          });

          // add an additional blinking component to indicate this is live data
          trainComponentsForLine.push(
            <span
              key="blink"
              className="blink"
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92.386 71.959">
                      <path fill="#000" d="M46.484 0a29.43 8.656 0 00-29.318 8.042c-.148.093-.244.192-.284.298C6.784 35.43 6.116 64.667 13.238 64.7c1.616.008 3.545.011 5.507.014-.105.273-.165.57-.165.88v3.917a2.442 2.442 0 002.448 2.447h50.75a2.442 2.442 0 002.447-2.447v-3.917c0-.31-.06-.607-.164-.88 1.962-.003 3.89-.006 5.506-.014 7.12-.034 6.455-29.25-3.634-56.334A29.43 8.656 0 0046.521 0a29.43 8.656 0 00-.037 0zM36.173 4.563h20.46A2.443 2.443 0 0159.08 7.01v.422a2.442 2.442 0 01-2.448 2.447H36.173a2.442 2.442 0 01-2.448-2.447V7.01a2.443 2.443 0 012.448-2.447zm33.003 3.196a3.01 3.01 0 013.011 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.011-3.01 3.01 3.01 0 013.01-3.01zm-45.479.529a3.01 3.01 0 01.001 0 3.01 3.01 0 013.01 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.01-3.01 3.01 3.01 0 013.01-3.01zm14.22 9.602h16.971v21.879h-16.97zm-16.205 2.862h7.157a2.245 2.245 0 012.249 2.25v14.517a2.245 2.245 0 01-2.25 2.25h-7.156c-3.595.293-4.65-1.9-4.452-3.13l2.203-13.637c.199-1.23 1.003-2.25 2.25-2.25zm42.224 0h7.157c1.246 0 2.05 1.02 2.25 2.25l2.202 13.636c.199 1.23-.856 3.424-4.452 3.13h-7.157a2.244 2.244 0 01-2.249-2.249V23.002a2.244 2.244 0 012.25-2.25zM20.293 46.175a4.038 4.038 0 014.038 4.039 4.038 4.038 0 01-4.038 4.038 4.038 4.038 0 01-4.039-4.038 4.038 4.038 0 014.039-4.039zm51.79 0a4.038 4.038 0 014.039 4.039 4.038 4.038 0 01-4.039 4.038 4.038 4.038 0 01-4.038-4.038 4.038 4.038 0 014.038-4.039zm-40.717 3.231a4.993 4.993 0 01.014 0 4.993 4.993 0 014.993 4.993 4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993zm29.616 0a4.993 4.993 0 01.014 0A4.993 4.993 0 0165.99 54.4a4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993z"/>
                    </svg>
                  `
                }}
                style={{
                  display: 'inline-block',
                  width: 24,
                  height: 24
                }}
              >
              </div>
            </span>
          );

          const lineNameForDisplay = (lineName === 'N/A') ? "Other" : `${lineName} Line`;
          trainComponentCardByLine[lineName] = (
            <Card
              initiallyExpanded={true}
              style={{margin: 8, marginBottom: 24}}
            >
              <CardHeader
                title={lineNameForDisplay}
                avatar={this._getLineDot(lineName)}
                actAsExpander={true}
                showExpandableButton={true}
              />
              <CardText
                expandable={true}
                style={{paddingTop: 0}}
              >
                {lineName !== 'N/A' ?
                  <div style={{textAlign: 'center'}}>
                    {this._buildMetricCard((this.state.selectedMetric === 'headwayDeviation') ? "On-time or early" : "On-time", this._getMetricsHeaderColor(0), numOnTimeDepartures, numDepartures)}
                    {this._buildMetricCard((this.state.selectedMetric === 'headwayDeviation') ? "Late" : "Off-schedule", this._getMetricsHeaderColor(0.5), numLateDepartures, numDepartures)}
                    {this._buildMetricCard((this.state.selectedMetric === 'headwayDeviation') ? "Very late" : "Very off-schedule", this._getMetricsHeaderColor(1), numVeryLateDepartures, numDepartures)}
                  </div>
                  : null
                }
                <div style={{paddingTop: (lineName === 'N/A') ? 8 : 16}}>
                  {trainComponentsForLine}
                </div>
              </CardText>
            </Card>
          );
        }
      });

      if (!_.isEmpty(trainComponentCardByLine)) {
        content = (
          <div>
            {trainComponentCardByLine['Red'] ? trainComponentCardByLine['Red'] : null}
            {trainComponentCardByLine['Orange'] ? trainComponentCardByLine['Orange'] : null}
            {trainComponentCardByLine['Silver'] ? trainComponentCardByLine['Silver'] : null}
            {trainComponentCardByLine['Blue'] ? trainComponentCardByLine['Blue'] : null}
            {trainComponentCardByLine['Yellow'] ? trainComponentCardByLine['Yellow'] : null}
            {trainComponentCardByLine['Green'] ? trainComponentCardByLine['Green'] : null}
            {trainComponentCardByLine['N/A'] ? trainComponentCardByLine['N/A'] : null}
          </div>
        );
      } else {
        content = (
          <div style={{textAlign: 'center'}}>
            <ActionHourglassEmpty />
            <div>
              No results!
              <br/>
              Try adjusting your filters.
            </div>
          </div>
        );
      }
    } else {
      content = (
        <div style={{textAlign: 'center'}}>
          <AlertErrorOutline />
          <div>
            An error occurred!
            <br/>
            <div style={{display: 'inline-block'}}>Please check your network connection.</div>&nbsp;<div style={{display: 'inline-block'}}>We'll keep retrying.</div>
            <div style={{marginTop: 8}}>
              <MDSpinner
                size={24}
                singleColor={this.context.muiTheme.palette.accent1Color}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className='Audit vertical-scrolling'>
        <div style={{display: 'inline-block', maxWidth: 727 /* magic numbers! */, margin: '0 auto 92px', textAlign: 'left'}}>
          <CardTitle
            title="Live Performance Audit"
            subtitle={<span style={{fontSize: 12}}>How's Metrorail been performing over the past hour?</span>}
          />
          <Card style={{margin: 8}}>
            <CardHeader
              title="Options & Filters"
              style={{paddingBottom: 0}}
            />
            <CardText style={{paddingTop: 0, textAlign: 'center'}}>
              <div style={{position: 'relative'}}>
                {metricSelectorComponent}
                <div style={{display: 'inline-block', position: 'absolute', bottom: 12}}>
                  <Tooltip
                    title={metricExplainerText}
                    position="bottom"
                    arrow={true}
                    animateFill={false}
                    distance={0}
                  >
                    <ActionInfoOutline
                      style={{
                        width: 24,
                        height: 24,
                        color: this.context.muiTheme.palette.secondaryTextColor
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
              <div style={{display: 'inline-block'}}>
                {directionNumberSelectorComponent}
                {lineSelectorComponent}
              </div>
              <div style={{display: 'inline-block'}}>
                {/*{destinationStationSelectorComponent}*/}
                {departureStationSelectorComponent}
              </div>
            </CardText>
          </Card>
          <Card style={{margin: 8}}>
            <CardHeader
              title="Live Train Departures"
              subtitle="over the past hour, updated every 30 seconds"
              style={{paddingRight: 0, paddingBottom: 0}}
            />
            <CardText>
              {content}
            </CardText>
          </Card>
          <div style={{marginRight: 16, textAlign: 'right', fontSize: 12}}>
            <div style={{display: 'inline-block', color: this.context.muiTheme.palette.secondaryTextColor}}>inspired by</div><div style={{display: 'inline-block'}}>&nbsp;<a href="https://transitalliance.miami/campaigns/transit-audit" target="_blank">Transit Alliance Miami's real-time Metrorail audit</a></div>
          </div>
        </div>
      </div>
    );
  }
});
