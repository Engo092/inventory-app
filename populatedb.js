#! /usr/bin/env node
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Category = require("./models/category");
  const Item = require("./models/item");
  
  const categories = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false); // Prepare for Mongoose 7
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createCategories();
    await createItems();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  async function categoryCreate(index, title, description) {
    const category = new Category({ title: title, description: description });
    await category.save();
    categories[index] = category;
    console.log(`Added category: ${title}`);
  }
  
  async function itemCreate(name, description, category, price, number_in_stock) {
    const itemdetail = {
      name: name,
      description: description,
      price: price,
      number_in_stock: number_in_stock,
    };
    if (category != false) itemdetail.category = category;
  
    const item = new Item(itemdetail);
    await item.save();
    console.log(`Added item: ${name}`);
  }
  
  async function createCategories() {
    console.log("Adding Categories");
    await Promise.all([
      categoryCreate(0, "Guitar", "One of the most iconic instruments, includes both acoustic and electric guitars."),
      categoryCreate(1, "Bass", "A vital instrument to any song, the bass complements and builds the base of entire genres."),
      categoryCreate(2, "Drums", "Impossible to play without it, the drums lay the tempo and rythm, available at a variety of prices and types."),
      categoryCreate(3, "Piano", "One of the most classical and widely used instruments in the world, great for all kinds of players and genres."),
    ]);
  }

  async function createItems() {
    console.log("Adding Items");
    await Promise.all([
      itemCreate(
        "Fender Stratocaster",
        "One of the most iconic guitar models, the Fender Stratocaster is perfect for most types of genres. Ranging from jazz to hard rock, everyone loves the Stratocaster.",
        [categories[0]],
        849.99,
        10,
      ),
      itemCreate(
        "Fender Jazz Bass",
        "One of the most widely used and traditional basses, the Fender Jazz Bass has a perfect feel and groove to every type of genre, as well as being affordable for beginners.",
        [categories[1]],
        849.99,
        13,
      ),
      itemCreate(
        "Pearl Export EXX 20",
        "One of the most recognizable drum brands ever, this drum kit serves as a great kit for professionals and beginners alike, providing all kinds of different sounds and feel.",
        [categories[2]],
        950,
        5,
      ),
      itemCreate(
        "Yamaha YDP S35 Digital Piano",
        "One of the most famous brands for musical instruments, this Yamaha piano provides incredible touch and response, as well as cristal-clear sounds.",
        [categories[3]],
        900,
        8,
      ),
      itemCreate(
        'Gretsch Catalina Maple 22" 5pc Shell Pack',
        "One of the most reliable brands in the industry, this Gretsch drumkit is very reliable, with vintage and high quality tonal characteristics. Perfect for professional drummers.",
        [categories[2]],
        900,
        3,
      ),
      itemCreate(
        "Martin D-28 Standard Dreadnought",
        "Made by one of the most recognizable acoustic guitar brands, the Martin D-28 Standard Dreadnought is one of the best acoustics in the industry, with a rich sound and amazing feel.",
        [categories[0]],
        3200,
        1,
      ),
      itemCreate(
        "Ibanez RG450DX",
        "Possibly the most popular brand for shredding, Ibanez provides another perfect guitar for metal enthusiasts! Affordable, with a clean and slick neck, and floyd-rose bridge, what's not to love?",
        [categories[0]],
        449.99,
        20,
      ),
      itemCreate(
        "Jackson JS Series Concert Bass JS3",
        "By one of the most popular brands for metal enthusiasts, this bass provides a rich and heavy sound with its active pickups and ergonomic design, all at a affordable price.",
        [categories[1]],
        349.99,
        17,
      ),
    ]);
  }