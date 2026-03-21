const mongoose = require('mongoose');
const CompanyQuestion = require('./src/models/CompanyQuestion');
const fs = require('fs');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const topics = await CompanyQuestion.aggregate([
    {
      $group: {
        _id: { company: "$company", section: "$section", topic: "$topic" },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.company": 1, "_id.section": 1, "_id.topic": 1 } }
  ]);
  fs.writeFileSync('topics_out_all.json', JSON.stringify(topics, null, 2), 'utf8');
  console.log('done');
  process.exit(0);
}

run().catch(err => {
  fs.writeFileSync('error_out.txt', String(err), 'utf8');
  process.exit(1);
});
