/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import axios from "axios";
import express, { response } from "express";
import * as path from "path";

const app = express();

app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.json()) // enables parsing of json request bodies

const podName = 'metrics-data-pod';
const studyPodUrl = process.env.STUDY_POD_ENDPOINT || 'http://study-data-pod.default.svc.cluster.local:8081'
let data = {};

app.get("/api", (req, res) => {
  res.send({ message: "Welcome to metrics-data-pod!" });
});

app.get('/data', (req, res) => {
  res.send({ podName, data });
});

app.post('/update', (req, res) => {
  data = req.body
  res.send({podName,message: "Data updated", data });
});

const updateStudy = async (newData) => {
  await axios.post(`${studyPodUrl}/update`, newData)
}

app.post('/updateStudy', async (req, res) => {
  try {
    const response = await updateStudy(req.body)

    res.send({message: 'Updated study data', response})
  } catch (error) {
    res.send({message: "Failed to update study data", error})
  }
})

app.get("/health", (req, res) => {
  res.status(200).send();
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);
