import axios from "axios"

const apiRequest = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL
}
)
export default apiRequest