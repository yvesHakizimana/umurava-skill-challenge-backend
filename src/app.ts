import express from "express";
import {connect, set} from "mongoose"
import {CREDENTIALS, LOG_FORMAT, NODE_ENV, ORIGIN} from "@config";
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

export default class App {
    public app: express.Application
    public env: string
    public port: number | string

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


    /*
    * todo::
    *  1. Swagger configuration.
    *   2. Prometheus and Grafana configuration
    *   3. Testing
    *   4. Asking the questions
    *   5. Revising about PM2 and why I need it
    *   6. This will continue to go until sports
    *   7. In the evening I will revise the mukama's File>> Machine Learning.
    *
    * */


    public listen() {
        this.app.listen(this.port, () => {
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
                    title: "REST API Documentation",
                    version: "1.0.0",
                    description: "Umurava Skill Challenge Documentation"
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
    }

}