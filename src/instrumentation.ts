import {NodeSDK} from "@opentelemetry/sdk-node";
import {ConsoleSpanExporter} from "@opentelemetry/sdk-trace-node";
import {getNodeAutoInstrumentations} from "@opentelemetry/auto-instrumentations-node";
import {PrometheusExporter} from "@opentelemetry/exporter-prometheus";
import {trace} from "@opentelemetry/api";

const sdk = new NodeSDK({
    traceExporter: new ConsoleSpanExporter(),
    metricReader: new PrometheusExporter({
        port: 9464
    }),
    instrumentations: [getNodeAutoInstrumentations()]
})

sdk.start()

const tracer = trace.getTracer('umurava-app')
export {tracer}