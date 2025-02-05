import {NodeSDK} from "@opentelemetry/sdk-node";
import {getNodeAutoInstrumentations} from "@opentelemetry/auto-instrumentations-node";
import {Resource} from "@opentelemetry/resources";
import {ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION} from "@opentelemetry/semantic-conventions";
import {OTLPTraceExporter} from "@opentelemetry/exporter-trace-otlp-grpc";
import {PeriodicExportingMetricReader} from "@opentelemetry/sdk-metrics";
import {OTLPMetricExporter} from "@opentelemetry/exporter-metrics-otlp-grpc";
import {SimpleLogRecordProcessor} from "@opentelemetry/sdk-logs";
import {OTLPLogExporter} from "@opentelemetry/exporter-logs-otlp-grpc";

const sdk = new NodeSDK({
    resource: new Resource({
        [ATTR_SERVICE_NAME]: "umurava-backend",
        [ATTR_SERVICE_VERSION]: "1.0",
    }),
    traceExporter: new OTLPTraceExporter({
        url: "http://otel-collector:4317",
    }),
    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter()
    }),
    logRecordProcessors: [new SimpleLogRecordProcessor(new OTLPLogExporter())],
    instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();