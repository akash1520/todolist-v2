//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/todolistDB")

const itemsSchema = new mongoose.Schema({
  name: String,
})

const Item = mongoose.model("Item", itemsSchema);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const def1 = new Item({
  name: "Welcome to the todolist!"
})
const def2 = new Item({
  name: "Hit + button to add an item."
})
const def3 = new Item({
  name: "Hit <-- to cross the item."
})

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema)

const defaultItems = [def1, def2, def3];

app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {
    if (err) console.log(err)
    else {
      if (foundItems.length == 0) {
        Item.insertMany(defaultItems)
        res.redirect("/")
      } else res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  })

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem

  const listName= req.body.list;

  if(listName === "Today"){
    new Item({
      name: item
    }).save()
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(itemName);
      foundList.save();
      res.redirect("/"+listName)
    })
  }

  

  // if (req.body.list === "Work") {

  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function (req, res) {
  Item.findByIdAndRemove(req.body.checkbox, function (err) {
    if (!err) console.log("successfully deleted");
  })
  res.redirect("/")
});

app.get("/:customList", function (req, res) {
  const customListName = req.params.customList;

  List.findOne({
    name: customListName
  }, function (err, foundList) {
    if (!err) {
      if (!foundList) { //create new list
        const ls = new List({
          name: customListName,
          items: defaultItems
        })
        ls.save()
        res.redirect("/" + customListName)
      } else { //show existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  })
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});