const express = require("express");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const dotenv = require("dotenv");

const app = express();

app.use(express.json());
dotenv.config();

const PORT = Number(process.env.PORT) || 6000;
const CONTAINER_2_ENDPOINT = process.env.CONTAINER_2_ENDPOINT || "http://container2-service:2000/parser";
const FILE_DIRECTORY = process.env.FILE_DIRECTORY || "../";


const parseFile = async (file, product) => {
  try {
    const data = await axios.post(CONTAINER_2_ENDPOINT, {
      file,
      product,
    });
    return data.data;
  } catch (err) {
    throw err;
  }
};

app.post("/calculate", async (req, res) => {
  const { file, product } = req.body;

  if (!file) {
    return res.status(400).send({
      file: null,
      error: "Invalid JSON input.",
    });
  } else if (!fs.existsSync(path.join(FILE_DIRECTORY, file))) {
    return res.status(404).send({
      file,
      error: "File not found.",
    });
  } else {
    try {
      const data = await parseFile(file, product);
      res.send(data);
    } catch (err) {
      console.log("calc"+err)
      res.status(500).send({ error: "Error parsing file." });
    }
  }
});

app.post("/store-file", async (req, res) => {

    const { file, data } = req.body;
    let newdata = data?.replaceAll(" ", "") || data;

    if (!file) {
        return res.status(400).send({
            file: null,
            error: "Invalid JSON input."
        })
    }

    const pathToCreateFile = path.join(FILE_DIRECTORY, file);

    fs.writeFile(pathToCreateFile, newdata, 'utf-8', (error) => {
        console.log(newdata)
        if (error) {
            return res.status(500).send({
                file,
                error: "Error while storing the file to the storage."
            })
        } else {
            return res.status(200).send({
                file,
                message: "Success."
            })
        }
    }
    )


})

app.listen(PORT, () => console.log(`Listening at port number ${PORT}...!`));
