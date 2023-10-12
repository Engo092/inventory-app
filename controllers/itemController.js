const Item = require('../models/item');
const Category = require('../models/category');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const secretPassword = ['verySecretPassword']


exports.index = asyncHandler(async (req, res, next) => {
    const [numItems, numCategories] = await Promise.all([
        Item.countDocuments().exec(),
        Category.countDocuments().exec(),
    ]);

    res.render("index", { title: "Music Store Inventory", num_items: numItems, num_categories: numCategories });
});

exports.item_list = asyncHandler(async (req, res, next) => {
    const allItems = await Item.find({}, "name price number_in_stock").sort({ name: 1 }).exec();

    res.render("item_list", { title: "Music Store Items", all_items: allItems });
});

exports.item_detail = asyncHandler(async (req, res, next) => {
    const item = await Item.findById(req.params.id).populate("category").exec();

    res.render("item_detail", { title: "Instrument Detail", item: item });
});

exports.item_create_get = asyncHandler(async (req, res, next) => {
    const allCategories = await Category.find().sort({ title: 1 }).exec();

    res.render("item_form", { title: "Create Item", all_categories: allCategories });
});

exports.item_create_post = [
    // Converts the category to an Array
    (req, res, next) => {
        if (!(req.body.category instanceof Array)) {
            if (typeof req.body.category === "undefined") req.body.category = [];
            else req.body.category = [req.body.category];
        }
        next();
    },

    // Validate and sanitize fields
    body("name", "name must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "description must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("category.*").escape(),
    body("price", "please enter a non-negative price value")
        .trim()
        .isCurrency({ allow_negatives: false })
        .escape(),
    body("number_in_stock", "number in stock must be a positive integer below 500")
        .trim()
        .isInt({ min: 0, max: 500 })
        .escape(),
    body("password", "incorrect password").isIn(secretPassword),

    // Process request after validation and sanitization
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request
        const errors = validationResult(req);
        
        // Create Item object with escaped and trimmed data
        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            number_in_stock: req.body.number_in_stock,
        });

        if(!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages

            const allCategories = await Category.find().exec();

            // Mark our selected categories as checked
            for (const category of allCategories) {
                if (item.category.includes(category._id)) {
                    category.checked = 'true';
                }
            }

            res.render("item_form", { title: "Create Item", item: item, all_categories: allCategories, errors: errors.array() });
            return;
        } else {
            // Data from form is valid. Save item
            await item.save();
            res.redirect(item.url);
        }
    })
];

exports.item_update_get = asyncHandler(async (req, res, next) => {
    const [item, allCategories] = await Promise.all([
        Item.findById(req.params.id).populate("category").exec(),
        Category.find().exec(),
    ]);

    if (item === null) {
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
    }

    // Marks the category as selected
    for (const category of allCategories) {
        for (const item_category of item.category) {
            if (category._id.toString() === item_category._id.toString()) {
                category.checked = "true";
            }
        }
    }

    res.render("item_form", { title: "Update Item", item: item, all_categories: allCategories });
});

exports.item_update_post = [
    // Converts the category to an Array
    (req, res, next) => {
        if (!(req.body.category instanceof Array)) {
            if (typeof req.body.category === "undefined") req.body.category = [];
            else req.body.category = [req.body.category];
        }
        next();
    },

    // Validate and sanitize fields
    body("name", "name must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "description must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("category.*").escape(),
    body("price", "please enter a non-negative price value")
        .trim()
        .isCurrency({ allow_negatives: false })
        .escape(),
    body("number_in_stock", "number in stock must be a positive integer below 500")
        .trim()
        .isInt({ min: 0, max: 500 })
        .escape(),
    body("password", "incorrect password").isIn(secretPassword),

    // Process request after validation and sanitization
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request
        const errors = validationResult(req);
        
        // Create Item object with escaped/trimmed data and same id
        const item = new Item({
            name: req.body.title,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            number_in_stock: req.body.number_in_stock,
            _id: req.params.id,
        });

        if(!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages

            const allCategories = await Category.find().exec();

            // Mark our selected categories as checked
            for (const category of allCategories) {
                if (item.category.includes(category._id)) {
                    category.checked = 'true';
                }
            }

            res.render("item_form", { title: "Update Item", item: item, all_categories: allCategories, errors: errors.array() });
            return;
        } else {
            // Data from form is valid. Update item
            const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
            res.redirect(updatedItem.url);
        }
    })
];

exports.item_delete_get = asyncHandler(async (req, res, next) => {
    const item = await Item.findById(req.params.id).populate("category").exec();

    if (item === null) {
        // No results
        res.redirect('/item');
    }

    res.render("item_delete", { title: "Delete Item", item: item });
});

exports.item_delete_post = [
    body("password", "incorrect password").isIn(secretPassword),

    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request
        const errors = validationResult(req);

        const item = await Item.findById(req.params.id).populate("category").exec();

        if(!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages

            res.render("item_delete", { title: "Delete Item", item: item, errors: errors.array() });
            return;
        } else {
            await Item.findByIdAndDelete(req.params.id);
            res.redirect("/item");
        }
    })
];