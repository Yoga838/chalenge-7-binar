const { ProfilingIntegration } = require('@sentry/profiling-node');
const morgan = require('morgan')
const express = require('express'),
    cors = require('cors')
    app = express(),
    PORT = process.env.PORT || 3000,
    router = require('./routers'),
    bodyParser  = require('body-parser');
    sentry = require('@sentry/node')

    require('dotenv').config()

sentry.init({
    dsn: 'https://cfce2c47cd973e837406ffc5b932896c@o4506178951774208.ingest.sentry.io/4506178955051009',
    integrations: [
        new sentry.Integrations.Http({ tracing: true }),
        new sentry.Integrations.Express({ app }),
        new ProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
})

app.use(sentry.Handlers.requestHandler());

app.use(sentry.Handlers.tracingHandler());


app.set('views', './views');
app.set('view engine', 'ejs');
app.use(cors());
app.use(bodyParser.urlencoded({extended:true})); 
app.use(morgan('combined'))
app.use(router);

app.listen(PORT, () => console.log(`App is running at PORT ${PORT}`))