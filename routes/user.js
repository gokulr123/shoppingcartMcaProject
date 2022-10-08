var express = require('express');
var router = express.Router();
const multer = require('multer');
var db=require('../config/connection');
const adminhelper = require('../helpers/adminhelper');
const uuid=require('uuid').v4
var objectid=require('mongodb').ObjectId

/* GET home page. */
router.get('/', function(req, res, next) {
  adminhelper.getall(db.get().collection('category').find()).then((category)=>{
    adminhelper.getall(db.get().collection('products').find({'category':'Bamboo Products'})).then((bambooproducts)=>{
      res.render('user/home',{user:true,category,bambooproducts});
    })
  })
 
});
router.get('/login', function(req, res, next) {
  res.render('user/login',{user:true});
});
router.get('/signup', function(req, res, next) {
  res.render('user/signup',{user:true});
});
router.get('/catdata/:name',(req,res)=>{
  let name =req.params.name
  console.log(name)
  adminhelper.getall(db.get().collection('products').find({'category': name})).then((response)=>{ 
   res.json(response)
    
 })

})
router.get('/showproduct/:id', async function(req, res, next) {
  let proid =req.params.id
  let product = await adminhelper.getoneitemdetails( db.get().collection('products').findOne({_id:objectid(proid)}))
  console.log(product)
  res.render('user/showproduct',{user:true,product});
});

module.exports = router;
