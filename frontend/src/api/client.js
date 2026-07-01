import axios from "axios";

const client = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Greška:", error);

    if (error.response?.status === 401) {
      console.log("Neautorizovan korisnik.");
    }

    return Promise.reject(error);
  }
);

export default client;