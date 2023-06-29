import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import moment from 'moment';
import queryString from 'query-string';
import addressbar from 'addressbar';
import _ from 'lodash';
import { withRouter } from "react-router-dom";

import TrainDeparturesActions from '../actions/TrainDeparturesActions';
import TrainDeparturesStore from '../stores/TrainDeparturesStore';
import SettingsStore from "../stores/SettingsStore";

import {Card} from 'material-ui/Card';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import AutoComplete from 'material-ui/AutoComplete';

import TrainDepartureRefreshButton from './TrainDepartureRefreshButton';

import Utilities from "../utilities/Utilities";

export default withRouter(createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(TrainDeparturesStore, 'onStoreChange')
  ],

  propTypes: {
    isDarkMode: PropTypes.bool.isRequired
  },

  getStoreState() {
    const params = TrainDeparturesStore.get('params');

    const stationCodesByNameAndCode = [];
    const stationNamesAndCodesByCode = [];

    const stationCodesByName = Utilities.getStationNameCodeMap();
    Object.keys(stationCodesByName).forEach((stationName) => {
      const stationCode = stationCodesByName[stationName];
      stationCodesByNameAndCode[`${stationName} (${stationCode})`] = stationCode;
      stationNamesAndCodesByCode[stationCode] = `${stationName} (${stationCode})`;
    });

    return {
      isDirty: TrainDeparturesStore.get('isDirty'),
      isLoadingMetrics: TrainDeparturesStore.get('isLoadingMetrics'),
      isLoadingTable: TrainDeparturesStore.get('isLoadingTable'),
      fromDateUnixTimestamp: params ? params.get('fromDateUnixTimestamp') : null,
      toDateUnixTimestamp: params ? params.get('toDateUnixTimestamp') : null,
      departureStationCode: params ? params.get('departureStationCode') : null,
      lineCode: params ? params.get('lineCode') : null,
      directionNumber: params ? params.get('directionNumber') : null,
      firstDepartureTime: TrainDeparturesStore.get('firstDepartureTime'),
      stationCodesByNameAndCode: stationCodesByNameAndCode,
      stationNamesAndCodesByCode: stationNamesAndCodesByCode,
      isNerdMode: SettingsStore.get('isNerdMode')
    };
  },

  componentDidMount() {
    TrainDeparturesActions.getFirstDepartureTime();

    const params = queryString.parse(this.props.history.location.search);
    if (params && !_.isEmpty(params)) {
      const newParams = {
        lineCode: params.lineCode || null,
        departureStationCode: params.departureStationCode || null,
        directionNumber: parseInt(params.directionNumber, 10) || null
      };

      const fromDateUnixTimestamp = parseInt(params.fromDateUnixTimestamp, 10);
      if (fromDateUnixTimestamp) {
        newParams.fromDateUnixTimestamp = fromDateUnixTimestamp;
      }

      const toDateUnixTimestamp = parseInt(params.toDateUnixTimestamp, 10);
      if (toDateUnixTimestamp) {
        newParams.toDateUnixTimestamp = toDateUnixTimestamp;
      }

      TrainDeparturesActions.updateParams(newParams);

      // HACK: display correct value for departure station
      if (this.refs.departureStationSelector) {
        this.refs.departureStationSelector.setState({
          searchText: newParams.departureStationCode ? this.state.stationNamesAndCodesByCode[newParams.departureStationCode] : ''
        });
      }
    }

    TrainDeparturesActions.getTrainDepartureMetrics();
    TrainDeparturesActions.getTrainDepartures();
  },

  componentDidUpdate(prevProps, prevState) {
    const newParams = {};

    const fromDateUnixTimestamp = this.state.fromDateUnixTimestamp;
    if (fromDateUnixTimestamp) {
      newParams.fromDateUnixTimestamp = fromDateUnixTimestamp;
    }

    const toDateUnixTimestamp = this.state.toDateUnixTimestamp;
    if (toDateUnixTimestamp) {
      newParams.toDateUnixTimestamp = toDateUnixTimestamp;
    }

    const lineCode = this.state.lineCode;
    if (lineCode) {
      newParams.lineCode = lineCode;
    }

    const departureStationCode = this.state.departureStationCode;
    if (departureStationCode) {
      newParams.departureStationCode = departureStationCode;
    }

    const directionNumber = this.state.directionNumber;
    if (directionNumber) {
      newParams.directionNumber = directionNumber;
    }

    addressbar.value = location.origin + this.props.history.location.pathname + "?" + queryString.stringify(newParams);
  },

  render() {
    const shouldDisableComponents = !!(this.state.isLoadingTable || this.state.isLoadingMetrics);

    const lineSelector = (
      <SelectField
        style={{width: 145, marginLeft: 8, marginRight: 8, textAlign: 'left'}}
        floatingLabelText={'Line'}
        value={this.state.lineCode}
        onChange={(e, index, object) => {
          TrainDeparturesActions.updateParams({
            lineCode: object
          });
        }}
        disabled={shouldDisableComponents}
      >
        <MenuItem value={null} primaryText="" />
        <MenuItem value={'RD'} primaryText={'Red Line'} />
        <MenuItem value={'OR'} primaryText={'Orange Line'} />
        <MenuItem value={'SV'} primaryText={'Silver Line'} />
        <MenuItem value={'BL'} primaryText={'Blue Line'} />
        <MenuItem value={'YL'} primaryText={'Yellow Line'} />
        <MenuItem value={'GR'} primaryText={'Green Line'} />
        <MenuItem value={'N/A'} primaryText={'N/A'} />
      </SelectField>
    );

    const departureStationSelector = (
      <AutoComplete
        ref='departureStationSelector'
        floatingLabelText="Departure Station"
        dataSource={Object.keys(this.state.stationCodesByNameAndCode)}
        value={this.state.departureStationCode}
        onNewRequest={(t) => {
          const stationCode = this.state.stationCodesByNameAndCode[t];
          if (stationCode) {
            TrainDeparturesActions.updateParams({
              departureStationCode: stationCode
            });
          }
        }}
        onUpdateInput={(t) => {
          if (!t) {
            TrainDeparturesActions.updateParams({
              departureStationCode: null
            });
          }
        }}
        filter={(searchText, key) => {
          if (searchText.length <= 0) return false;
          let searchTextModified = searchText.toLowerCase();
          searchTextModified = searchTextModified.replace(/[‘’]/g, "'");
          return (key.toLowerCase().indexOf(searchTextModified) >= 0);
        }}
        maxSearchResults={5}
        style={{
          marginLeft: 8,
          marginRight: 8,
          textAlign: 'left',
          verticalAlign: 'top'
        }}
        disabled={shouldDisableComponents}
      />
    );

    const directionNumberSelectorComponent = (
      <SelectField
        style={{
          marginLeft: 8,
          marginRight: 8,
          textAlign: 'left'
        }}
        floatingLabelText={"Direction of Travel"}
        value={this.state.directionNumber}
        onChange={(e, index, object) => {
          TrainDeparturesActions.updateParams({
            directionNumber: object
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

    const minDate = this.state.firstDepartureTime ? moment(this.state.firstDepartureTime).toDate() : null;
    const fromDateMoment = moment.unix(this.state.fromDateUnixTimestamp);
    const fromDate = fromDateMoment.toDate();
    const toDateMoment = moment.unix(this.state.toDateUnixTimestamp);
    const toDate = toDateMoment.toDate();
    const fromDatePicker = (
      <DatePicker
        className={'inline-field'} hintText={'Start Date'} style={{display: 'inline-block'}} textFieldStyle={{width: 70}}
        defaultDate={fromDate}
        maxDate={toDate}
        minDate={minDate}
        formatDate={date => moment(date).format('M/D/YY')}
        onChange={(event, date) => {
          if (date) {
            const selectedMoment = moment(date);
            const newMoment = fromDateMoment.year(selectedMoment.year()).dayOfYear(selectedMoment.dayOfYear());
            TrainDeparturesActions.updateParams({
              fromDateUnixTimestamp: newMoment.unix()
            });
          }
        }}
        disabled={shouldDisableComponents}
        firstDayOfWeek={0}
        value={moment.unix(this.state.fromDateUnixTimestamp).toDate()}
      />
    );
    const fromTimePicker = (
      <TimePicker
        className={'inline-field'} hintText={'Start Time'} format={this.state.isNerdMode ? '24hr' : 'ampm'} style={{display: 'inline-block'}} textFieldStyle={{width: 75}}
        defaultTime={fromDate}
        onChange={(event, time) => {
          if (time) {
            const selectedMoment = moment(time);
            const newMoment = fromDateMoment.hours(selectedMoment.hours()).minutes(selectedMoment.minutes());
            TrainDeparturesActions.updateParams({
              fromDateUnixTimestamp: newMoment.unix()
            });
          }
        }}
        disabled={shouldDisableComponents}
        value={moment.unix(this.state.fromDateUnixTimestamp).toDate()}
      />
    );
    const toDatePicker = (
      <DatePicker
        className={'inline-field'} hintText={'End Date'} style={{display: 'inline-block'}} textFieldStyle={{width: 70}}
        defaultDate={toDate}
        minDate={fromDate}
        maxDate={moment().subtract(1, 'hours').toDate()}
        formatDate={date => moment(date).format('M/D/YY')}
        onChange={(event, date) => {
          if (date) {
            const selectedMoment = moment(date);
            const newMoment = toDateMoment.year(selectedMoment.year()).dayOfYear(selectedMoment.dayOfYear());
            TrainDeparturesActions.updateParams({
              toDateUnixTimestamp: newMoment.unix()
            });
          }
        }}
        disabled={shouldDisableComponents}
        firstDayOfWeek={0}
        value={moment.unix(this.state.toDateUnixTimestamp).toDate()}
      />
    );
    const toTimePicker = (
      <TimePicker
        className={'inline-field'} hintText={'End Time'} format={this.state.isNerdMode ? '24hr' : 'ampm'} style={{display: 'inline-block'}} textFieldStyle={{width: 75}}
        defaultTime={toDate}
        onChange={(event, time) => {
          if (time) {
            const selectedMoment = moment(time);
            const newMoment = toDateMoment.hours(selectedMoment.hours()).minutes(selectedMoment.minutes());
            TrainDeparturesActions.updateParams({
              toDateUnixTimestamp: newMoment.unix()
            });
          }
        }}
        disabled={shouldDisableComponents}
        value={moment.unix(this.state.toDateUnixTimestamp).toDate()}
      />
    );

    const submitButton = (
      <RaisedButton
        label={'Apply Filters'} primary={true} style={{margin: 12}}
        onClick={() => {
          TrainDeparturesActions.updateParams({
             resultCountOffset: 0
          });
          TrainDeparturesActions.getTrainDepartureMetrics();
          TrainDeparturesActions.getTrainDepartures();
        }}
        disabled={(shouldDisableComponents || !this.state.isDirty)}
      />
    );

    return (
      <Card>
        <div style={{height: 72, margin: '0 auto'}}>
          {lineSelector}
          {departureStationSelector}
          {directionNumberSelectorComponent}
        </div>
        <div>
          <span style={{marginLeft: 8, marginRight: 8}}>from</span>
          {fromDatePicker}
          {fromTimePicker}
          <span style={{marginLeft: 8, marginRight: 8}}>to</span>
          {toDatePicker}
          {toTimePicker}
        </div>
        {submitButton}
        <TrainDepartureRefreshButton
          isDarkMode={this.props.isDarkMode}
        />
      </Card>
    );
  }
}));
