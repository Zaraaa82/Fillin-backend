require("dotenv").config();
const mongoose = require("mongoose");
const connectToDB = require("../config/db");
const Skill = require("../models/Skill");

const skillNames = [
  "barista",
  "cashier",
  "catering",
  "childcare",
  "cleaning",
  "cooking",
  "customer service",
  "data entry",
  "delivery driving",
  "dishwashing",
  "event setup",
  "forklift operation",
  "housekeeping",
  "landscaping",
  "moving and labor",
  "retail sales",
  "security",
  "serving",
  "warehouse",
];

async function seedSkills() {
  await connectToDB();

  for (const name of skillNames) {
    await Skill.findOneAndUpdate(
      { name },
      { name },
      { upsert: true, new: true },
    );
  }

  console.log(`Seeded ${skillNames.length} skills.`);
  await mongoose.disconnect();
}

seedSkills();
