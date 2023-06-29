import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import moment from 'moment';
import StoreMixin from 'reflux-immutable/StoreMixin';

import StationStore from '../stores/StationStore';

import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(StationStore, 'onStoreChange')
  ],

  getStoreState() {
    return {
      haveData: !!StationStore.get('data'),
      elevatorOutages: StationStore.get('data') ? StationStore.get('data').get('elevatorOutages') : null,
      escalatorOutages: StationStore.get('data') ? StationStore.get('data').get('escalatorOutages') : null
    };
  },

  render() {
    let elevatorDescription;
    let elevatorList;
    if (!this.state.haveData) {
      elevatorDescription = {__html: '<i>Loading elevator outages…</i>'};
    } else if (this.state.elevatorOutages) {
      const outages = [];
      this.state.elevatorOutages.forEach((outage, index) => {
        const outOfServiceDate = moment(outage.get('outOfServiceDateString'));
        const estimatedReturnToServiceDate = outage.get('estimatedReturnToServiceDate') ? moment(outage.get('estimatedReturnToServiceDate')) : null;

        outages.push(
          <ListItem
            key={outage.get('unitName')}
            primaryText={`${outage.get('locationDescription')} (${outage.get('unitName')}) at ${outage.get('stationName')} is out for ${outage.get('symptomDescription').toLowerCase()}`}
            secondaryText={
              <div
                style={{
                  textAlign: 'right',
                  fontSize: 12,
                  lineHeight: '14px'
                }}
              >
                <div>
                  last reported in service {outOfServiceDate.fromNow()}
                </div>
                {
                  estimatedReturnToServiceDate ?
                    (
                      <div>
                        expected to return to service {estimatedReturnToServiceDate.fromNow()}
                      </div>
                    )
                    : null
                }
              </div>
            }
            secondaryTextLines={estimatedReturnToServiceDate ? 2 : 1}
            innerDivStyle={{padding: 8, fontSize: 13}}
            disabled
          />
        );
      });

      elevatorDescription = {__html: `${outages.length} reported elevator ${(outages.length === 1) ? 'outage' : 'outages'} at this station:`};
      elevatorList = (
        <List>
          {outages}
        </List>
      );
    } else {
      elevatorDescription = {__html: 'No reported elevator outages at this station.'};
    }

    let escalatorDescription;
    let escalatorList;
    if (!this.state.haveData) {
      escalatorDescription = {__html: '<i>Loading escalator outages…</i>'};
    } else if (this.state.escalatorOutages) {
      const outages = [];
      this.state.escalatorOutages.forEach((outage, index) => {
        const outOfServiceDate = moment(outage.get('outOfServiceDateString'));
        const estimatedReturnToServiceDate = outage.get('estimatedReturnToServiceDate') ? moment(outage.get('estimatedReturnToServiceDate')) : null;

        outages.push(
          <ListItem
            key={outage.get('unitName')}
            primaryText={`${outage.get('locationDescription')} (${outage.get('unitName')}) at ${outage.get('stationName')} is out for ${outage.get('symptomDescription').toLowerCase()}`}
            secondaryText={
              <div
                style={{
                  textAlign: 'right',
                  fontSize: 12,
                  lineHeight: '14px'
                }}
              >
                <div>
                  last reported in service {outOfServiceDate.fromNow()}
                </div>
                {
                  estimatedReturnToServiceDate ?
                    (
                      <div>
                        expected to return to service {estimatedReturnToServiceDate.fromNow()}
                      </div>
                    )
                    : null
                }
              </div>
            }
            secondaryTextLines={estimatedReturnToServiceDate ? 2 : 1}
            innerDivStyle={{padding: 8, fontSize: 13}}
            disabled
          />
        );
      });

      escalatorDescription = {__html: `${outages.length} reported escalator ${(outages.length === 1) ? 'outage' : 'outages'} at this station:`};
      escalatorList = (
        <List>
          {outages}
        </List>
      );
    } else {
      escalatorDescription = {__html: 'No reported escalator outages at this station.'};
    }

    return (
      <div className='station-dialog-problems-content'>
        <div className='station-dialog-problems-content-alerts'>
          <p className='station-dialog-problems-content-alerts-description' dangerouslySetInnerHTML={elevatorDescription} style={elevatorList ? {marginBottom: 0} : null} />
          {elevatorList}
        </div>
        <Divider />
        <div className='station-dialog-problems-content-twitter'>
          <p className='station-dialog-problems-content-twitter-description' dangerouslySetInnerHTML={escalatorDescription} style={escalatorList ? {marginBottom: 0} : null} />
          {escalatorList}
        </div>
      </div>
    );
  }
});
