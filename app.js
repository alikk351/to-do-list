const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://admin-ali:test123@cluster0.8uyec.mongodb.net/todolistcloneDB", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

///////////////////


// items schma
const itemsSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item", itemsSchema);

const item_1 = new Item({
    name: "Eat",
});
const item_2 = new Item({
    name: "Sleep",
});
const item_3 = new Item({
    name: "Code",
});
const item_4 = new Item({
    name: "Repeat",
});

const default_items = [item_1, item_2, item_3, item_4];
/////

// lists schema
const listSchema = new mongoose.Schema({
    name: String,
    items_in_list: [itemsSchema]
});
const List = mongoose.model("List", listSchema);
/////

let day = date.getDate();

app.get("/", function (req, res) {
    Item.find({}, function (err, found_list) {
        if (found_list.length === 0) {
            Item.insertMany(default_items, function (er) {
                if (er) {
                    console.log(er);
                }
                else {
                    console.log("Inserted default items !");
                }
            });
            res.redirect("/");
        }
        else {
            res.render("list", {
                date: day,
                ListTitle: "Main List",
                items: found_list
            });
        }
    });
});

app.get("/:input_list", function (req, res) {
    const custom_list = _.capitalize(req.params.input_list);

    List.findOne({ name: custom_list }, function (err, found_list) { //found_list will be an object
        if (!err) {
            if (!found_list) {
                const new_list = new List({
                    name: custom_list,
                    items_in_list: default_items
                });
                new_list.save();
                res.redirect("/" + custom_list);
            }
            else {
                res.render("list", {
                    date: day,
                    ListTitle: found_list.name,
                    items: found_list.items_in_list
                });
            }
        }
    });
});

app.post("/", function (req, res) {
    var new_item_name = req.body.listItem;
    const list_name = req.body.list_name;

    if (new_item_name.length > 20) {   // truncate a string to fit in the box
        new_item_name = new_item_name.substring(0, 21);
    }

    const new_item = new Item({
        name: new_item_name
    });

    if (list_name === "Main List") {
        new_item.save();
        res.redirect("/");
    }
    else {
        List.findOne({ name: list_name }, function (err, found_list) {
            if (!err) {
                found_list.items_in_list.push(new_item);
                found_list.save();
                res.redirect("/" + list_name);
            }
        });
    }
});

app.post("/delete", function (req, res) {
    const to_delete_item_id = req.body.item_id;
    const list_to_delete_from = req.body.list_title;

    if (list_to_delete_from === "Main List") {
        Item.findByIdAndRemove(to_delete_item_id, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Item deleted !");
                res.redirect("/");
            }
        });
    }
    else {
        List.findOneAndUpdate({ name: list_to_delete_from }, { $pull: { items_in_list: { _id: to_delete_item_id } } }, function (err, found_list) {
            if (!err) {
                console.log("item deleted");
                res.redirect("/" + list_to_delete_from);
            }
        });
    }
});

////////////////

app.listen(3000, function () {
    console.log("Server running on port 3000 !");
});
