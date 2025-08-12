import axios from "axios";

const axiosInstance = axios.create({
  headers: {
    "x-from-gateway": "true",
  },
});

// Request interceptor to merge custom headers on every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Merge default header with any headers set in config.headers
    config.headers = {
      ...config.headers,
      "x-from-gateway": "true",
    };
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
