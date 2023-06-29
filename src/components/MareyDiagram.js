import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import moment from 'moment';

import {Line} from 'react-chartjs-2';

import MareyDiagramStore from '../stores/MareyDiagramStore';
import MareyDiagramActions from '../actions/MareyDiagramActions';

import {Card, CardTitle, CardText} from 'material-ui/Card';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import MDSpinner from "react-md-spinner";
import RaisedButton from 'material-ui/RaisedButton';
import NavigationRefresh from 'material-ui/svg-icons/navigation/refresh';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(MareyDiagramStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    isDarkMode: PropTypes.bool.isRequired
  },

  getStoreState() {
    return {
      stationToStationDistances: MareyDiagramStore.get('stationToStationDistances'),
      maxDistanceByLineAndDirection: MareyDiagramStore.get('maxDistanceByLineAndDirection'),
      distanceToLastStationByLineAndDirectionAndStationPair: MareyDiagramStore.get('distanceToLastStationByLineAndDirectionAndStationPair'),
      stationNameByLineAndDirectionAndDistanceToLastStation: MareyDiagramStore.get('stationNameByLineAndDirectionAndDistanceToLastStation'),
      isLoading: MareyDiagramStore.get('isLoading'),
      trainStatuses: MareyDiagramStore.get('trainStatuses'),
      selectedLineCode: MareyDiagramStore.get('selectedLineCode'),
      selectedDirectionNumber: MareyDiagramStore.get('selectedDirectionNumber')
    };
  },

  componentDidMount() {
    MareyDiagramActions.getTrainData();
  },

  _getDistanceToEndOfRoute(lineCode, directionNumber, previousStationCode, nextStationCode, distanceToNextStation) {
    const distanceToLastStationByLineAndDirectionAndStationPair = this.state.distanceToLastStationByLineAndDirectionAndStationPair;

    const distanceToLastStationForLineByDirectionAndStationPair = distanceToLastStationByLineAndDirectionAndStationPair.get(lineCode);
    if (!distanceToLastStationForLineByDirectionAndStationPair) {
      return null;
    }

    const distanceToLastStationForLineAndDirectionByStationPair = distanceToLastStationForLineByDirectionAndStationPair.get(directionNumber);
    if (!distanceToLastStationForLineAndDirectionByStationPair) {
      return null;
    }

    const key = `${previousStationCode}_${nextStationCode}`;

    const stationToStationDistance = this.state.stationToStationDistances.get(key);
    if (!stationToStationDistance) {
      return null;
    }

    const distanceToLastStationForLineAndDirectionAndStationPair = distanceToLastStationForLineAndDirectionByStationPair.get(key);
    if (!distanceToLastStationForLineAndDirectionAndStationPair) {
      return null;
    }

    return distanceToLastStationForLineAndDirectionAndStationPair - (stationToStationDistance - distanceToNextStation);
  },

  render() {
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
          MareyDiagramActions.setState({
            selectedLineCode: value
          });
        }}
        disabled={this.state.isLoading}
        autoWidth
      >
        <MenuItem value={'RD'} primaryText={"Red Line"} />
        <MenuItem value={'OR'} primaryText={"Orange Line"} />
        <MenuItem value={'SV'} primaryText={"Silver Line"} />
        <MenuItem value={'BL'} primaryText={"Blue Line"} />
        <MenuItem value={'YL'} primaryText={"Yellow Line"} />
        <MenuItem value={'GR'} primaryText={"Green Line"} />
      </SelectField>
    );

    let direction1Text;
    let direction2Text;
    if (this.state.selectedLineCode === 'RD') {
      direction1Text = "towards Glenmont";
      direction2Text = "towards Shady Grove";
    } else if (this.state.selectedLineCode === 'OR') {
      direction1Text = "towards New Carrollton";
      direction2Text = "towards Vienna";
    } else if (this.state.selectedLineCode === 'SV') {
      direction1Text = "towards Downtown Largo";
      direction2Text = "towards Ashburn";
    } else if (this.state.selectedLineCode === 'BL') {
      direction1Text = "towards Downtown Largo";
      direction2Text = "towards Franconia-Springfield";
    } else if (this.state.selectedLineCode === 'YL') {
      direction1Text = "towards Greenbelt";
      direction2Text = "towards Huntington";
    } else if (this.state.selectedLineCode === 'GR') {
      direction1Text = "towards Greenbelt";
      direction2Text = "towards Branch Avenue";
    }
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
          MareyDiagramActions.setState({
            selectedDirectionNumber: value
          });
        }}
        disabled={this.state.isLoading}
        autoWidth
      >
        <MenuItem value={'1'} primaryText={direction1Text} />
        <MenuItem value={'2'} primaryText={direction2Text} />
      </SelectField>
    );

    let datasets = [];

    if (this.state.trainStatuses) {
      const trainDataByTrip = {};

      this.state.trainStatuses.forEach((trainStatus, index) => {
        const previousStationCode = trainStatus.get('previousStationCode');
        const nextStationCode = trainStatus.get('locationStationCode');

        if (!this.state.distanceToLastStationByLineAndDirectionAndStationPair.get(this.state.selectedLineCode).get(this.state.selectedDirectionNumber).has(`${previousStationCode}_${nextStationCode}`)) {
          // only render trains where the previous and next stations for are present on the current diagram
          return;
        }

        const directionNumber = trainStatus.get('directionNumber').toString();

        if (directionNumber !== this.state.selectedDirectionNumber) {
          // only render trains going in the selected direction of travel
          return;
        }

        const distanceToNextStation = trainStatus.get('distanceFromNextStation');

        const distanceToEndOfRoute = this._getDistanceToEndOfRoute(this.state.selectedLineCode, directionNumber, previousStationCode, nextStationCode, distanceToNextStation);
        if (!distanceToEndOfRoute) {
          // only render trains where the distance from its location to the end of the selected route is known
          return;
        }

        const lineCode = trainStatus.get('lineCode');
        const desinationStationName = trainStatus.get('destinationStationName');
        const realTrainId = trainStatus.get('realTrainId');

        const tooltipLabel = `${(lineCode !== "N/A") ? `${lineCode}/` : ''}${desinationStationName} Train ${realTrainId}`;

        const Min = trainStatus.get('eta');
        const nextStationName = trainStatus.get('locationStationName');

        let tooltipFooter;
        if (Min === 'BRD') {
          tooltipFooter = `BRD at ${nextStationName}`;
        } else if (Min === 'ARR') {
          tooltipFooter = `ARR at ${nextStationName} (${distanceToNextStation} feet away)`;
        } else if (Min === '1') {
          tooltipFooter = `1 minute from ${nextStationName} (${distanceToNextStation} feet away)`;
        } else {
          tooltipFooter = `${Min} minutes from ${nextStationName} (${distanceToNextStation} feet away)`;
        }

        const observedDate = trainStatus.get('observedDate');

        const entry = {
          t: moment(observedDate, "MMM DD, YYYY, hh:mm:ss A").valueOf(),
          y: distanceToEndOfRoute,
          realTrainId: realTrainId,
          lineCode: lineCode,
          tooltipLabel: tooltipLabel,
          tooltipFooter: tooltipFooter
        };

        const tripId = trainStatus.get('tripId');

        const key = `${tripId}_${realTrainId}_${lineCode}`;
        if (!trainDataByTrip[key]) {
          trainDataByTrip[key] = [entry];
        } else {
          trainDataByTrip[key].push(entry);
        }
      });

      Object.keys(trainDataByTrip).forEach((key) => {
        const trainDataForTrip = trainDataByTrip[key];
        if (trainDataForTrip.length <= 5) {
          // filter out trains that were actually going in the other direction of travel on this line,
          // but momentarily appeared to be going in this direction due to data issues
          return;
        }

        let lineColor;
        const lineCode = trainDataForTrip[0].lineCode;
        if (lineCode === 'RD') {
          lineColor = "#E51636"
        } else if (lineCode === 'OR') {
          lineColor = "#F68712"
        } else if (lineCode === 'SV') {
          lineColor = "#9D9F9C"
        } else if (lineCode === 'BL') {
          lineColor = "#1574C4"
        } else if (lineCode === 'YL') {
          lineColor = "#FCD006"
        } else if (lineCode === 'GR') {
          lineColor = "#0FAB4B"
        } else {
          lineColor = this.context.muiTheme.palette.textColor;
        }

        const realTrainId = trainDataForTrip[0].realTrainId;
        datasets.push({
          label: realTrainId,
          backgroundColor: lineColor,
          borderColor: lineColor,
          type: 'line',
          fill: false,
          pointRadius: 0,
          lineTension: 0,
          borderWidth: 2,
          data: trainDataForTrip
        });
      });
    }

    let loadingSpinner;
    if (this.state.isLoading) {
      loadingSpinner = (
        <div
          style={{
            position: 'absolute',
            top: 16,
            width: '100%',
            textAlign: 'center'
          }}
        >
          <MDSpinner
            size={64}
            singleColor={this.context.muiTheme.palette.accent1Color}
          />
        </div>
      );
    }

    return (
      <div
        className="MareyDiagram vertical-scrolling"
      >
        <CardTitle
          title="Marey Diagram"
          subtitle={
            <span style={{fontSize: 12}}>
              How's Metrorail been performing over the past hour?
            </span>
          }
        />
        <CardText
          style={{
            maxWidth: 655,
            paddingTop: 0,
            margin: '0 auto',
            textAlign: 'center'
          }}
        >
          <p>
            This Marey diagram (also known as a "stringline chart" or "string diagram") shows train locations over the past hour. Stations are plotted on the y-axis, proportionally spaced by the physical distance between each station, where the x-axis is time. Each line on the chart represents a single train, with each point indicating its position on the tracks at a single point in time. The steeper a line, the faster that train was traveling.
          </p>
          <p>
            Use the options below to control which stations and trains are shown in the chart. Tap or hover over a colored line for more information about that particular train. If you're on a mobile device, we recommend viewing this page in landscape mode.
          </p>
        </CardText>
        <Card
          style={{
            margin: 16
          }}
        >
          <CardText
            style={{
              paddingTop: 0,
              paddingBottom: 0,
              textAlign: 'center'
            }}
          >
            <div
              style={{
              display: 'inline-block'
              }}
            >
              {lineSelectorComponent}
              {directionNumberSelectorComponent}
            </div>
            <div
              style={{
                display: 'inline-block',
                verticalAlign: 'top'
              }}
            >
              <RaisedButton
                label="Refresh"
                icon={<NavigationRefresh />}
                onClick={() => {
                  MareyDiagramActions.getTrainData();
                }}
                disabled={this.state.isLoading}
                style={{
                  marginTop: 24,
                  marginBottom: 12
                }}
              />
            </div>
          </CardText>
          <div>
            <Line
              redraw
              data={{
                datasets: datasets
              }}
              options={{
                maintainAspectRatio: false,
                datasetFill: false,
                legend: {
                  display: false
                },
                layout: {
                  padding: {
                    top: 24,
                    left: 12,
                    right: 12
                  }
                },
                scales: {
                  xAxes: [{
                    type: 'time',
                    distribution: 'series',
                    time: {
                      minUnit: 'minute'
                    },
                    ticks: {
                      fontColor: this.context.muiTheme.palette.secondaryTextColor,
                      source: 'data',
                      autoSkip: true
                    }
                  }],
                  yAxes: [{
                    ticks: {
                      fontColor: this.context.muiTheme.palette.secondaryTextColor,
                      min: 0,
                      max: this.state.maxDistanceByLineAndDirection.get(this.state.selectedLineCode).get(this.state.selectedDirectionNumber),
                      stepSize: 1,
                      fontSize: 9,
                      autoSkip: false,
                      callback: (value, index, values) => this.state.stationNameByLineAndDirectionAndDistanceToLastStation.get(this.state.selectedLineCode).get(this.state.selectedDirectionNumber).get(value.toString())
                    }
                  }]
                },
                hover: {
                  mode: 'nearest',
                  intersect: false
                },
                tooltips: {
                  mode: 'nearest',
                  intersect: false,
                  footerFontStyle: 'normal',
                  callbacks: {
                    label: (tooltipItem, data) => data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].tooltipLabel,
                    footer: (tooltipItems, data) => data.datasets[tooltipItems[0].datasetIndex].data[tooltipItems[0].index].tooltipFooter
                  }
                }
              }}
              width={800}
              height={800}
            />
          </div>
          {loadingSpinner}
        </Card>
        <div
          style={{
            height: 92
          }}
        />
      </div>
    );
  }
});
