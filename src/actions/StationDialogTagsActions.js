import Reflux from 'reflux';

export default Reflux.createActions({

  updateState: {},
  clearState: {},
  getTags: {asyncResult: true},
  tag: {asyncResult: true},
  untag: {asyncResult: true}
});
