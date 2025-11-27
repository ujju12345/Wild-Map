const express = require("express")
const mongoose = require("mongoose")
const cors = require('cors')
const dotenv = require("dotenv")
const pinRoute = require("./routes/pins")
const userRoute = require("./routes/users")

// Create express app
const app = express()

// dotenv config
dotenv.config()

// Enable CORS
app.use(cors({ origin: process.env.CLIENT_URL}))

// Parse JSON bodies
app.use(express.json())

//initialize the port-Enter a port
const port = process.env.PORT

/*db connection
MONGO_URL - Enter the DB url '*/
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB connected!"))
.catch(err => {
    console.error("MongoDB connection error:", err)
    // Terminate the application if unable to connect MongoDB
    process.exit(1)
  })

  
    app.use("/api/pins", pinRoute)
    app.use("/api/user", userRoute)

app.listen(port,()=>{
    console.log("Backend is Running")
})