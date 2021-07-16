import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

function Introduction() {
  return (
    <Layout>
      <div className="wrapper details">
        <h2>Giới thiệu</h2>
        <h3>Giới thiệu chung</h3>
        <ul>
          <li>
            Phân loại văn bản là việc sắp xếp các văn bản vào các danh mục tương
            ứng với chúng như thể thao, giải trí, xã hội,... như các trang báo
            điện tử thường làm. Việc này có thể được thực hiện thủ công bởi các
            biên tập viên tuy nhiên đòi hỏi phải tiêu tốn nhiều thời gian và
            công sức. <strong>TextClassifier API</strong> là giải pháp
            giúp phân loại văn bản tiếng Việt một cách nhanh chóng và hiệu quả.
          </li>
          <li>
            <strong>TextClassifier API</strong> hỗ trợ phân loại văn
            bản tiếng Việt tự động. API nhận đầu vào là API key của người dùng
            và văn bản tiếng Việt cần phân loại, kết quả trả về là nhãn tương
            ứng được gán cho văn bản đó.
          </li>
        </ul>

        <h3>Chức năng chính</h3>
        <p>
          <strong>TextClassifier API</strong> có chức năng trả về tên
          chủ đề{' '}
          <i>
            (Công nghệ, Chính trị - Xã hội, Đời sống, Giải trí, Giáo dục, Khoa
            học, Kinh doanh, Pháp luật, Sức khỏe, Thế giới, Thể thao, Văn hóa,
            Xe)
          </i>{' '}
          tương ứng với văn bản được người dùng cung cấp.
        </p>

        <h3>Đối tượng sử dụng</h3>
        <p>
          Bất cứ cá nhân/ tổ chức nào có nhu cầu phân loại văn bản tiếng Việt.
        </p>

        <h3>Cách sử dụng API</h3>
        <p>
          Xem cách sử dụng API chi tiết được trình bày trong mục{' '}
          <Link to="/huong-dan-su-dung-api" className="active">
            <strong>Hướng dẫn sử dụng API</strong>
          </Link>
          .
        </p>
      </div>
    </Layout>
  );
}

export default Introduction;
