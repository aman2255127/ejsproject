var express = require('express');
const Admincontroller = require('../controller/Admin/Admincontroller');
const Authcontroller = require('../controller/Auth/Authcontroller');
const categorycontroller = require('../controller/Admin/categorycontroller');
const productcontroller = require('../controller/Admin/productcontroller');
var router = express.Router();

// GET home page
router.get('/dashboard',Admincontroller.Dashboard)
router.post('/createUser',Authcontroller.createUser)
router.get('/login',Admincontroller.login)
router.post('/loginpost',Admincontroller.loginpost)

//router for profile
router.get('/profile',Admincontroller.profile)
router.post('/editprofile',Admincontroller.edit_profile)
router.get('/password',Admincontroller.password)
router.post('/updatepassword',Admincontroller.updatepassword);
router.get('/logout',Admincontroller.logout)

// router for users
router.get('/userlist',Admincontroller.user_list)
router.post('/status',Admincontroller.status)
router.get('/view/:id',Admincontroller.view)
router.post('/delete/:id',Admincontroller.user_delete)

//router for category
router.post('/createcategory',categorycontroller.createcategory)
router.get('/categorylist',categorycontroller.categorylist)
router.post('/categorystatus',categorycontroller.categorystatus)
router.get('/categoryview/:id',categorycontroller.categoryview)
router.post('/categorydelete/:id',categorycontroller.categorydelete)
router.get('/addcategory',categorycontroller.addcategory)
router.get('/editcategory/:id',categorycontroller.editcategory)
router.post('/updatecategory/:id',categorycontroller.updatecategory)

//router for products
router.post('/createproducts',productcontroller.createproducts)
router.get('/productslist',productcontroller.productslist)
router.post('/productstatus',productcontroller.productstatus)
router.get('/productsview/:id',productcontroller.productsview)
router.get('/addproducts',productcontroller.addproducts)
router.post('/productdelete/:id',productcontroller.productdelete)
module.exports = router;
