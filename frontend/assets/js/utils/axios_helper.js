export function axiosWrapper(
  method,
  url,
  data = null,
  callback,
  errors = () => {},
) {
  axios.defaults.baseURL = "http://localhost:5000/api";
  axios.defaults.withCredentials = true
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response? error.response.status : null;
      console.log("status: ", status);
      return Promise.reject(error);
    }
  );

  axios({
    method: `${method}`,
    url: `${url}`,
    data,
    withCredentials: true
  })
    .then((res) => {
      console.log("axios res: ", res);
      callback(res);
    })
    .catch((e) => {
      console.error("axios err: ", e);
      errors(e);
    });
}