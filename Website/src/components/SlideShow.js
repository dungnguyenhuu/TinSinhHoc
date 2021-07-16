import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';

class SlideShow extends Component {
  render() {
    const images= [
      {id: 1, url: "./images/ai1.png"},
      {id: 2, url: "./images/ai6.jpg"},
      {id: 3, url: "./images/ai2.jpg"},
      {id: 4, url: "./images/ai1.jpg"},
      {id: 5, url: "./images/ai1.jpg"},
    ];
   
    let addClass = true;
    let classAnim = "animated infinite fadeInDown";
    const onChange = (value) => {
      addClass = !addClass;
      if(addClass){
        classAnim = "animated infinite fadeInDown";
      } else {
        classAnim = "animated infinite fadeInUp";
      }
      // console.log(addClass);
      // setTimeout(() => {
      //   this.isAnimated = false;
      //   console.log(this.isAnimated);
      // }, 1500);
      
    };

    return (
      <section className="jumbotron">
        <div className="jumbotron__content">
          <div className={classAnim }>
            <h2>Nhập môn học máy và khai phá dữ liệu </h2>
            <h2>Nhóm 17</h2>
          </div>
          <div className="animated infinite fadeInUp">
            <p className="jumbotron__lead">
              Phân loại nội dung trang web trực tuyến
            </p>
          </div>
          {/* <div className="animated infinite fadeInUp">
            <p className="jumbotron__description">
              Phân loại văn bản là việc sắp xếp các văn bản vào các danh mục tương
              ứng với chúng như thể thao, giải trí, xã hội,... như các trang báo
              điện tử thường làm. Việc này có thể được thực hiện thủ công bởi các
              biên tập viên tuy nhiên đòi hỏi phải tiêu tốn nhiều thời gian và
              công sức. <strong>TextClassifier</strong> là giải pháp
              giúp tự động phân loại văn bản tiếng Việt một cách nhanh chóng và
              hiệu quả.
            </p>
          </div> */}
          <div className="animated infinite zoomIn">
            <Link to="/gioi-thieu" className="button button-outlined">
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
        
        <div className="slieShow">
          <Carousel 
            autoPlay={true}
            interval='5000'
            infiniteLoop={true}   
            showThumbs={false} 
            showArrows={true}  
            onChange={onChange}    
          >
            {images.map(img => 
              <div className="slideShow-wrap" key={img.id}>
                <img src={img.url} />
              </div>
            )}

          </Carousel>
        </div>
      </section>
    );
  }
}

export default SlideShow;
