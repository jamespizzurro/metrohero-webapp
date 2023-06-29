import React from 'react';
import createReactClass from 'create-react-class';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin
  ],

  render() {
    return (
      <div className='BetweenStopsRow'>
        {this.props.children}
      </div>
    );
  }
});
