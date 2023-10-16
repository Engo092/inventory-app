const Item = require('../models/item');
const Category = require('../models/category');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const secretPassword = ['verySecretPassword']

exports.category_list = asyncHandler(async (req, res, next) => {
    const allCategories = await Category.find().sort({ title: 1 }).exec();

    res.render("category_list", { title: "Music Store Categories", all_categories: allCategories });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
    const [category, catItems]= await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ "category": req.params.id }, "name").exec(),
    ]);

    res.render("category_detail", { title: "Category Detail", category: category, items: catItems });
});

exports.category_create_get = asyncHandler(async (req, res, next) => {
    res.render("category_form", { title: "Create Category" });
});

exports.category_create_post = [
    // Validate and sanitize fields
    body("title", "title must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "description must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("password", "incorrect password"),

    // Process request after validation and sanitization
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request
        const errors = validationResult(req);
        
        // Create Item object with escaped and trimmed data
        const category = new Category({
            title: req.body.title,
            description: req.body.description,
        });

        if(!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages

            res.render("category_form", { title: "Create Category", category: category });
            return;
        } else {
            // Data from form is valid. Save category
            await category.save();
            res.redirect(category.url);
        }
    })
];

exports.category_update_get = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id).exec();

    if (category === null) {
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
    }

    res.render("category_form", { title: "Update Category", category: category });
});

exports.category_update_post = [
    // Validate and sanitize fields
    body("title", "title must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "description must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("password", "incorrect password").isIn(secretPassword),

    // Process request after validation and sanitization
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request
        const errors = validationResult(req);
        
        // Create Item object with escaped/trimmed data and same id
        const category = new Category({
            title: req.body.title,
            description: req.body.description,
            _id: req.params.id,
        });

        if(!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages

            res.render("category_form", { title: "Update Category", category: category });
            return;
        } else {
            // Data from form is valid. Update category
            const updatedItem = await Category.findByIdAndUpdate(req.params.id, category, {});
            res.redirect(updatedItem.url);
        }
    })
];

exports.category_delete_get = asyncHandler(async (req, res, next) => {
    const [category, catItems] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }).exec(),
    ]);

    if (category === null) {
        // No results
        res.redirect('/category');
    }

    res.render("category_delete", { title: "Delete Category", category: category, items: catItems });
});

exports.category_delete_post = [
    body("password", "incorrect password").isIn(secretPassword),

    asyncHandler(async (req, res, next) => {
        const [category, catItems] = await Promise.all([
            Category.findById(req.params.id).exec(),
            Item.find({ category: req.params.id }).exec(),
        ]);
    
        if (catItems.length > 0) {
            res.render("category_delete", { title: "Delete Category", category: category, items: catItems });
            return;
        } else {
            // Extract the validation errors from a request
            const errors = validationResult(req);    
            if(!errors.isEmpty()) {
                // There are errors. Render form again with sanitized values/errors messages
    
                res.render("category_delete", { title: "Delete Category", category: category, items: catItems, errors: errors.array() });
                return;
            } else {
                await Category.findByIdAndDelete(req.params.id);
                res.redirect("/category");
            }
        }
    })
];