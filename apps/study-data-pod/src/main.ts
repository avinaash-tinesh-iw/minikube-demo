/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import axios from "axios";
import express from "express";
import * as path from "path";

const app = express();

app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.json()) // enables parsing of json request bodies

const podName = 'study-data-pod';
const metricsPodUrl = process.env.METRICS_POD_ENDPOINT || 'http://metrics-data-pod.default.svc.cluster.local:8080'
let data = {};

app.get("/api", (req, res) => {
  res.send({ message: "Welcome to study-data-pod!" });
});

app.get('/data', (req, res) => {
  res.send({ podName, data });
});

app.post('/update', (req, res) => {
  data = req.body
  res.send({podName,message: "Data updated", data });
});

const updateMetrics = async (newData) => {
  await axios.post(`${metricsPodUrl}/update`, newData)
}

app.post('/updateMetrics', async (req, res) => {
  try {
    const response = await updateMetrics(req.body)

    res.send({message: 'Updated metrics data', response})
  } catch (error) {
    res.send({message: "Failed to update metrics data", error})
  }
})

const port = process.env.PORT || 8081;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);
