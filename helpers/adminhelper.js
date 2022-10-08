var db=require('../config/connection')
var objectid=require('mongodb').ObjectId


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
}