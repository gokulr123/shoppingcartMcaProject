var express = require('express');
var router = express.Router();
const multer = require('multer');
var db=require('../config/connection');
const Helper = require('../helpers/Helper');
const uuid=require('uuid').v4
var objectid=require('mongodb').ObjectId
const verifylogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }
  else{
    res.redirect('/')
  }
}

/* GET home page. */
router.get('/home',verifylogin,async function(req, res, next) {
  let userinfo=req.session.user
  let cartcount= await Helper.getcartcount(req.session.user._id)
  Helper.getall(db.get().collection('category').find()).then((category)=>{
    Helper.getall(db.get().collection('products').find({'category':'Bamboo Products'})).then((bambooproducts)=>{
      res.render('user/home',{user:true,category,bambooproducts,userinfo,cartcount});
    })
  })
 
});

router.get('/signup', function(req, res, next) {
  res.render('user/signup',{user:true,login:true});
});

router.post('/signup', function(req, res, next) {
  const userinfo ={
    username:req.body.username,
    email:req.body.email,
    password:req.body.password
  }
  Helper.dosignup(userinfo).then((resp)=>{
    res.json(resp)
  })
});

router.get('/', function(req, res, next) { 
  console.log(req.session.loggedIn)
  if(req.session.user){
    res.redirect('/home')
  }else{
    res.render('user/login',{user:true,login:true});
  }
 
});

router.post('/', function(req, res, next) {
  Helper.dologin(req.body).then((resp)=>{
    if(resp.status=="Success"){
      req.session.loggedIn=true
      req.session.user=resp.user
      res.json({success:1})
    }
    if(resp.status=="Password is incorrect"){
      res.json({success:0})
    }
    if(resp.status=="Email is incorrect"){
      res.json({success:-1})
    }
   
  })
});

router.get("/logout",(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

router.get('/catdata/:name',(req,res)=>{
  let name =req.params.name
  console.log(name)
  Helper.getall(db.get().collection('products').find({'category': name})).then((response)=>{ 
   res.json(response)
    
 })
})
router.get('/showproduct/:id', async function(req, res, next) {
  let proid =req.params.id
  let user=req.session.user
  let cartcount= await Helper.getcartcount(req.session.user._id)
  let product = await Helper.getoneitemdetails( db.get().collection('products').findOne({_id:objectid(proid)}))
  res.render('user/showproduct',{user:true,product,user,cartcount});
});
router.get('/addtocart/:id',async(req,res)=>{
    Helper.addtocart(req.params.id,req.session.user._id).then(async(response)=>{
    res.json({status:true})
  })
})
router.get('/review/:id', async function(req, res, next) {
  let id=req.params.id
  let average_rating = 0;
  let	total_review = 0;
  let	five_star_review = 0;
  let	four_star_review = 0;
  let	three_star_review = 0;
  let	two_star_review = 0;
  let	one_star_review = 0;
  let	total_user_rating = 0;
  let reviews= await db.get().collection('review').find({product_id:id}).sort({date:-1}) .toArray()
 
  for (let i = 0; i < reviews.length; i++) 
  {
 
   if(reviews[i].user_rating== '5')
     {
       five_star_review++;
     }
     if(reviews[i].user_rating== '4')
     {
       four_star_review++;
     }    
     if(reviews[i].user_rating== '3')
     {
       three_star_review++;
     }
     if(reviews[i].user_rating== '2')
     {
       two_star_review++;
     }
     if(reviews[i].user_rating== '1')
     {
       one_star_review++;
     }
 
     total_review++;
     total_user_rating = total_user_rating +parseInt(reviews[i].user_rating) ;
  }
 
  average_rating = total_user_rating / total_review;
  let output={
   'average_rating':average_rating.toFixed(1),
   'total_review'	:	total_review,
   'five_star_review' :five_star_review,
   'four_star_review'	:four_star_review,
   'three_star_review'	:three_star_review,
   'two_star_review'	:	two_star_review,
   'one_star_review'	:	one_star_review,
   'review_data'		:	reviews
  }
 
  res.json(output)
  
 
 });

 router.post('/review',async function (req, res, next) {
  const d = new Date()
  let reviewobj={
    user_name:req.body.user_name,
    user_id:req.body.user_id,
    product_id:req.body.product_id,
    user_rating:req.body.rating_data,
    user_review:req.body.user_review,
    date:d.getTime(),
}
await db.get().collection('review').insertOne(reviewobj).then(()=>{
  res.end('{"success" : "Your Review & Rating Successfully Submitted"}')
})

})
router.get('/cart',verifylogin,async(req,res)=>{
  let userverify=req.session.user
  let cartproduct= await Helper.getcartproduct(req.session.user._id)
 let totalvalue=await Helper.gettotalamount(req.session.user._id)
  res.render('user/cart',{user:true,cartproduct,totalvalue})
})
router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.session.user)
  Helper.changeproductquantity(req.body).then(async(response)=>{
    response.total=await Helper.gettotalamount(req.session.user._id)
    res.json(response)
  })
})
router.get('/deletecartproduct/:id/:cart',(req,res)=>{
  let proid=req.params.id
  let cartid=req.params.cart
    Helper.deletecartproduct(proid,cartid).then((response)=>{
      res.redirect('/cart')
    })
  
  
})

router.get('/checkout',verifylogin,async(req,res)=>{
  let userverify=req.session.user
  let cartcount= await Helper.getcartcount(req.session.user._id)
  let cartproduct= await Helper.getcartproduct(req.session.user._id)
 let totalvalue=await Helper.gettotalamount(req.session.user._id)
  res.render('user/checkout',{user:true,cartproduct,totalvalue,cartcount})
})
router.post('/checkout',verifylogin,async(req,res)=>{
  let product = await Helper.getcartproductlist(req.session.user._id)
  let totalprice=await Helper.gettotalamount(req.session.user._id)
  Helper.order(req.body,product,totalprice,req.session.user._id).then((orderid)=>{
    if(req.body['mode']==='cod'){
      res.json({codsuccess:true})
    }else{
      Helper.generaterazorpay(orderid,totalprice).then((response)=>{
          res.json(response)
      })
    }
    
})
})

router.post('/verify-payment',(req,res)=>{
  console.log(req.body)
  Helper.verifypayment(req.body).then(()=>{
    Helper.changepaymentstatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err)
    res.json({status:false})
  })
})

router.get('/vieworders',verifylogin,async(req,res)=>{
  let userverify=req.session.user
  let orders= await Helper.getuserorders(req.session.user._id)
  res.render('user/vieworders',{user:true,orders,userverify})
})
router.get('/vieworderproducts/:id',async(req,res)=>{
  let userverify=req.session.user
  let orderproducts=await Helper.getuserordersproducts(req.params.id)
  console.log(orderproducts)
  res.render('user/vieworderedproducts',{user:true,orderproducts,userverify})
  
})
router.post("/search",verifylogin,async(req,res)=>{
  let products=await Helper.getsearchelement(req.body)
  res.render('user/searchproducts',{user:true,products});
})




module.exports = router;
