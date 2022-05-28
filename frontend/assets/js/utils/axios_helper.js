import { current_user } from "../user/user_profile.js";


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
      if (status === 401) {
        const user = current_user();
        if (user) {
          alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
          localStorage.removeItem("user");
          location.replace("/login");
        }
      }
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