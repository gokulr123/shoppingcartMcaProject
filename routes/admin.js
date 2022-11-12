var express = require('express');
var router = express.Router();
const multer = require('multer');
var db=require('../config/connection');
const Helper = require('../helpers/Helper');
const uuid=require('uuid').v4
var objectid=require('mongodb').ObjectId


/* GET users listing. */
router.get('/', function(req, res, next) {
  Helper.getall(db.get().collection('category').find()).then((category)=>{
    
    res.render('admin/addproducts',{admin:true,category});;
    
  })
 
});
router.get('/addcategories', function(req, res, next) {
res.render('admin/addcategories',{admin:true});
});

const storage =multer.diskStorage({
  destination:(req,file,cb)=>{
    const path = require('path')
    cb(null,path.join(__dirname,'../public/product-images'))

  },
  filename:(req,file,cb)=>{
    const{originalname}=file;
    var imgid=`${uuid()}.jpg`
    cb(null,imgid);
  }
}); 
const upload=multer({storage:storage})
router.post('/addcategories',upload.single('category'), function(req, res) {
  let categoryobj={
    name:req.body.name,
    imagename:req.file.filename

}

  Helper.addtodatabase(db.get().collection('category').insertOne(categoryobj)).then((data)=>{
    
    res.redirect('admin/addcategories',{admin:true});
   
   
  })
  
  
});

router.post('/addproducts',upload.single('image'), function(req, res) {
  let productobj={
    name:req.body.name,
    category:req.body.category,
    price:req.body.price,
    description:req.body.description,
    expdate:req.body.expirydate,
    quantity:req.body.quantity,
    totalnumber:req.body.totalnumber,
    star:req.body.star,
    imagename:req.file.filename
}

  Helper.addtodatabase(db.get().collection('products').insertOne(productobj)).then((data)=>{
    res.redirect('/admin');
    
  })
  
  
})
router.get('/viewproducts', function(req, res, next) {
  Helper.getall(db.get().collection('products').find()).then((products)=>{
    res.render('admin/viewproducts',{admin:true,products});
  })
   
});
router.get('/editproducts', function(req, res, next) {
  Helper.getall(db.get().collection('products').find()).then((products)=>{
    res.render('admin/editproducts',{admin:true,products});
  })
   
});

router.get('/deleteproduct/:id',(req,res)=>{
  let proid=req.params.id
  Helper.deleteone(  db.get().collection('products').remove({_id:objectid(proid)})).then((response)=>{
    res.redirect('/admin/viewproducts')
  })
})
router.get('/editproduct/:id',async(req,res)=>{
  let proid=req.params.id
  let product = await Helper.getoneitemdetails( db.get().collection('products').findOne({_id:objectid(proid)}))
  res.render('admin/editproductpage',{admin:true,product})
})
router.post('/editproducts/:id',upload.single('image'),function(req,res){
  console.log(req.body)
  let proid=req.params.id
  const name = req.body.name;
  const category = req.body.category;
  const price = req.body.price;
  const description=req.body.description;
  const expdate=req.body.expdate;
  const quantity=req.body.quantity;
  const totalnumber=req.body.totalnumber;


  const updates = {
    name,
    category,
    price,
    description,
    expdate,
    quantity,
    totalnumber,
};

if (req.file) {
  const image = req.file.filename;
  updates.imagename = image;
}
Helper.updateone(db.get().collection('products')
.updateOne({_id:objectid(proid)},{
    $set:updates
})).then(()=>{
  res.redirect('/admin/editproducts')
})

})
router.get('/viewusers', function(req, res, next) {
  Helper.getall(db.get().collection('users').find()).then((users)=>{
    res.render('admin/viewuser',{admin:true,users});
  })
});
router.get('/vieworders', function(req, res, next) {
  Helper.getall(db.get().collection('orders').find()).then((orders)=>{
    res.render('admin/vieworders',{admin:true,orders});
  })
});
router.get('/vieworderproducts/:id',async(req,res)=>{
  let userverify=req.session.user
  let orderproducts=await Helper.getuserordersproducts(req.params.id)
  res.render('admin/vieworderproductpage',{admin:true,orderproducts})
  
})

module.exports = router;
