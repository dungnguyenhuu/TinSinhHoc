import React from 'react';
import Layout from '../components/Layout';

function Documentation() {
  return (
    <Layout>
      <div className="wrapper details">
        <h2>Hướng dẫn sử dụng API</h2>
        <p>
          Để có thể sử dụng được <strong>TextClassifier API</strong>,
          trước hết chúng ta cần phải đăng ký hoặc đăng nhập tài khoản. Sau khi
          hoàn tất quá trình đăng ký/ đăng nhập tài khoản, tiếp tục vào mục{' '}
          <strong>API</strong> trong menu người dùng để lấy API key.
        </p>

        <h3>API Key</h3>
        <p>
          API Key được cấp một lần cho mỗi tài khoản. Trong phiên bản này, một
          API key được sử dụng cho tối đa 100 request. Một API key không tồn tại
          hoặc một API key đã hết số request (Số request còn lại bằng 0) được
          coi là một API key không hợp lệ.
        </p>

        {/* <h3>Phân loại một văn bản</h3>
        <p>
          Phân loại một văn bản là chức năng giúp phân loại chủ đề của một văn
          bản duy nhất. Để phân loại một văn bản nào đó, chúng ta cần gửi một
          yêu cầu HTTP như sau:
        </p> */}
        <div className="code-block">
          <p>
            Phương thức: <strong>POST</strong>
          </p>
          <p>
            Liên kết:{' '}
            <strong>http://vietnamese-text-classifier.com/api/predict</strong>
          </p>
          <p>Nội dung yêu cầu (JSON):</p>
          <pre>
            &#123; "document": &lt;Nội dung của văn bản&gt;, "api_key": &lt;API
            key của người dùng&gt; &#125;
          </pre>

          <p>Kết quả trả về khi thành công (JSON):</p>
          <pre>
            [200] &#123; "status": "SUCCESS", "message": "Dự đoán chủ đề của văn
            bản thành công!", "data": &#123; "predicting_category": &lt;Chủ đề
            của văn bản&gt; &#125; &#125;
          </pre>

          <p>Kết quả trả về khi thất bại (JSON):</p>
          <pre>
            [500] &#123; "status": "ERROR", "message": "Dự đoán chủ đề của văn
            bản thất bại!" &#125;
          </pre>
        </div>

        {/* <h3>Phân loại nhiều văn bản</h3>
        <p>Phân loại nhiều văn bản là chức năng giúp phân loại chủ đề của nhiều văn bản cùng một lúc. Để phân loại một số văn bản nào đó, chúng ta tiến hành gửi một yêu cầu HTTP như sau:</p>
        <div className='code-block'>
            <p>Phương thức: <strong>POST</strong></p>
            <p>Liên kết: <strong>http://vietnamese-text-classifier.com/api/prediction/multiple</strong></p>
            <p>Nội dung yêu cầu (JSON):</p>
            <pre>
                &#123;
                    "document": ["Nội dung văn bản 1", "Nội dung văn bản 2",...],
                    "api_key": "API key của người dùng"
                &#125;
            </pre>

            <p>Kết quả trả về (JSON):</p>
            <pre>
                [200] &#123;
                    "status": "SUCCESS",
                    "message": "Predict the category of the documents successfully!",
                    "data": &#123;
                        "predicting_category": ["Chủ đề văn bản 1", "Chủ đề văn bản 2",...]
                    &#125;
                &#125;
            </pre>

            <p>Kết quả trả về khi thất bại (JSON):</p>
            <pre>
                [500] &#123;
                    "status": "ERROR",
                    "message": "Fail to predict the category of the documents!"
                &#125;
            </pre>
        </div> */}
      </div>
    </Layout>
  );
}

export default Documentation;
