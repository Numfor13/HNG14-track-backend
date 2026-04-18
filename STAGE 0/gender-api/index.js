const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());

const PORT = 3000;

app.get('/api/classify', async (req, res) => {
  try{
    const { name } = req.query;

    if (!name){
      return res.status(400).json({
        status: "error",
        message: "Missing name parameter"
      });
    }

    if (typeof name !== 'string'){
      return res.status(422).json({
        status: "error",
        message: "name must be a string"
      });
    }

    const response = await axios.get(`https://api.genderize.io?name=${name}`);
    const data = response.data;

    const {gender, probability, count } = data;

    if (!gender || count === 0) {
      return res.status(422).json({
        status: "error",
        message: "No prediction available for the provided name"
      });
    }

    const sample_size = count;

    const is_confident = (probability >= 0.7 && sample_size >= 100);

    const processed_at = new Date().toISOString();

    return res.status(200).json({
      status: "success",
      data: {
        name,
        gender,
        probability,
        sample_size,
        is_confident,
        processed_at
      }
    });

  } catch(error){
     console.log("FULL ERROR:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Upstream or server failure"
    });
  }
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});