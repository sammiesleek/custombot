const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./model/userModel");
const Group = require("./model/groupModel");
const connectDB = require("./db");
dotenv.config();

// Data to seed
const users = [];

const groups = [
  {
    id: -1002330044545586,
    title: "Cpppp",
    username: "coinstersdsdsed",
    settings: {
      lang: "english",
    },
    blocklist: ["fake", "rug"],
    filters: [],
  },
];

// Function to seed the data
// const seedDatabase = async () => {
//   await connectDB(); // Ensure the DB is connected

//   try {
//     // Clear existing data
//     await User.deleteMany({});
//     await Group.deleteMany({});

//     // Insert new data
//     await User.insertMany(users);
//     await Group.insertMany(groups);

//     console.log("Data successfully seeded");
//     process.exit();
//   } catch (error) {
//     console.error("Error seeding data:", error);
//     process.exit(1); // Exit the process on failure
//   }
// };

// Run the seeding function
// seedDatabase();
