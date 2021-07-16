import React, { Component } from 'react';
import { NavLink, Link, withRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import apiRoutes from '../routes/apis';
import { showNotification } from '../redux/actions';
import { connect } from 'react-redux';
import AuthenticatedRoute from '../components/AuthenticatedRoute';
import { isValidEmail, formatDateString } from '../utils';

class UserEdit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userData: {
        admin: 0,
      },
      user: this.props.user,
      userId: this.props.match.params.id,
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
    const { fetchData } = this;
    this.setState(
      { userId: nextProps.match.params.id, user: nextProps.user },
      fetchData
    );
  }

  componentDidMount() {
    const { fetchData } = this;

    fetchData();
  }

  fetchData = async () => {
    const { showErrorNotification } = this;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { users } = apiRoutes;
      const userId = this.state.userId;
      const url = `${users.details}/${userId}`;
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
      showErrorNotification('Lấy thông tin của người dùng thất bại!');
    }
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

        if (userId === this.state.user.id) {
          const localUser = JSON.parse(localStorage.getItem('VTC_USER'));
          localUser['full_name'] = userData.full_name;

          this.props.logIn(localUser);
          localStorage.setItem('VTC_USER', JSON.stringify(localUser));
        }

        this.props.history.push('/bang-dieu-khien/nguoi-dung');
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
                  <h3 className="form__title">Cập nhật thông tin người dùng</h3>

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
                        disabled={true}
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
                      <label>Thời gian tạo</label>
                      <input
                        type="text"
                        placeholder="Thời gian tạo"
                        disabled={true}
                        value={formatDateString(userData.created_at)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Thời gian cập nhật cuối</label>
                      <input
                        type="text"
                        placeholder="Thời gian cập nhật cuối"
                        disabled={true}
                        value={formatDateString(userData.updated_at)}
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
                        Cập nhật
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
  connect(mapStateToProps, { showNotification })(UserEdit)
);
