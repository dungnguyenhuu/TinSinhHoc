import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import AuthenticatedRoute from '../components/AuthenticatedRoute';
import axios from 'axios';
import { showNotification } from '../redux/actions';
import apiRoutes from '../routes/apis';

class ChangePassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userData: {
        old_password: '',
        new_password: '',
        new_password_confirmation: '',
      },
      showAlert: false,
      errors: null,
      user: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ user: nextProps.user });
  }

  changeUserData = (fieldName, value) => {
    const userData = { ...this.state.userData };
    userData[fieldName] = value;

    this.setState({ userData });
  };

  changePassword = async () => {
    const { showSuccessNotification, showErrorNotification } = this;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { userData, user } = this.state;
      const { users } = apiRoutes;
      const url = `${users.changePassword}/${user.id}`;
      const response = await axios.put(url, userData, { headers });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        const { message } = response.data;

        showSuccessNotification(message);
      } else {
        const { errors, message } = response.data;

        this.setState({ errors, showAlert: true });
        showErrorNotification(message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  submit = (e) => {
    e.preventDefault();
    const { validateFields, changePassword, showErrorNotification } = this;
    const errors = validateFields();

    if (!errors) {
      this.setState({ showAlert: false, loading: true }, changePassword);
    } else {
      showErrorNotification('Th??ng tin m???t kh???u ch??a h???p l???!');
      this.setState({ errors, showAlert: true });
    }
  };

  hideAlert = () => {
    this.setState({ showAlert: false, errors: null });
  };

  showSuccessNotification = (message) => {
    const { showNotification } = this.props;

    showNotification('success', message);
  };

  showErrorNotification = (message) => {
    const { showNotification } = this.props;

    showNotification('error', message);
  };

  validateFields = () => {
    const { userData } = this.state;
    const { old_password, new_password, new_password_confirmation } = userData;
    let errors = {};
    let oldPasswordErrors = [];
    let newPasswordErrors = [];
    let newPasswordConfirmationErrors = [];

    if (old_password === '') {
      oldPasswordErrors.push(
        'M???t kh???u c?? l?? th??ng tin b???t bu???c v?? kh??ng ???????c ????? tr???ng!'
      );
    }

    if (new_password === '') {
      newPasswordErrors.push(
        'M???t kh???u m???i l?? th??ng tin b???t bu???c v?? kh??ng ???????c ????? tr???ng!'
      );
    }

    if (new_password.length < 6) {
      newPasswordErrors.push('M???t kh???u m???i ph???i c?? ??t nh???t 6 k?? t???!');
    }

    if (new_password_confirmation === '') {
      newPasswordConfirmationErrors.push(
        'X??c nh???n m???t kh???u m???i l?? th??ng tin b???t bu???c v?? kh??ng ???????c ????? tr???ng!'
      );
    }

    if (
      new_password_confirmation !== '' &&
      new_password_confirmation !== new_password
    ) {
      newPasswordConfirmationErrors.push(
        'X??c nh???n m???t kh???u m???i ch??a tr??ng kh???p!'
      );
    }

    if (oldPasswordErrors.length > 0) {
      errors['old_password'] = {
        name: 'M???t kh???u c??',
        errors: oldPasswordErrors,
      };
    }

    if (newPasswordErrors.length > 0) {
      errors['new_password'] = {
        name: 'M???t kh???u m???i',
        errors: newPasswordErrors,
      };
    }

    if (newPasswordConfirmationErrors.length > 0) {
      errors['new_password_confirmation'] = {
        name: 'X??c nh???n m???t kh???u m???i',
        errors: newPasswordConfirmationErrors,
      };
    }

    return oldPasswordErrors.length > 0 ||
      newPasswordErrors.length > 0 ||
      newPasswordConfirmationErrors.length > 0
      ? errors
      : null;
  };

  isValidField = (fieldName) => {
    const { errors } = this.state;

    return (
      errors &&
      Object.keys(errors)
        .map((key) => key.toLowerCase())
        .indexOf(fieldName.toLowerCase()) > -1
    );
  };

  render() {
    const { changeUserData, isValidField, hideAlert, submit } = this;
    const { userData, showAlert, errors } = this.state;

    return (
      <Layout>
        <AuthenticatedRoute>
          <div className="wrapper profile">
            <div className="row">
              <div className="left-column">
                <div className="list">
                  <NavLink
                    to="/tai-khoan"
                    className="list-item"
                    activeClassName="active"
                  >
                    C???p nh???t th??ng tin
                  </NavLink>
                  <NavLink
                    to="/thay-doi-mat-khau"
                    className="list-item"
                    activeClassName="active"
                  >
                    Thay ?????i m???t kh???u
                  </NavLink>
                  <NavLink
                    to="/quan-ly-api"
                    className="list-item"
                    activeClassName="active"
                  >
                    Qu???n l?? API
                  </NavLink>
                </div>
              </div>

              <div className="right-column">
                <form className="auth-form" onSubmit={submit}>
                  <h3 className="form__title">Thay ?????i m???t kh???u</h3>

                  <div className="form__main">
                    {showAlert && (
                      <div className="alert-box">
                        <ul>
                          {Object.keys(errors).map((error) => {
                            const subErrors = errors[error].errors;

                            return subErrors.map((subError, index) => (
                              <li key={index}>
                                <i className="fas fa-exclamation-triangle"></i>{' '}
                                <strong>{errors[error].name}:</strong>{' '}
                                {subError}
                              </li>
                            ));
                          })}
                        </ul>
                      </div>
                    )}

                    <div className="form-group">
                      <label>M???t kh???u c??</label>
                      <input
                        type="password"
                        placeholder="Nh???p m???t kh???u c?? c???a b???n"
                        onChange={(e) =>
                          changeUserData('old_password', e.target.value)
                        }
                        autoComplete="off"
                        className={
                          isValidField('old_password')
                            ? 'form-input-alert'
                            : 'form-input-outline'
                        }
                        onFocus={hideAlert}
                        value={userData.old_password}
                      />
                    </div>

                    <div className="form-group">
                      <label>M???t kh???u m???i</label>
                      <input
                        type="password"
                        placeholder="Nh???p m???t kh???u m???i c???a b???n"
                        onChange={(e) =>
                          changeUserData('new_password', e.target.value)
                        }
                        autoComplete="off"
                        className={
                          isValidField('new_password')
                            ? 'form-input-alert'
                            : 'form-input-outline'
                        }
                        value={userData.new_password}
                      />
                    </div>

                    <div className="form-group">
                      <label>X??c nh???n l???i m???t kh???u</label>
                      <input
                        type="password"
                        placeholder="X??c nh???n l???i m???t kh???u c???a b???n"
                        onChange={(e) =>
                          changeUserData(
                            'new_password_confirmation',
                            e.target.value
                          )
                        }
                        autoComplete="off"
                        className={
                          isValidField('new_password_confirmation')
                            ? 'form-input-alert'
                            : 'form-input-outline'
                        }
                        value={userData.new_password_confirmation}
                      />
                    </div>

                    <button type="submit" className="button">
                      Thay ?????i m???t kh???u
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </AuthenticatedRoute>
      </Layout>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

export default withRouter(
  connect(mapStateToProps, { showNotification })(ChangePassword)
);
