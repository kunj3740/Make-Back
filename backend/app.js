const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes')
const projectRoutes = require("./routes/projectRoutes");
const diagramRoutes = require("./routes/diagramRoutes");
// const AIRoutes = require("./routes/AIRoutes");
const folderRoutes = require("./routes/folderRoutes");
const CompoGenRoutes = require("./routes/CompoGenRoutes");
const CodeRoutes = require("./routes/CodeRoutes")

dotenv.config()

const app = express()
const PORT = 8000

app.use(cors())
app.use(express.json())

app.use('/api/v1/user', authRoutes)
app.use('/api/v1/projects', projectRoutes)
app.use('/api/v1/diagrams' , diagramRoutes)
app.use('/api/v1/folders' , folderRoutes)
// app.use('/api/ai', AIRoutes);
app.use('/api/v1/components' , CompoGenRoutes)
app.use('/api/v1/code' , CodeRoutes)

app.get("/api/v1/temp" , async (req , res ) => {
  return res.json({
    message : "hello from testing api"  
  })
})
// MongoDB connection
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB')
  app.listen(PORT, () => console.log(`Server running on Port ${PORT}`))

})
.catch((err) => {
  console.error('MongoDB connection error:', err.message)
})
