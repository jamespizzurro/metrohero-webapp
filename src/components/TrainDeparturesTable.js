import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import moment from 'moment';
import _ from 'lodash';

import TrainDeparturesActions from '../actions/TrainDeparturesActions';
import TrainDeparturesStore from '../stores/TrainDeparturesStore';
import TrainDepartureDialogActions from '../actions/TrainDepartureDialogActions';

import {Table, TableBody, TableHeader, TableFooter, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import UltimatePaginationMaterialUi from 'react-ultimate-pagination-material-ui';
import Chip from 'material-ui/Chip';
import Paper from 'material-ui/Paper';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(TrainDeparturesStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    isDarkMode: PropTypes.bool.isRequired
  },

  getStoreState() {
    return {
      isLoadingTable: TrainDeparturesStore.get('isLoadingTable'),
      tableError: TrainDeparturesStore.get('tableError'),
      tableData: TrainDeparturesStore.get('tableData'),
      params: TrainDeparturesStore.get('params').toJS(),
      totalNumTableResults: TrainDeparturesStore.get('totalNumTableResults')
    };
  },

  _buildLineDot(lineCode) {
    const lineDotStyle = {
      height: 24,
      width: 24,
      margin: 2,
      marginRight: 8,
      textAlign: 'center',
      display: 'inline-block',
      color: lineCode !== 'N/A' ? '#ffffff' : '#000000',
      paddingTop: 5,
      fontSize: 13,
      verticalAlign: 'middle'
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
      <Paper style={lineDotStyle} zDepth={1} circle={true}>
        {lineCode}
      </Paper>
    )
  },

  _getTrainColor(value) {
    const hue= ((1 - value) * 120).toString(10);
    return ["hsl(", hue, ",65%,50%)"].join("");
  },

  _openDialog(selectedRows) {
    if (this.state.tableData && this.state.tableData.size > 0 && selectedRows && selectedRows.length > 0) {
      const row = this.state.tableData.get(selectedRows[0]);

      let scheduledDeparture = row.get('scheduledDepartureTime') ? moment(row.get('scheduledDepartureTime')) : null;
      if (scheduledDeparture) {
        scheduledDeparture = scheduledDeparture.format("M/D/YY h:mm:ss a");
      }

      let observedDeparture = row.get('observedDepartureTime') ? moment(row.get('observedDepartureTime')) : null;
      if (observedDeparture) {
        observedDeparture = observedDeparture.format("M/D/YY h:mm:ss a");
      }

      const lineName = row.get('lineName');
      const lineCode = row.get('lineCode');
      const destinationStationName = row.get('scheduledDestinationStationName') || row.get('observedDestinationStationName');
      const destinationStationCode = row.get('scheduledDestinationStationCode') || row.get('observedDestinationStationCode');
      TrainDepartureDialogActions.updateState({
        line: lineCode ? `${lineName} (${lineCode})` : null,
        direction: row.get('directionName'),
        departureStation: `${row.get('departureStationName')} (${row.get('departureStationCode')})`,
        destinationStation: destinationStationCode ? (destinationStationName + (destinationStationCode ? ` (${destinationStationCode})` : '')) : null,
        scheduledDeparture: scheduledDeparture,
        observedDeparture: observedDeparture,
        trainId: row.get('trainId'),
        realTrainId: row.get('realTrainId'),
        numCars: row.get('observedNumCars'),
        observedHeadway: _.round(row.get('observedTimeSinceLastDeparture'), 2),
        scheduledHeadway: _.round(row.get('scheduledTimeSinceLastDeparture'), 2),
        headwayDeviation: _.round(row.get('headwayDeviation'), 2),
        scheduleDeviation: _.round(row.get('scheduleDeviation'), 2),
        isDialogOpen: true
      });
    }
  },

  render() {
    let loadingIndicator;
    if (this.state.isLoadingTable) {
      loadingIndicator = (
        <div style={{position: 'absolute', width: 'calc(100% - 48px)'}}>
          <RefreshIndicator
            size={40} top={122} left={0}
            status={'loading'}
            style={{display: 'inline-block', position: 'relative'}}
            />
        </div>
      );
    }

    const currentPage = Math.max(Math.ceil(this.state.params.resultCountOffset / this.state.params.maxResultCount) + 1, 1);
    const totalPages = Math.max(Math.ceil(this.state.totalNumTableResults / this.state.params.maxResultCount), 1);
    const pagination = (
      <UltimatePaginationMaterialUi
        currentPage={currentPage}
        totalPages={totalPages}
        onChange={(newPage) => {
          if (!this.state.isLoadingTable && (newPage !== currentPage)) {
            TrainDeparturesActions.updateParams({
               resultCountOffset: (newPage - 1) * this.state.params.maxResultCount
            });
            TrainDeparturesActions.getTrainDepartures();
          }
        }}
        />
    );

    const maxResultCountSelector = (
      <SelectField style={{width: 120, float: 'right', position: 'absolute', bottom: 0, right: 0, textAlign: 'left'}}
                   floatingLabelText={'Max Results'}
                   value={this.state.params.maxResultCount}
                   onChange={(e, index, object) => {
                     TrainDeparturesActions.updateParams({
                       maxResultCount: object,
                       resultCountOffset: 0
                     });
                     TrainDeparturesActions.getTrainDepartureMetrics();
                     TrainDeparturesActions.getTrainDepartures();
                   }}
                   disabled={this.state.isLoadingTable}
        >
        <MenuItem value={25} primaryText={'25'} />
        <MenuItem value={50} primaryText={'50'} />
        <MenuItem value={75} primaryText={'75'} />
        <MenuItem value={100} primaryText={'100'} />
      </SelectField>
    );

    const numColumns = 8;

    const tableHeaderContent = (
      <TableRow>
        <TableHeaderColumn>Line &<br/>Direction</TableHeaderColumn>
        <TableHeaderColumn>Departure<br/>Station</TableHeaderColumn>
        <TableHeaderColumn>Destination<br/>Station</TableHeaderColumn>
        <TableHeaderColumn>Observed<br/>Departure</TableHeaderColumn>
        <TableHeaderColumn>Scheduled<br/>Departure</TableHeaderColumn>
        <TableHeaderColumn>Train ID</TableHeaderColumn>
        <TableHeaderColumn>Headway<br/>Deviation<br/>(in minutes)</TableHeaderColumn>
        <TableHeaderColumn>Schedule<br/>Deviation<br/>(in minutes)</TableHeaderColumn>
      </TableRow>
    );

    const tableRows = [];
    if (this.state.tableData) {
      this.state.tableData.forEach((row, index) => {
        const lineCode = row.get('lineCode');
        let lineCellContents;
        if (lineCode) {
          lineCellContents = (
            <div>
              {this._buildLineDot(lineCode)}
              <div style={{display: 'inline', verticalAlign: 'middle'}}>
                {row.get('directionName')}
              </div>
            </div>
          );
        }

        const scheduledDeparture = row.get('scheduledDepartureTime') ? moment(row.get('scheduledDepartureTime')) : null;
        let scheduledDepartureDate = '';
        let scheduledDepartureTime = '';
        if (scheduledDeparture) {
          scheduledDepartureDate = scheduledDeparture.format("M/D/YY");
          scheduledDepartureTime = scheduledDeparture.format("h:mm:ss a");
        }

        const observedDeparture = row.get('observedDepartureTime') ? moment(row.get('observedDepartureTime')) : null;
        let observedDepartureDate = '';
        let observedDepartureTime = '';
        if (observedDeparture) {
          observedDepartureDate = observedDeparture.format("M/D/YY");
          observedDepartureTime = observedDeparture.format("h:mm:ss a");
        }

        let headwayDeviationCellContents;
        if (row.get('headwayDeviation')) {
          let lateChip;
          if (row.get('headwayDeviation') >= 2) {
            lateChip = (
              <Chip
                backgroundColor={this._getTrainColor(Math.min(Math.max(row.get('headwayDeviation'), 2), 4 /* minutes */) / 4 /* minutes */)}
                labelStyle={{fontSize: 12, lineHeight: '16px', paddingLeft: 6, paddingRight: 6, color: this.context.muiTheme.palette.alternateTextColor}}>
                {row.get('headwayDeviation') >= 4 ? 'very late' : 'late'}
              </Chip>
            );
          }

          headwayDeviationCellContents = (
            <div>
              {(row.get('headwayDeviation') > 0) ? '+' : ''}
              {_.round(row.get('headwayDeviation'), 2)}
              {lateChip ? <br/> : null}
              {lateChip}
            </div>
          );
        }

        let scheduleDeviationCellContents;
        if (row.get('scheduleDeviation')) {
          let lateChip;
          if (Math.abs(row.get('scheduleDeviation')) >= 2) {
            lateChip = (
              <Chip
                backgroundColor={this._getTrainColor(Math.min(Math.max(Math.abs(row.get('scheduleDeviation')), 2), 4 /* minutes */) / 4 /* minutes */)}
                labelStyle={{fontSize: 12, lineHeight: '16px', paddingLeft: 6, paddingRight: 6, color: this.context.muiTheme.palette.alternateTextColor}}>
                {Math.abs(row.get('scheduleDeviation')) >= 4 ? 'very off-schedule' : 'off-schedule'}
              </Chip>
            );
          }

          scheduleDeviationCellContents = (
            <div>
              {(row.get('scheduleDeviation') > 0) ? '+' : ''}
              {_.round(row.get('scheduleDeviation'), 2)}
              {lateChip ? <br/> : null}
              {lateChip}
            </div>
          );
        }

        const destinationStationName = row.get('scheduledDestinationStationName') || row.get('observedDestinationStationName');
        const destinationStationCode = row.get('scheduledDestinationStationCode') || row.get('observedDestinationStationCode');

        const key = [
          row.get('departureStationCode'),
          row.get('lineCode'),
          row.get('directionNumber'),
          row.get('observedDepartureTime'),
          row.get('scheduledDepartureTime')
        ].join(',');

        tableRows.push(
          <TableRow key={key} style={{cursor: 'pointer'}}>
            <TableRowColumn>
              {lineCellContents}
            </TableRowColumn>
            <TableRowColumn>{row.get('departureStationName')}<br/>{`(${row.get('departureStationCode')})`}</TableRowColumn>
            {destinationStationCode ? <TableRowColumn>{destinationStationName}<br/>{`(${destinationStationCode})`}</TableRowColumn> : <TableRowColumn />}
            <TableRowColumn>{observedDepartureTime}<br/>{observedDepartureDate}</TableRowColumn>
            <TableRowColumn>{scheduledDepartureTime}<br/>{scheduledDepartureDate}</TableRowColumn>
            <TableRowColumn>{row.get('realTrainId')}</TableRowColumn>
            <TableRowColumn>
              {headwayDeviationCellContents}
            </TableRowColumn>
            <TableRowColumn>
              {scheduleDeviationCellContents}
            </TableRowColumn>
          </TableRow>
        );
      });
    }
    if (tableRows.length <= 0) {
      tableRows.push(
        <TableRow key={'no-results'} selectable={false}>
          <TableRowColumn style={{textAlign: 'center'}}>No Results</TableRowColumn>
        </TableRow>
      );
    }

    return (
      <div
        style={{
          paddingTop: 12,
          paddingBottom: 12
        }}
      >
        {loadingIndicator}
        <Table onRowSelection={this._openDialog} wrapperStyle={{overflowX: 'hidden'}}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
            <TableRow>
              <TableHeaderColumn colSpan={numColumns} style={{textAlign: 'center'}}>
                {pagination}
                {maxResultCountSelector}
              </TableHeaderColumn>
            </TableRow>
            {tableHeaderContent}
          </TableHeader>
          <TableBody displayRowCheckbox={false} showRowHover={true}>
            {tableRows}
          </TableBody>
        </Table>
        <div style={{marginTop: 8}}>
          {pagination}
        </div>
      </div>
    );
  }
});
