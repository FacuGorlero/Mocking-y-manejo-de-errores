const express = require('express')
const {configObject} = require('./config/index.js')
const session = require('express-session')
const mongoStore = require('connect-mongo')
const passport = require('passport')
const { initializePassport } = require('./config/passport.config.js')
const appRouter = require('./routes/index.js')
const cookie = require('cookie-parser')
const configureSocketIO = require('./helper/socketio.js')
const handlebars = require('express-handlebars')
const handlebarsHelpers = require('handlebars-helpers')()
const eq = handlebarsHelpers.eq

const PORT = process.env.PORT
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname+'/public'))
app.use(cookie())
app.use(session({
  store: mongoStore.create({
    mongoUrl: process.env.MONGO_URI, 
    mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    ttl: 15000000000,
  }),
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))
app.use(appRouter)

/* app.use(session({
  secret: 'secret'
})) */

initializePassport()
app.use(passport.initialize())
//app.use(passport.session())

/* The code `app.engine('handlebars', handlebars.engine())` sets the template engine for the
application to Handlebars. It tells Express to use Handlebars as the view engine. */
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  helpers: {
    eq: eq
  }
}))
app.set('view engine', 'hbs')
app.set('views', __dirname + '/views')

//connection to data base
configObject.connectDB()

const serverHttp = app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})

const io = configureSocketIO(serverHttp)

module.exports = { app, io }