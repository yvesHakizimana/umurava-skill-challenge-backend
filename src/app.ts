import express from "express";
import {connect, set} from "mongoose"
import {CREDENTIALS, LOG_FORMAT, NODE_ENV, ORIGIN, PORT} from "@config";
import {logger, stream} from "@utils/logger";
import morgan from "morgan";
import cors from "cors";
import hpp from "hpp";
import helmet from "helmet";
import compression from "compression";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express"
import errorMiddleware from "@middlewares/error-middleware";
import {mongoDbConnection} from "@databases";
import {IRouter} from "@routes/router-interface";
import {initializeStatsScheduler} from "@utils/stats-computation-scheduler";
require('../instrumentation')

export default class App {
    public app: express.Application
    public env: string
    public port: number | string = PORT

    constructor(routes: IRouter[]) {
        this.app = express()
        this.env = NODE_ENV || 'development'
        this.port = process.env.PORT || 3000

        this.connectToDatabase()
            .then(() => {
            logger.info(`Connected to the database successfully.`);
        })
            .catch((err: Error) => {logger.error(`Error: ${err.message}`);})
        this.initializeMiddlewares()
        this.initializeRoutes(routes)
        this.initializeSwagger()
        this.initializeErrorHandling()

    }

    public listen() {
        this.app.listen(this.port, async () => {
            logger.info("Starting the Statistics scheduler.------")
            await initializeStatsScheduler()
            logger.info(`========================================`);
            logger.info(`=====------- ENV: ${this.env} -----=====`);
            logger.info(`🚀 App listening on the port ${this.port}`);
            logger.info(`----------------------------------------`);
        })
    }

    private initializeMiddlewares(){
        this.app.use(morgan(LOG_FORMAT, {stream}));
        this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
        this.app.use(hpp())
        this.app.use(helmet())
        this.app.use(compression())
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))

    }

    private initializeSwagger(){
        const options = {
            swaggerDefinition: {
                openapi: "3.0.0",
                info: {
                    title: "Umurava Skill Challenge API",
                    version: "1.0.0",
                    description: "" +
                        "Comprehensive Documentation for the Umurava Skill Challenge API," +
                        "detailing available endpoints" +
                        "request/response formats," +
                        "and authentication requirements."
                },
            },
            apis: ['swagger.yaml']
        }

        const specs = swaggerJSDoc(options)
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
    }

    private initializeErrorHandling(){
        this.app.use(errorMiddleware)
    }

    private async connectToDatabase(){
        if(this.env !== "production"){
            set('debug', true)
        }
        await connect(mongoDbConnection.url);
    }

    private initializeRoutes(routes: IRouter[]){
        routes.forEach(route => {
            this.app.use('/api/v1', route.router)
        })
        this.app.get('/', (req, res) => {
            res.status(200).send('App is running successfully');
        })
    }

}