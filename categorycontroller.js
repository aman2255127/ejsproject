const db = require('../../models');
const helper = require('../../helper/helper');
const { Validator } = require('node-input-validator');
module.exports = {
    createcategory: async (req, res) => {
        try {
            const v = new Validator(req.body, {
                name: "required",
            });
            let errorsResponse = await helper.checkValidation(v);
            if (errorsResponse) {
                return helper.error(res, errorsResponse);
            }
            if (req.files && req.files.image) {
                let images = await helper.fileUpload(req.files.image);
                req.body.image = images;
            }
            const newCategory = await db.category.create({
                name: req.body.name,
                image: req.body.image,

            });
            req.flash("success", "Add category successfully");
            res.redirect("/categorylist");

        } catch (error) {
            console.error("Error creating category:", error);
            return helper.error(res, "Internal server error");
        }
    },
    categorylist: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect('/login');
            const data = await db.category.findAll();
            return res.render('category/categorylist.ejs', {
                session: req.session.admin,
                title: "categorylist",
                data
            })
        } catch (error) {
            console.error('Error find category:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    categorystatus: async (req, res) => {
        try {
            // Assuming 'db' is your Sequelize instance or ORM object
            const result = await db.category.update(
                { status: req.body.status }, // Update status to the new value
                { where: { id: req.body.id } } // Identify the category by its ID
            );
    
            // Sequelize's update method returns an array, where the first element is the number of rows affected
            if (result[0] === 1) { // This means one row was updated
                res.json({ success: true });
            } else {
                res.json({ success: false, message: "Status change failed" });
            }
        } catch (error) {
            console.error("Error updating status:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
    categoryview: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect("/login");
            let view = await db.category.findOne({
                where: {
                    id: req.params.id,
                },
            });
            res.render("category/categoryview.ejs", {
                session: req.session.admin,
                view,
                title: 'user Detail',
            });
        } catch (error) {
            console.error("Error fetching view", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    categorydelete: async (req, res) => {
        try {
            const categoryId = req.params.id;
            if (!categoryId) {
                return res.status(400).json({ success: false, message: "category ID is required" });
            }
            const category = await db.category.findByPk(categoryId);
            if (!category) {
                return res.status(404).json({ success: false, message: "category not found" });
            }
            await db.category.destroy({ where: { id: categoryId } });

            res.json({ success: true, message: "category deleted successfully" });
        } catch (error) {
            console.error("Error deleting category:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
    addcategory: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect("/login");
            res.render('category/addcategory', {
                session: req.session.admin,
                title: "Add Category",
            });
        } catch (error) {
            console.error("Error view", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
    editcategory: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect("/login");
            const category = await db.category.findOne({
                where: {
                    id: req.params.id,
                },
            });
            res.render('category/editcategory', {
                session: req.session.admin,
                title: "Edit Category",
                category
            });
        } catch (error) {
            console.error("Error edit", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
    updatecategory: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect("/login");
            
            const category = await db.category.findOne({ where: { id: req.params.id } });
            if (!category) {
                return res.status(404).json({ success: false, message: "Category not found" });
            }
            if (req.files && req.files.image) {
                let images = await helper.fileUpload(req.files.image);
                req.body.image = images; 
            } 
            const data= await db.category.update({
                name: req.body.name,
                image: req.body.image,
            }, {
                where: { id: req.params.id }
            });
            req.flash("success", "Category updated successfully");
            res.redirect("/categorylist");
    
        } catch (error) {
            console.error("Error editing category:", error);
            return helper.error(res, "Internal server error");
        }
  }  
}    