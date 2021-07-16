from pyvi import ViTokenizer
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer

import gensim
import pickle

tfidf_vect = pickle.load(open('data/tfidf_vect.pkl', 'rb'))
svd = pickle.load(open('data/svd.pkl', 'rb'))
model = pickle.load(open('data/trained_model.pkl', 'rb'))


def preprocess(doc):
    lines = gensim.utils.simple_preprocess(doc)
    lines = ' '.join(lines)
    lines = ViTokenizer.tokenize(lines)

    return lines


def normalize_result(raw_result):
    raw_results = ["Cong nghe", "Chinh tri Xa hoi", "Doi song", "Giai tri", "Giao duc",
                   "Khoa hoc", "Kinh doanh", "Phap luat", "Suc khoe", "The gioi", "The thao", "Van hoa", "Xe"]
    final_results = ["Công nghệ", "Chính trị - Xã hội", "Đời sống", "Giải trí", "Giáo dục",
                     "Khoa học", "Kinh doanh", "Pháp luật", "Sức khỏe", "Thế giới", "Thể thao", "Văn hóa", "Xe"]

    index = [i for i, s in enumerate(raw_results) if raw_result in s][0]

    return final_results[index]


def predict_category(doc_to_predict):
    doc = preprocess(doc_to_predict)
    doc_tfidf = tfidf_vect.transform([doc])
    doc_svd = svd.transform(doc_tfidf)
    raw_result = model.predict(doc_tfidf)[0]
    final_result = normalize_result(raw_result)

    return final_result
