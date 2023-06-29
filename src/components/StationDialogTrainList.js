import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';

import StationStore from '../stores/StationStore';

import StationDialogTrainRow from './StationDialogTrainRow';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(StationStore, 'onStoreChange')
  ],

  propTypes: {
    onClickTrain: PropTypes.func.isRequired
  },

  getStoreState() {
    return {
      haveData: !!StationStore.get('data'),
      trainStatuses: StationStore.get('data') ? StationStore.get('data').get('trainStatuses') : null
    };
  },

  componentDidUpdate() {
    // workaround, see: https://github.com/callemall/material-ui/issues/5793#issuecomment-282306001
    window.dispatchEvent(new Event('resize'));
  },

  _isTrainDelayed(trainStatus) {
    return trainStatus.get('isCurrentlyHoldingOrSlow');
  },

  render() {
    if (!this.state.haveData) {
      return (
        <p style={{textAlign: 'center'}}>
          <i>Loading…</i>
        </p>
      );
    } if (this.state.trainStatuses) {
      const leftListContent = [];
      const rightListContent = [];

      this.state.trainStatuses.forEach((trainStatus, index) => {
        const listItem = (
          <StationDialogTrainRow
            key={trainStatus.get('trainId')}
            Group={trainStatus.get('Group')}
            morePositiveTags={trainStatus.get('numPositiveTags') > trainStatus.get('numNegativeTags')}
            moreNegativeTags={trainStatus.get('numNegativeTags') > trainStatus.get('numPositiveTags')}
            trainId={trainStatus.get('trainId')}
            Line={trainStatus.get('Line')}
            DestinationName={trainStatus.get('DestinationName')}
            Car={trainStatus.get('Car')}
            Min={trainStatus.get('Min')}
            isSlowOrHolding={this._isTrainDelayed(trainStatus)}
            isTrainDelayed={trainStatus.get('secondsOffSchedule') >= 300}
            isScheduled={trainStatus.get('isScheduled')}
            realTrainId={trainStatus.get('realTrainId')}
            onClick={this.props.onClickTrain}
          />
        );

        if (trainStatus.get('Group') === '1') {
          rightListContent.push(listItem);
        } else {
          leftListContent.push(listItem);
        }
      });

      return (
        <div className="station-dialog-content-table">
          <div className="left-list">
            {leftListContent}
          </div>
          <div className="right-list">
            {rightListContent}
          </div>
        </div>
      );
    } else {
      return (
        <p style={{textAlign: 'center'}}>
          No train ETAs available.
        </p>
      );
    }
  }
});
