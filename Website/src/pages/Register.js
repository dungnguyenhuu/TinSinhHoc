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
      showErrorNotification('????ng k?? t??i kho???n th???t b???i!');
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
      showErrorNotification('Th??ng tin t??i kho???n ch??a h???p l???!');
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
        'T??n ????ng nh???p l?? th??ng tin b???t bu???c v?? kh??ng ???????c ????? tr???ng!'
      );
    }

    if (password === '') {
      passwordErrors.push(
        'M???t kh???u l?? th??ng tin b???t bu???c v?? kh??ng ???????c ????? tr???ng!'
      );
    }

    if (email === '') {
      emailErrors.push(
        '?????a ch??? email l?? th??ng tin b???t bu???c v?? kh??ng ???????c ????? tr???ng!'
      );
    }

    if (!isValidEmail(email)) {
      emailErrors.push('?????a ch??? email kh??ng h???p l???!');
    }

    if (confirmation_password === '') {
      confirmationPasswordErrors.push(
        'M???t kh???u x??c nh???n l?? th??ng tin b???t bu???c v?? kh??ng ???????c ????? tr???ng!'
      );
    }

    if (password !== confirmation_password) {
      confirmationPasswordErrors.push('M???t kh???u x??c nh???n ch??a tr??ng kh???p!');
    }

    if (password.length < 6) {
      passwordErrors.push('M???t kh???u ph???i c?? ??t nh???t 6 k?? t???!');
    }

    if (usernameErrors.length > 0) {
      errors['username'] = {
        name: 'T??n ????ng nh???p',
        errors: usernameErrors,
      };
    }

    if (passwordErrors.length > 0) {
      errors['password'] = {
        name: 'M???t kh???u',
        errors: passwordErrors,
      };
    }

    if (emailErrors.length > 0) {
      errors['email'] = {
        name: '?????a ch??? email',
        errors: emailErrors,
      };
    }

    if (confirmationPasswordErrors.length > 0) {
      errors['confirmation_password'] = {
        name: 'M???t kh???u x??c nh???n',
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
            <h3 className="form__title">????ng k?? t??i kho???n</h3>
            <p className="form__subtitle">
              ????? nh???n API key v?? s??? d???ng{' '}
              <strong>TextClassifier</strong> cho ???ng d???ng c???a b???n
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
                <label>T??n ????ng nh???p</label>
                <input
                  type="text"
                  placeholder="Nh???p t??n ????ng nh???p c???a b???n"
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
                <label>H??? v?? t??n</label>
                <input
                  type="text"
                  placeholder="Nh???p h??? v?? t??n ?????y ????? c???a b???n"
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
                <label>?????a ch??? email</label>
                <input
                  type="email"
                  placeholder="Nh???p ?????a ch??? email c???a b???n"
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
                <label>M???t kh???u</label>
                <input
                  type="password"
                  placeholder="Nh???p m???t kh???u c???a b???n"
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
                <label>X??c nh???n l???i m???t kh???u</label>
                <input
                  type="password"
                  placeholder="X??c nh???n l???i m???t kh???u c???a b???n"
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
                ????ng k??
              </button>
            </div>

            <div className="messages">
              ???? c?? t??i kho???n?{' '}
              <Link to="/dang-nhap" className="active">
                ????ng nh???p
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
