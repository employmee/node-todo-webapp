const express = require('express')
require('./db/mongoose')
const Router = require('./routers/task')

const app = express()
const port = 3000

app.use(express.json())
app.use(Router)

module.exports = app
