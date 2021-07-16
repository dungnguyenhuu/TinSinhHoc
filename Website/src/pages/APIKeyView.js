import React, { Component } from 'react';
import { NavLink, Link, withRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import apiRoutes from '../routes/apis';
import { showNotification } from '../redux/actions';
import { connect } from 'react-redux';
import AuthenticatedRoute from '../components/AuthenticatedRoute';
import { formatDateString } from '../utils';

class APIKeyView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      apiKey: {},
      user: this.props.user,
      apiKeyId: this.props.match.params.id,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { fetchData } = this;
    this.setState(
      { apiKeyId: nextProps.match.params.id, user: nextProps.user },
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
      } else {
        const { message } = response.data;

        console.log(message);
      }
    } catch (error) {
      showErrorNotification('Lấy thông tin của API key thất bại!');
    }
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
                <form className="auth-form">
                  <h3 className="form__title">Xem thông tin API key</h3>

                  <div className="form__main">
                    <div className="form-group">
                      <label>Người dùng</label>
                      <input
                        type="text"
                        placeholder="Tên người dùng"
                        disabled={true}
                        value={
                          (apiKey.user && apiKey.user.full_name) ||
                          (apiKey.user && apiKey.user.username)
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>API key</label>
                      <input
                        type="text"
                        placeholder="API key"
                        disabled={true}
                        value={apiKey.generated_key}
                      />
                    </div>

                    <div className="form-group">
                      <label>Số request còn lại</label>
                      <input
                        type="text"
                        placeholder="Số request còn lại"
                        disabled={true}
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

                    <Link to="/bang-dieu-khien/api-key" className="button">
                      Trở về
                    </Link>
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
  connect(mapStateToProps, { showNotification })(APIKeyView)
);
