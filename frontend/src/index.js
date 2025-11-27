import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthContextProvider } from "./context/AuthContext.jsx"
import { LocationContextProvider } from './context/LocationContext.jsx'


const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <LocationContextProvider>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </LocationContextProvider>
  </React.StrictMode>
)


