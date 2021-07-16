import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { logIn, logOut } from '../redux/actions';
import { withRouter } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import apiRoutes from '../routes/apis';
import { isEmptyObj } from '../utils';

class Layout extends Component {
  componentWillMount() {
    const { validateToken } = this;

    validateToken();
  }

  validateToken = async () => {
    try {
      const localUser = JSON.parse(localStorage.getItem('VTC_USER')) || {};
      const { tokens } = apiRoutes;
      const url = tokens.validate;

      if (!isEmptyObj(localUser)) {
        const data = { token: localUser.token };
        const response = await axios.post(url, data);

        if (
          response &&
          response.status === 200 &&
          response.data.status === 'SUCCESS'
        ) {
          this.props.logIn(localUser);
        } else {
          // this.props.history.push('/dang-nhap');

          localStorage.removeItem('VTC_USER');
          this.props.logOut();
          this.props.history.push('/dang-nhap');
        }
      } else {
        // this.props.history.push('/dang-nhap');
      }
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const { children } = this.props;

    return (
      <Fragment>
        <Header />

        <div style={{ minHeight: '71.5vh' }}>{children}</div>

        <Footer />
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

export default withRouter(connect(mapStateToProps, { logIn, logOut })(Layout));
