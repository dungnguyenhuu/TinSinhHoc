import React, { Component } from 'react';
import { connect } from 'react-redux';
import { showNotification, logIn } from '../redux/actions';
import apiRoutes from '../routes/apis';
import { apiPost, isValidEmail, isEmptyObj } from '../utils';
import { Redirect, Link, withRouter } from 'react-router-dom';
import Layout from '../components/Layout';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userData: {
        username: '',
        password: '',
      },
      loading: false,
      showAlert: false,
      errors: null,
    };
  }

  changeUserData = (fieldName, value) => {
    const userData = { ...this.state.userData };
    userData[fieldName] = value;

    this.setState({ userData });
  };

  login = async () => {
    const { reset, showSuccessNotification, showErrorNotification } = this;

    try {
      const { reset } = this;
      const { userData } = this.state;
      const { history, logIn } = this.props;
      const { users } = apiRoutes;
      const url = users.login;
      const response = await apiPost(url, userData);

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        const { message } = response.data;
        const { id, token, username, full_name, admin } = response.data.data;
        const localUser = {
          username,
          full_name,
          token,
          admin,
          id,
        };

        showSuccessNotification(message);
        this.setState({ loading: false }, () => {
          logIn(response.data);
          localStorage.setItem('VTC_USER', JSON.stringify(localUser));
          history.push('/');
        });
      } else {
        const { message } = response.data;

        showErrorNotification(message);
        this.setState({ loading: false });
        reset();
      }
    } catch (error) {
      showErrorNotification('Đăng nhập tài khoản thất bại!');
      this.setState({ loading: false });
      reset();
    }
  };

  reset = () => {
    this.setState({
      userData: {
        username: '',
        password: '',
      },
    });
  };

  submit = (e) => {
    e.preventDefault();
    const { validateFields, login, showErrorNotification } = this;
    const errors = validateFields();

    if (!errors) {
      this.setState({ showAlert: false, loading: true }, login);
    } else {
      showErrorNotification('Thông tin tài khoản chưa hợp lệ!');
      this.setState({ errors, showAlert: true });
    }
  };

  hideAlert = () => {
    this.setState({ showAlert: false, errors: null });
  };

  validateFields = () => {
    const { userData } = this.state;
    const { username, password } = userData;
    let errors = {};
    let usernameErrors = [];
    let emailErrors = [];
    let passwordErrors = [];
    let confirmationPasswordErrors = [];

    if (username === '') {
      usernameErrors.push(
        'Tên đăng nhập là thông tin bắt buộc và không được để trống!'
      );
    }

    if (password === '') {
      passwordErrors.push(
        'Mật khẩu là thông tin bắt buộc và không được để trống!'
      );
    }

    if (usernameErrors.length > 0) {
      errors['username'] = {
        name: 'Tên đăng nhập',
        errors: usernameErrors,
      };
    }

    if (passwordErrors.length > 0) {
      errors['password'] = {
        name: 'Mật khẩu',
        errors: passwordErrors,
      };
    }

    return usernameErrors.length > 0 || passwordErrors.length > 0
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

  showSuccessNotification = (message) => {
    const { showNotification } = this.props;

    showNotification('success', message);
  };

  showErrorNotification = (message) => {
    const { showNotification } = this.props;

    showNotification('error', message);
  };

  render() {
    const { changeUserData, hideAlert, isValidField, submit } = this;
    const { userData, showAlert, errors, loading } = this.state;

    if (!isEmptyObj(this.props.user)) {
      return <Redirect to="/" />;
    }

    return (
      <Layout>
        <div className="wrapper">
          <form className="auth-form" onSubmit={submit}>
            <h3 className="form__title">Đăng nhập tài khoản</h3>
            <p className="form__subtitle">
              Để nhận API key và sử dụng{' '}
              <strong>TextClassifier</strong> cho ứng dụng của bạn
            </p>

            <div className="form__main">
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

              <div className="form-group">
                <label>Tên đăng nhập</label>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập của bạn"
                  value={userData && userData.username}
                  onChange={(e) => changeUserData('username', e.target.value)}
                  autoComplete="off"
                  className={
                    isValidField('username')
                      ? 'form-input-alert'
                      : 'form-input-outline'
                  }
                  onFocus={hideAlert}
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu của bạn"
                  value={userData && userData.password}
                  onChange={(e) => changeUserData('password', e.target.value)}
                  autoComplete="off"
                  className={
                    isValidField('password')
                      ? 'form-input-alert'
                      : 'form-input-outline'
                  }
                  onFocus={hideAlert}
                />
              </div>

              <button type="submit" className="button">
                Đăng nhập
              </button>
            </div>

            <div className="messages">
              Chưa có tài khoản?{' '}
              <Link to="/dang-ky" className="active">
                Đăng ký
              </Link>{' '}
              ngay
            </div>
          </form>
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

export default withRouter(
  connect(mapStateToProps, { showNotification, logIn })(Login)
);
