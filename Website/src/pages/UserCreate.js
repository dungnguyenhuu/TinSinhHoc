import React, { Component } from 'react';
import { NavLink, Link, withRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import apiRoutes from '../routes/apis';
import { showNotification } from '../redux/actions';
import { connect } from 'react-redux';
import AuthenticatedRoute from '../components/AuthenticatedRoute';
import { isValidEmail } from '../utils';

class UserCreate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userData: {
        admin: 0,
      },
      user: this.props.user,
      showAlert: false,
      errors: null,
    };
  }

  changeUserData = (fieldName, value) => {
    const userData = { ...this.state.userData };
    userData[fieldName] = value;

    this.setState({ userData });
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ user: nextProps.user });
  }

  create = async () => {
    const { showSuccessNotification, showErrorNotification } = this;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.props.user && this.props.user.token,
      };

      const { userData } = this.state;
      const { users } = apiRoutes;
      const url = users.register;
      const response = await axios.post(url, userData, { headers });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        const { message } = response.data;

        showSuccessNotification(message);
        this.props.history.push('/bang-dieu-khien/nguoi-dung');
      } else {
        const { errors, message } = response.data;

        this.setState({ errors, showAlert: true });
        showErrorNotification(message);
      }
    } catch (error) {
      showErrorNotification('Thêm tài khoản mới thất bại!');
    }
  };

  submit = (e) => {
    e.preventDefault();
    const { validateFields, create, showErrorNotification } = this;
    const errors = validateFields();

    if (!errors) {
      this.setState({ showAlert: false }, create);
    } else {
      showErrorNotification('Thông tin tài khoản chưa hợp lệ!');
      this.setState({ errors, showAlert: true });
    }
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

    if (email === '') {
      emailErrors.push(
        'Địa chỉ email là thông tin bắt buộc và không được để trống!'
      );
    }

    if (!isValidEmail(email)) {
      emailErrors.push('Địa chỉ email không hợp lệ!');
    }

    if (password === '') {
      passwordErrors.push(
        'Mật khẩu là thông tin bắt buộc và không được để trống!'
      );
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

    if (confirmationPasswordErrors.length > 0) {
      errors['confirmation_password'] = {
        name: 'Mật khẩu xác nhận',
        errors: confirmationPasswordErrors,
      };
    }

    if (emailErrors.length > 0) {
      errors['email'] = {
        name: 'Địa chỉ email',
        errors: emailErrors,
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
    const { changeUserData, isValidField, hideAlert, submit } = this;
    const { showAlert, errors, userData } = this.state;

    return (
      <Layout>
        <AuthenticatedRoute>
          <div className="wrapper profile">
            <div className="row">
              <div className="left-column">
                <div className="list">
                  <NavLink
                    to="/bang-dieu-khien/tong-quan"
                    className="list-item"
                    activeClassName="active"
                  >
                    Tổng quan
                  </NavLink>
                  <NavLink
                    to="/bang-dieu-khien/nguoi-dung"
                    className="list-item"
                    activeClassName="active"
                  >
                    Quản lý người dùng
                  </NavLink>
                  <NavLink
                    to="/bang-dieu-khien/request"
                    className="list-item"
                    activeClassName="active"
                  >
                    Quản lý request
                  </NavLink>
                  <NavLink
                    to="/bang-dieu-khien/api-key"
                    className="list-item"
                    activeClassName="active"
                  >
                    Quản lý API key
                  </NavLink>
                </div>
              </div>

              <div className="right-column">
                <form className="auth-form" onSubmit={submit}>
                  <h3 className="form__title">Thêm người dùng mới</h3>

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
                      <label>Tên đăng nhập</label>
                      <input
                        type="text"
                        placeholder="Tên đăng nhập"
                        autoComplete="off"
                        onChange={(e) =>
                          changeUserData('username', e.target.value)
                        }
                        className={
                          isValidField('username')
                            ? 'form-input-alert'
                            : 'form-input-outline'
                        }
                        onFocus={hideAlert}
                        value={userData.username}
                      />
                    </div>

                    <div className="form-group">
                      <label>Tên đầy đủ</label>
                      <input
                        type="text"
                        placeholder="Tên đầy đủ"
                        autoComplete="off"
                        onChange={(e) =>
                          changeUserData('full_name', e.target.value)
                        }
                        className={
                          isValidField('full_name')
                            ? 'form-input-alert'
                            : 'form-input-outline'
                        }
                        onFocus={hideAlert}
                        value={userData.full_name}
                      />
                    </div>

                    <div className="form-group">
                      <label>Địa chỉ email</label>
                      <input
                        type="email"
                        placeholder="Địa chỉ email"
                        autoComplete="off"
                        onChange={(e) =>
                          changeUserData('email', e.target.value)
                        }
                        className={
                          isValidField('email')
                            ? 'form-input-alert'
                            : 'form-input-outline'
                        }
                        onFocus={hideAlert}
                        value={userData.email}
                      />
                    </div>

                    <div className="form-group">
                      <label>Phân quyền</label>
                      <select
                        onChange={(e) =>
                          changeUserData('admin', parseInt(e.target.value))
                        }
                        value={userData.admin}
                        style={{
                          width: '100%',
                          padding: '16px',
                          marginBottom: '12px',
                          fontSize: '15px',
                        }}
                      >
                        <option value={0}>Người dùng</option>
                        <option value={1}>Quản trị viên</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Mật khẩu</label>
                      <input
                        type="password"
                        placeholder="Nhập mật khẩu"
                        value={userData && userData.password}
                        onChange={(e) =>
                          changeUserData('password', e.target.value)
                        }
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
                        placeholder="Xác nhận lại mật khẩu"
                        value={userData && userData.confirmation_password}
                        onChange={(e) =>
                          changeUserData(
                            'confirmation_password',
                            e.target.value
                          )
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

                    <div className="buttons">
                      <Link
                        to="/bang-dieu-khien/nguoi-dung"
                        className="button"
                        style={{ marginRight: '10px' }}
                      >
                        Trở về
                      </Link>
                      <button type="submit" className="button">
                        Thêm mới
                      </button>
                    </div>
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
  connect(mapStateToProps, { showNotification })(UserCreate)
);
