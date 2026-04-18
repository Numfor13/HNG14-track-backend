const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

mongoose.connect('YOUR_MONGO_URI_HERE')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const Profile = require('./models/Profile');
const { v4: uuidv4 } = require('uuid');

app.post('/api/profiles', async (req, res) => {
  try {
    const { name } = req.body;

 
    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Missing name"
      });
    }

    if (typeof name !== 'string') {
      return res.status(422).json({
        status: "error",
        message: "Invalid type"
      });
    }

  
    const existing = await Profile.findOne({ name: name.toLowerCase() });

    if (existing) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: existing
      });
    }

  
    const genderRes = await fetch(`https://api.genderize.io?name=${name}`);
    const genderData = await genderRes.json();

    const ageRes = await fetch(`https://api.agify.io?name=${name}`);
    const ageData = await ageRes.json();

    const countryRes = await fetch(`https://api.nationalize.io?name=${name}`);
    const countryData = await countryRes.json();

   
    if (!genderData.gender || genderData.count === 0) {
      return res.status(502).json({
        status: "error",
        message: "Genderize returned an invalid response"
      });
    }

    if (!ageData.age) {
      return res.status(502).json({
        status: "error",
        message: "Agify returned an invalid response"
      });
    }

    if (!countryData.country || countryData.country.length === 0) {
      return res.status(502).json({
        status: "error",
        message: "Nationalize returned an invalid response"
      });
    }

 
    let age_group = "";
    const age = ageData.age;

    if (age <= 12) age_group = "child";
    else if (age <= 19) age_group = "teenager";
    else if (age <= 59) age_group = "adult";
    else age_group = "senior";

  
    const topCountry = countryData.country.reduce((max, curr) =>
      curr.probability > max.probability ? curr : max
    );

    
    const profile = new Profile({
      id: uuidv4(),
      name: name.toLowerCase(),
      gender: genderData.gender,
      gender_probability: genderData.probability,
      sample_size: genderData.count,
      age,
      age_group,
      country_id: topCountry.country_id,
      country_probability: topCountry.probability,
      created_at: new Date().toISOString()
    });

    await profile.save();

    return res.status(201).json({
      status: "success",
      data: profile
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Upstream or server failure"
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});