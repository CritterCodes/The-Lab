const { MongoClient } = require('mongodb');

const uri = "mongodb://critter:Zapatas2024@23.94.251.158:27017/?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin&appName=mongosh+2.3.3";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("FabLab-Local");
    const usersCollection = db.collection("users");

    // 1. Check a user who should be on the leaderboard
    // I'll just dump all users with volunteer logs to see their structure
    const usersWithLogs = await usersCollection.find({ "membership.volunteerLog": { $exists: true, $not: { $size: 0 } } }).toArray();
    console.log(`Found ${usersWithLogs.length} users with volunteer logs.`);
    
    usersWithLogs.forEach(u => {
        console.log(`User: ${u.firstName} ${u.lastName} (${u.userID})`);
        console.log("Logs:", JSON.stringify(u.membership.volunteerLog, null, 2));
    });

    console.log("\n--- Running Aggregation ---");

    const pipeline = [
        { $unwind: "$membership.volunteerLog" },
        { 
            $match: { 
                $or: [
                    { "membership.volunteerLog.status": "approved" },
                    { "membership.volunteerLog.status": { $exists: false } },
                    { "membership.volunteerLog.status": null }
                ]
            } 
        },
        {
            $group: {
                _id: "$userID",
                firstName: { $first: "$firstName" },
                lastName: { $first: "$lastName" },
                totalHours: { $sum: { $toDouble: "$membership.volunteerLog.hours" } }
            }
        },
        { $sort: { totalHours: -1 } },
        { $limit: 10 }
    ];

    const results = await usersCollection.aggregate(pipeline).toArray();
    console.log("Aggregation Results:", JSON.stringify(results, null, 2));

  } finally {
    await client.close();
  }
}

run().catch(console.dir);
