import React, { Component, Fragment } from 'react';
import { isEmptyObj } from '../utils';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class AuthenticatedRoute extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: this.props.user,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      if (isEmptyObj(this.state.user)) {
        this.props.history.push('/dang-nhap');
      }
    }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ user: nextProps.user });
  }

  render() {
    const { children } = this.props;

    return <Fragment>{children}</Fragment>;
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

export default withRouter(connect(mapStateToProps, null)(AuthenticatedRoute));
