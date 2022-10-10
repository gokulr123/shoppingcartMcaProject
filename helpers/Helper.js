var db=require('../config/connection')
var objectid=require('mongodb').ObjectId
const bcrypt =require('bcrypt')


module.exports={
    addtodatabase:(q) =>{

    return new Promise(async(resolve,reject)=>{
        await q.then((data)=>{
            resolve(data)
        })
    })
},
getall:(q) =>{
    return new Promise(async(resolve,reject)=>
    {   
        let products= await q.toArray()
       
    resolve(products)})
},
deleteone:(q) =>{
    return new Promise((resolve,reject)=>{
      q.then((response)=>{
            resolve(response)
        })
    })
},
getoneitemdetails:(q) =>{
    return new Promise((resolve,reject)=>{
       q.then((product)=>{
            resolve(product)
        })
    })
},
updateone:(q) =>{
    return new Promise((resolve,reject)=>{
        q.then((product)=>{
            resolve(product)
        })
    })
},
dosignup:(userdata)=>{
    return new Promise(async(resolve,reject)=>{
        userdata.password=await bcrypt.hash(userdata.password,10)
        db.get().collection("users").insertOne(userdata).then((res)=>{
            resolve(res)
        })
    })

},

dologin:(userdata) =>{
    return new Promise(async(resolve,reject)=>{
        let loginstatus=false
        let response={}
    let user=await db.get().collection("users").findOne({email:userdata.email})
    if(user)
    { 
        bcrypt.compare(userdata.password,user.password).then((status)=>{
            if(status){
                console.log('login success')
                response.user=user
                response.status="Success"
                console.log(response)
                resolve(response)
            }
            else{
                console.log('login failed')
                response.status="Password is incorrect"
                resolve(response)
            }
        })
    }
    else{
        response.status="Email is incorrect"
        resolve(response)
    }
    })
},

addtocart:(proid,userid)=>{
    let proobj ={
        item:objectid(proid),
        quantity:1
    }
    return new Promise(async(resolve,reject)=>{
        let usercart= await db.get().collection("cart").findOne({user:objectid(userid)})
        if(usercart){
            let proexist=usercart.products.findIndex(product=>product.item==proid)
            if(proexist!=-1)
            {
                 db.get().collection("cart")
                 .updateOne({user:objectid(userid),'products.item':objectid(proid)},
                 {
                    $inc:{'products.$.quantity':1}
                 }
                 ).then(()=>{
                     resolve()
                 })
            }else{
             db.get().collection("cart")
             .updateOne({user:objectid(userid)},
             {
                $push:{products:proobj}
            }).then((res)=>{
               resolve(res)
            })
        }

        }else{
            let cartobj={
                user:objectid(userid),
                products:[proobj]
            }
            db.get().collection("cart").insertOne(cartobj).then((res)=>{
                resolve()
            })
        }
    })
},
getcartproduct:(userid)=>{
    
    return new Promise (async(resolve,reject)=>{
        let cartitems= await db.get().collection("cart").aggregate([
            {
                $match:{user:objectid(userid)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
             {
                 $lookup:{
                     from:"products",
                     localField:'item',
                     foreignField:'_id',
                     as:'productdetails'
                 }
             },
             {
                 $project:{
                     item:1,quantity:1,product:{$arrayElemAt:['$productdetails',0]}
              }
         }
            
        ]).toArray()
    resolve(cartitems)
    })

},
 getcartcount:(userid)=>{
    return new Promise (async(resolve,reject)=>{
        let totalquantity= await db.get().collection("cart").aggregate([
            {
                $match:{user:objectid(userid)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
             {
                 $lookup:{
                     from:"products",
                     localField:'item',
                     foreignField:'_id',
                     as:'productdetails'
                 }
             },
             {
                 $project:{
                     item:1,quantity:1,product:{$arrayElemAt:['$productdetails',0]}
              }
         },
         {
            $group:{
                _id:null,
                totalquantity:{$sum:{$multiply: ['$quantity', 1]}}
                


              
            }
        }
        ]).toArray()
          
    if(totalquantity[0]!=undefined){
    
        
    
    resolve(totalquantity[0].totalquantity)
    }else{
        resolve(0)
    }
    })
},
gettotalamount:(userid)=>{
    return new Promise (async(resolve,reject)=>{
        
        let total= await db.get().collection("cart").aggregate([
            {
                $match:{user:objectid(userid)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
             {
                 $lookup:{
                     from:"products",
                     localField:'item',
                     foreignField:'_id',
                     as:'productdetails'
                 }
             },
             {
                 $project:{
                     item:1,quantity:1,product:{$arrayElemAt:['$productdetails',0]}
              }
         },
         {
            $group:{
                _id:null,
                total:{$sum:{$multiply: ['$quantity', {$toInt:'$product.price'}]}},
                


              
            }
        }
        ]).toArray()
          
    if(total[0]!=undefined){
    resolve(total[0].total)
    }else{
        resolve(0)
    }
    })
     
},
changeproductquantity:(details)=>{
    console.log("cart",details)
     let count =parseInt(details.count)
    quantity=parseInt(details.quantity)
    
    return new Promise((resolve,reject)=>{
        if(details.count==-1 && details.quantity==1){
            db.get().collection("cart")
            .updateOne({_id:objectid(details.cart)},
            {
                $pull:{products:{item:objectid(details.product)}}
            }
            ).then((response)=>{
                resolve({removeproduct:true})
            })
        }else
        db.get().collection("cart")
        .updateOne({_id:objectid(details.cart),'products.item':objectid(details.product)},
        {
           $inc:{'products.$.quantity':count}
        }
        ).then((response)=>{
            
            resolve({status:true})
        }) 
    })
    
},
deletecartproduct:(proid,cartid)=>{
    return new Promise ((resolve,reject)=>{
    db.get().collection("cart")
            .updateOne({_id:objectid(cartid)},
            {
                $pull:{products:{item:objectid(proid)}}
            }
            ).then((response)=>{
                resolve()
            })
        })
},
}