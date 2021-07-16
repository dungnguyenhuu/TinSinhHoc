import React, { Component } from 'react';
import { NavLink, Link, withRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import apiRoutes from '../routes/apis';
import { showNotification } from '../redux/actions';
import { connect } from 'react-redux';
import AuthenticatedRoute from '../components/AuthenticatedRoute';
import { formatDateString } from '../utils';

class APIKeyEdit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      apiKey: {},
      user: this.props.user,
      apiKeyId: this.props.match.params.id,
    };
  }

  componentDidMount() {
    const { fetchData } = this;

    fetchData();
  }

  changeData = (fieldName, value) => {
    const apiKey = { ...this.state.apiKey };
    apiKey[fieldName] = value;

    this.setState({ apiKey });
  };

  componentWillReceiveProps(nextProps) {
    const { fetchData } = this;

    this.setState(
      { apiKeyId: nextProps.match.params.id, user: nextProps.user },
      fetchData
    );
  }

  update = async () => {
    const { showSuccessNotification, showErrorNotification } = this;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.props.user && this.props.user.token,
      };

      const { apiKey } = this.state;
      const { apiKeys } = apiRoutes;
      const apiKeyId = this.state.apiKeyId;
      const url = `${apiKeys.update}/${apiKeyId}`;
      const response = await axios.put(url, apiKey, { headers });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        const { message } = response.data;

        showSuccessNotification(message);
        this.props.history.push('/bang-dieu-khien/api-key');
      } else {
        const { message } = response.data;

        showErrorNotification(message);
      }
    } catch (error) {
      showErrorNotification('Cập nhật thông tin API key thất bại!');
    }
  };

  submit = (e) => {
    e.preventDefault();
    this.update();
  };

  showSuccessNotification = (message) => {
    const { showNotification } = this.props;

    showNotification('success', message);
  };

  showErrorNotification = (message) => {
    const { showNotification } = this.props;

    showNotification('error', message);
  };

  // fetchData = () => {
  //   const { fetchApiKey } = this;

  //   // fetchUsers();
  //   fetchApiKey();
  // };

  // fetchUsers = async () => {
  //   try {
  //     const headers = {
  //       'Content-Type': 'application/json',
  //       'x-access-token': this.state.user && this.state.user.token,
  //     };

  //     const { users } = apiRoutes;
  //     let url = users.listAll;

  //     const response = await axios.get(url, {
  //       headers,
  //     });

  //     if (
  //       response &&
  //       response.status === 200 &&
  //       response.data.status === 'SUCCESS'
  //     ) {
  //       const { data } = response.data;
  //       const { users } = data;

  //       this.setState({
  //         users,
  //         apiKey: {
  //           ...this.state.apiKey,
  //           user_id: users[0].id,
  //         },
  //       });
  //     } else {
  //       const { message } = response.data;

  //       console.log(message);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  fetchData = async () => {
    const { showErrorNotification } = this;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { apiKeys } = apiRoutes;
      const apiKeyId = this.state.apiKeyId;
      const url = `${apiKeys.details}/${apiKeyId}`;
      const response = await axios.get(url, {
        headers,
      });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        this.setState({
          apiKey: response.data.data,
        });

        console.log('Data: ', response.data);
      } else {
        const { message } = response.data;

        console.log(message);
      }
    } catch (error) {
      showErrorNotification('Lấy thông tin của API key thất bại!');
    }
  };

  render() {
    const { changeData, submit } = this;
    const { apiKey } = this.state;

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
                  <h3 className="form__title">Cập nhật thông tin API key</h3>
                  <div className="form-group">
                    <label>Người dùng</label>
                    <input
                      type="text"
                      placeholder="Người dùng"
                      disabled={true}
                      value={
                        (apiKey.user && apiKey.user.full_name) ||
                        (apiKey.user && apiKey.user.username)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Số request còn lại</label>
                    <input
                      type="number"
                      onChange={(e) =>
                        changeData('remaining_calls', parseInt(e.target.value))
                      }
                      value={apiKey.remaining_calls}
                    />
                  </div>

                  <div className="form-group">
                    <label>Thời gian tạo</label>
                    <input
                      type="text"
                      placeholder="Thời gian tạo"
                      disabled={true}
                      value={formatDateString(apiKey.created_at)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Thời gian cập nhật cuối</label>
                    <input
                      type="text"
                      placeholder="Thời gian cập nhật cuối"
                      disabled={true}
                      value={
                        (apiKey.updated_at &&
                          formatDateString(apiKey.updated_at)) ||
                        formatDateString(apiKey.created_at)
                      }
                    />
                  </div>

                  <div className="buttons">
                    <Link
                      to="/bang-dieu-khien/api-key"
                      className="button"
                      style={{ marginRight: '10px' }}
                    >
                      Trở về
                    </Link>
                    <button type="submit" className="button">
                      Cập nhật
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
  connect(mapStateToProps, { showNotification })(APIKeyEdit)
);
