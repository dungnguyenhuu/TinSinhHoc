import React, { Component } from 'react';
import { NavLink, Link, withRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import apiRoutes from '../routes/apis';
import { showNotification } from '../redux/actions';
import { connect } from 'react-redux';
import AuthenticatedRoute from '../components/AuthenticatedRoute';
import { formatDateString } from '../utils';

class RequestView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      request: {},
      user: this.props.user,
      requestId: this.props.match.params.id,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { fetchData } = this;

    this.setState(
      { requestId: nextProps.match.params.id, user: nextProps.user },
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

      const { apiCalls } = apiRoutes;
      const requestId = this.state.requestId;
      const url = `${apiCalls.details}/${requestId}`;
      const response = await axios.get(url, {
        headers,
      });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        this.setState({
          request: response.data.data,
        });
      } else {
        const { message } = response.data;

        console.log(message);
      }
    } catch (error) {
      showErrorNotification('Lấy thông tin của request thất bại!');
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
    const { request } = this.state;

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
                  <h3 className="form__title">Xem thông tin request</h3>

                  <div className="form__main">
                    <div className="form-group">
                      <label>Người dùng</label>
                      <input
                        type="text"
                        placeholder="Tên người dùng"
                        disabled={true}
                        value={
                          (request.user && request.user.full_name) ||
                          (request.user && request.user.username)
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>API key</label>
                      <input
                        type="text"
                        placeholder="API key"
                        disabled={true}
                        value={request.api_key}
                      />
                    </div>

                    <div className="form-group">
                      <label>Nội dung văn bản</label>
                      <textarea
                        disabled={true}
                        rows={5}
                        placeholder="Nội dung của văn bản"
                        value={request.document}
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label>Chủ đề được phân loại</label>
                      <input
                        type="text"
                        placeholder="Chủ đề được phân loại"
                        disabled={true}
                        value={request.result}
                      />
                    </div>

                    <div className="form-group">
                      <label>Thời gian gọi</label>
                      <input
                        type="text"
                        placeholder="Thời gian gọi"
                        disabled={true}
                        value={formatDateString(request.created_at)}
                      />
                    </div>

                    <Link to="/bang-dieu-khien/request" className="button">
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
  connect(mapStateToProps, { showNotification })(RequestView)
);
