import React, { Component } from 'react';
import { connect } from 'react-redux';
import { showNotification, logIn } from '../redux/actions';
import apiRoutes from '../routes/apis';
import { apiPost, isValidEmail, isEmptyObj } from '../utils';
import { Redirect, Link, withRouter } from 'react-router-dom';
import Layout from '../components/Layout';

class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userData: {
        username: '',
        full_name: '',
        email: '',
        password: '',
        confirmation_password: '',
        admin: 0,
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
      const url = users.register;
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
        const { errors, message } = response.data;

        showErrorNotification(message);
        this.setState({ errors, showAlert: true, loading: false });
        reset();
      }
    } catch (error) {
      showErrorNotification('Đăng ký tài khoản thất bại!');
      this.setState({ loading: false });
      reset();
    }
  };

  reset = () => {
    this.setState({
      userData: {
        username: '',
        full_name: '',
        email: '',
        password: '',
        confirmation_password: '',
        admin: 0,
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
    const { username, email, password, confirmation_password } = userData;
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

    if (email === '') {
      emailErrors.push(
        'Địa chỉ email là thông tin bắt buộc và không được để trống!'
      );
    }

    if (!isValidEmail(email)) {
      emailErrors.push('Địa chỉ email không hợp lệ!');
    }

    if (confirmation_password === '') {
      confirmationPasswordErrors.push(
        'Mật khẩu xác nhận là thông tin bắt buộc và không được để trống!'
      );
    }

    if (password !== confirmation_password) {
      confirmationPasswordErrors.push('Mật khẩu xác nhận chưa trùng khớp!');
    }

    if (password.length < 6) {
      passwordErrors.push('Mật khẩu phải có ít nhất 6 ký tự!');
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

    if (emailErrors.length > 0) {
      errors['email'] = {
        name: 'Địa chỉ email',
        errors: emailErrors,
      };
    }

    if (confirmationPasswordErrors.length > 0) {
      errors['confirmation_password'] = {
        name: 'Mật khẩu xác nhận',
        errors: confirmationPasswordErrors,
      };
    }

    return usernameErrors.length > 0 ||
      emailErrors.length > 0 ||
      passwordErrors.length > 0 ||
      confirmationPasswordErrors.length > 0
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
    const { userData, showAlert, errors } = this.state;

    if (!isEmptyObj(this.props.user)) {
      return <Redirect to="/" />;
    }

    return (
      <Layout>
        <div className="wrapper">
          <form className="auth-form" onSubmit={submit}>
            <h3 className="form__title">Đăng ký tài khoản</h3>
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
                <label>Họ và tên</label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên đầy đủ của bạn"
                  value={userData && userData.full_name}
                  onChange={(e) => changeUserData('full_name', e.target.value)}
                  autoComplete="off"
                  className={
                    isValidField('full_name')
                      ? 'form-input-alert'
                      : 'form-input-outline'
                  }
                  onFocus={hideAlert}
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ email</label>
                <input
                  type="email"
                  placeholder="Nhập địa chỉ email của bạn"
                  value={userData && userData.email}
                  onChange={(e) => changeUserData('email', e.target.value)}
                  autoComplete="off"
                  className={
                    isValidField('email')
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

              <div className="form-group">
                <label>Xác nhận lại mật khẩu</label>
                <input
                  type="password"
                  placeholder="Xác nhận lại mật khẩu của bạn"
                  value={userData && userData.confirmation_password}
                  onChange={(e) =>
                    changeUserData('confirmation_password', e.target.value)
                  }
                  autoComplete="off"
                  className={
                    isValidField('confirmation_password')
                      ? 'form-input-alert'
                      : 'form-input-outline'
                  }
                  onFocus={hideAlert}
                />
              </div>

              <button type="submit" className="button">
                Đăng ký
              </button>
            </div>

            <div className="messages">
              Đã có tài khoản?{' '}
              <Link to="/dang-nhap" className="active">
                Đăng nhập
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
  connect(mapStateToProps, { showNotification, logIn })(Register)
);
