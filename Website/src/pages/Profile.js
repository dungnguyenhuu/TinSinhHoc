import React, { Component, Fragment } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import apiRoutes from '../routes/apis';
import { connect } from 'react-redux';
import { showNotification, logIn } from '../redux/actions';
import axios from 'axios';
import { isValidEmail } from '../utils';
import Layout from '../components/Layout';
import AuthenticatedRoute from '../components/AuthenticatedRoute';

class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userData: {
        username: '',
        full_name: '',
        email: '',
      },
      user: this.props.user,
      showAlert: false,
      errors: null,
    };
  }

  componentDidMount() {
    const { fetchData } = this;

    fetchData();
  }

  componentWillReceiveProps(nextProps) {
    const { fetchData } = this;
    this.setState({ user: nextProps.user }, fetchData);
  }

  changeUserData = (fieldName, value) => {
    const userData = { ...this.state.userData };
    userData[fieldName] = value;

    this.setState({ userData });
  };

  hideAlert = () => {
    this.setState({ showAlert: false, errors: null });
  };

  fetchData = async () => {
    const { showErrorNotification } = this;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { users } = apiRoutes;
      const userId = this.props.user && this.props.user.id;
      const url = `${users.profile}/${userId}`;
      const response = await axios.get(url, {
        headers,
      });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        this.setState({
          userData: response.data.data,
        });
      } else {
        const { message } = response.data;

        console.log(message);
      }
    } catch (error) {
      showErrorNotification('Lấy thông tin của tài khoản thất bại!');
    }
  };

  validateFields = () => {
    const { userData } = this.state;
    const { email } = userData;
    let errors = {};
    let emailErrors = [];

    if (email === '') {
      emailErrors.push(
        'Địa chỉ email là thông tin bắt buộc và không được để trống!'
      );
    }

    if (!isValidEmail(email)) {
      emailErrors.push('Địa chỉ email không hợp lệ!');
    }

    if (emailErrors.length > 0) {
      errors['email'] = {
        name: 'Địa chỉ email',
        errors: emailErrors,
      };
    }

    return emailErrors.length > 0 ? errors : null;
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

  showSuccessNotification = (message) => {
    const { showNotification } = this.props;

    showNotification('success', message);
  };

  showErrorNotification = (message) => {
    const { showNotification } = this.props;

    showNotification('error', message);
  };

  update = async () => {
    const { showSuccessNotification, showErrorNotification } = this;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.props.user && this.props.user.token,
      };

      const { userData } = this.state;
      const { users } = apiRoutes;
      const userId = this.props.user && this.props.user.id;
      const url = `${users.profile}/${userId}`;
      const response = await axios.put(url, userData, { headers });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        const { message } = response.data;
        const localUser = JSON.parse(localStorage.getItem('VTC_USER'));
        localUser['full_name'] = userData.full_name;

        this.props.logIn(localUser);
        localStorage.setItem('VTC_USER', JSON.stringify(localUser));

        showSuccessNotification(message);
      } else {
        const { errors, message } = response.data;

        this.setState({ errors, showAlert: true });
        showErrorNotification(message);
      }
    } catch (error) {
      showErrorNotification('Cập nhật thông tin tài khoản thất bại!');
    }
  };

  submit = (e) => {
    e.preventDefault();
    const { validateFields, update, showErrorNotification } = this;
    const errors = validateFields();

    if (!errors) {
      this.setState({ showAlert: false }, update);
    } else {
      showErrorNotification('Thông tin tài khoản chưa hợp lệ!');
      this.setState({ errors, showAlert: true });
    }
  };

  render() {
    const { changeUserData, isValidField, hideAlert, submit } = this;
    const { showAlert, errors } = this.state;

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
                    Cập nhật thông tin
                  </NavLink>
                  <NavLink
                    to="/thay-doi-mat-khau"
                    className="list-item"
                    activeClassName="active"
                  >
                    Thay đổi mật khẩu
                  </NavLink>
                  <NavLink
                    to="/quan-ly-api"
                    className="list-item"
                    activeClassName="active"
                  >
                    Quản lý API
                  </NavLink>
                </div>
              </div>

              <div className="right-column">
                <form className="auth-form" onSubmit={submit}>
                  <h3 className="form__title">Cập nhật thông tin</h3>

                  {showAlert && (
                    <div className="alert-box">
                      <ul>
                        {Object.keys(errors).map((error) => {
                          const subErrors = errors[error].errors;

                          return subErrors.map((subError, index) => (
                            <li key={index}>
                              <i className="fas fa-exclamation-triangle"></i>{' '}
                              <strong>{errors[error].name}:</strong> {subError}
                            </li>
                          ));
                        })}
                      </ul>
                    </div>
                  )}

                  <div className="form__main">
                    <div className="form-group">
                      <label>Tên đăng nhập</label>
                      <input
                        type="text"
                        placeholder="Nhập tên đăng nhập của bạn"
                        disabled={true}
                        value={this.state.userData.username}
                      />
                    </div>

                    <div className="form-group">
                      <label>Họ và tên</label>
                      <input
                        type="text"
                        placeholder="Nhập họ và tên đầy đủ của bạn"
                        value={this.state.userData.full_name}
                        onChange={(e) =>
                          changeUserData('full_name', e.target.value)
                        }
                        onFocus={hideAlert}
                      />
                    </div>

                    <div className="form-group">
                      <label>Địa chỉ email</label>
                      <input
                        type="email"
                        placeholder="Nhập địa chỉ email của bạn"
                        value={this.state.userData.email}
                        onChange={(e) =>
                          changeUserData('email', e.target.value)
                        }
                        className={
                          isValidField('email')
                            ? 'form-input-alert'
                            : 'form-input-outline'
                        }
                        onFocus={hideAlert}
                      />
                    </div>

                    <button className="button">Cập nhật thông tin</button>
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
  connect(mapStateToProps, { showNotification, logIn })(Profile)
);
