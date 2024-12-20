const db = require('../../models');
const bcrypt = require('bcrypt');
const helper = require('../../helper/helper');
module.exports = {
    Dashboard: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect('/login');

            const userCount= await db.users.count( {where: { role: '1' }})
            const categoryCount= await db.category.count()
            const productsCount= await db.products.count()
            res.render('dashboard', {
                session: req.session.admin,
                userCount,
                categoryCount,
                productsCount,
                title: 'Dashboard',
            });
        } catch (error) {
            console.error('Error rendering dashboard:', error);
            res.status(500).send('An error occurred while rendering the dashboard');
        }
    },
    login: async (req, res) => {
        try {
            res.render('login.ejs')
        } catch (error) {
            console.log(error);
        }
    },
    loginpost: async (req, res) => {
        try {
            const { email, password } = req.body;
            const find_user = await db.users.findOne({
                where: { email, role: '0' }
            });
            if (!find_user) {
                req.flash('error', 'User not found');
                return res.redirect('/login');
            }
            const storedHash = find_user.password;
            const isPasswordCorrect = await bcrypt.compare(password, storedHash);
            if (isPasswordCorrect) {
                req.session.admin = find_user;
                req.flash('success', 'Login successful');
                return res.redirect('/dashboard');
            } else {
                req.flash('error', 'Invalid credentials');
                return res.redirect('/login');
            }
        } catch (error) {
            console.error('Error during login:', error);
            req.flash('error', 'Internal server error');
            return res.redirect('/login');
        }
    },
    profile: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect('/login');
            const profile = await db.users.findOne({
                where: { email: req.session.admin.email }
            })
            res.render('Admin/profile', {
                session: req.session.admin,
                profile,
                title: "profile"
            });
        } catch (error) {
            console.error('Error rendering profile:', error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },
    edit_profile: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect("/login");
            let folder = "admin";
            if (req.files && req.files.image) {
                let images = await helper.fileUpload(req.files.image, folder);
                req.body.image = images;
            }
            const profile = await db.users.update(req.body, {
                where: {
                    id: req.session.admin.id,
                },
            });
            const find_data = await db.users.findOne({
                where: {
                    id: req.session.admin.id,
                },
            });
            req.session.admin = find_data;
            res.redirect("/login");
        } catch (error) {
            console.log(error);
            return helper.error(res, error);
        }
    },
    password: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect('/login');
            res.render('admin/password.ejs', {
                session: req.session.admin,
                title: "Password"
            });
        } catch (error) {
            console.log(error, 'error');
        }
    },
    updatepassword: async (req, res) => {
        console.log(req.body,"hashedPasswordhashedPassword")

        const { oldPassword, newPassword, confirmPassword } = req.body;

        try {

            if (!oldPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'New password and confirm password do not match' });
            }
            const user = await db.users.findOne({ where: { id: req.session.admin.id } });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const isMatch = await bcrypt.compare(oldPassword, user.password);
        
            if (!isMatch) {
                return res.status(400).json({ message: 'Old password is incorrect' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
        
            user.password = hashedPassword;
            await user.save();

            return res.redirect('/dashboard');
            

        } catch (error) {
            console.error('Error updating password:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    logout: async (req, res) => {
        try {
            req.flash('success', 'You have successfully logged out');
            req.session.destroy((err) => {
                if (err) {
                    return helper.error(res, err);
                }
                res.redirect("/login");
            });
        } catch (error) {
            return helper.error(res, error);
        }
    },
    user_list: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect('/login');
            const data = await db.users.findAll({ where: { role: "1" } });
            res.render('Admin/userlist.ejs', {
                session: req.session.admin,
                title: "Users",
                data
            });
        } catch (error) {
            console.error('Error find users:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    status: async (req, res) => {
        try {
            const { id, status } = req.body;
    
            // Validate the input
            if (!id || typeof status === 'undefined') {
                return res.status(400).json({ success: false, message: "Invalid input data" });
            }
    
            // Update the user status
            const result = await db.users.update(
                { status }, // Update the `status` field
                { where: { id } } // Match the `id` field
            );
    
            if (result[0] === 1) {
                // Status updated successfully
                res.status(200).json({ success: true, message: "Status updated successfully" });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Status change failed. User may not exist or no changes were made.",
                });
            }
        } catch (error) {
            console.error("Error updating status:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
    
    view: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect("/login");
            let view = await db.users.findOne({
                where: {
                    id: req.params.id,
                },
            });
            res.render("admin/view.ejs", {
                session: req.session.admin,
                view,
                title: 'User Detail',
            });
        } catch (error) {
            console.error("Error fetching view", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    user_delete: async (req, res) => {
        try {
            const userId = req.params.id;
            if (!userId) {
                return res.status(400).json({ success: false, message: "User ID is required" });
            }
            const user = await db.users.findByPk(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            await db.users.destroy({ where: { id: userId } });

        } catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
}