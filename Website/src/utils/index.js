import axios from 'axios';
import moment from 'moment';

export const isEmptyObj = (obj) => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};

export const apiGet = (url, data) => axios.get(url, { params: data });

export const apiPost = (url, data) => axios.post(url, data);

export const apiPut = (url, data) => axios.put(url, data);

export const apiDelete = (url) => axios.delete(url);

export const isValidEmail = (email) => {
  let pattern = new RegExp(
    /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
  );
  return pattern.test(email);
};

export const formatDateString = (str) => {
  const date = new Date(str).toUTCString();

  return moment(date).utc().format('DD-MM-YYYY, HH:mm:ss');
};
