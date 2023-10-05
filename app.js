const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app=express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://127.0.0.1:27017/ToDoDB");

const ToDoSchema=new mongoose.Schema({
    items:{
        type:String,
        //required:[true,"please enter event"]
    },
    done:{ type: Boolean, default: false }
});


const ListSchema={
    name:String,
    items:[ToDoSchema]
}
const SList=mongoose.model("list",ListSchema);

const List=mongoose.model("event",ToDoSchema);

const item1=new List({
    items:"Welcome to MMRCH To-Do List"
});
const item2=new List({
    items:"Just Add Todays task"
});
const item3=new List({
    items:"Mark done if you have already done"
});

const defaultItems=[item1,item2,item3];


/*List.insertMany(foundItems,function(err){
    if(err){
        console.log(err);
    }
    else{
        console.log("Successfully save default values in DB");
    }
})*/
//app.use("view engine","ejs");
/*var day="";
var items=["Eat"];*/
app.get("/",function(req,res){

    List.find(function(err,itemsDB){


        /*if(err){
            console.log(err);
        }
        else{*/
            if(itemsDB.length===0){
                List.insertMany(defaultItems,function(err){
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("Successfully save default values in DB");
                    }
                });
                res.redirect("/");
            }
            else{
                SList.find({}, function (err, users) {
                    let User=[users]
                    if(!err){
                    res.render("list",{kindOfDay:"Today",newListItems: itemsDB,users:users });
                    }
                });
            }
        //}
    });
});
   /* var today= new Date();
    var options={
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    var day=today.toLocaleDateString("en-IN",options);
    */
    /*switch (currentDay) {
        case 0:
            day="Sunday";
            break;
        
            case 1:
                day="Monday";
                break;
        
                case 2:
            day="Tuesday";
            break;
        
            case 3:
            day="Wednesday";
            break;
        
            case 4:
            day="Thursday";
            break;
        
            case 5:
            day="Friday";
            break;

            case 6:
            day="Saturday";
            break;
        
        
        default:
            break;
    }*/



app.get("/:customList",function(req,res){
    const customListName=_.capitalize(req.params.customList);
    SList.findOne({name:customListName},function(err,foundLists){
        if(!err){
            if(!foundLists){
                //console.log("Not Exist Create new List");
                const list=new SList({
                    name:customListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }
            else{
                //console.log("Exist");
                SList.find({}, function (err, users) {
                    if(!err){
                    res.render("list",{kindOfDay:foundLists.name,newListItems: foundLists.items ,users:users });
                    }
                });
                //res.render("list",{kindOfDay:foundLists.name,newListItems: foundLists.items });
            }
            
        }
        
    })
})


app.post("/",function(req,res){
    const newItem=req.body.newItem;
    const listT=req.body.list;
    //console.log(newItem);
    //console.log(listT);
    const item=new List({
        items:newItem
    });
    if(listT=="Today"){
        //console.log("Today List");
        item.save();
        res.redirect("/");
    }
    else{
        SList.findOne({name:listT},function(err,foundList){
            
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listT);
            
        });
    }
    
});



app.post("/d",function(req,res){
    const id=req.body.listId;
    const Cid=req.body.cross;
    const listName=req.body.listName;
    let Lists="";
    if(Cid){
        SList.findOne({_id:Cid},function(err,foundList){
            if(!err){
                if(foundList.name!==listName && listName!="Today"){
                    Lists=listName;
                }
            }
            
        });
        SList.findByIdAndRemove(Cid,function(err){
            if(!err){
                console.log("Successfully deleted");
                if(Cid){
                    res.redirect("/"+Lists);
                }
            }
        });
    }
    else{
        SList.findOne({_id:id},function(err,foundList){
            if(!err){
                console.log("FOUNDLIST "+foundList.name);
                if(foundList){
                    res.redirect("/"+foundList.name);
                }
                else{
                    res.redirect("/")
                }
            }
    
            
        });
    }
    //console.log("MANOHAR CHATURVEDI in /d");

});


app.post("/home",function(req,res){
    res.redirect("/")
});


app.post("/routing",function(req,res){
    const newList=req.body.newList;
    res.redirect("/"+newList);
});

app.post("/delete",function(req,res){
    const id=req.body.checkbox;
    const listName=req.body.listName;
    const Cid=req.body.checker;
    console.log(Cid);
    

    
        if(listName=="Today"){
            if(Cid){
            List.findOne({_id:Cid},function(err,foundList){
                if(!err){
                    console.log("DB value "+foundList.done);
    
                
                console.log("changed value is "+!foundList.done);
                List.findOneAndUpdate({_id:Cid},{$set:{done:!foundList.done}},function(err,found){
                    if(!err){
                        console.log("Successfully checked");
                    }
                });
                
                }
            });
        }
    
    
            
        
        

    List.findByIdAndRemove(id,function(err){
        if(!err){
            console.log("Successfully deleted");
            res.redirect("/");
        }
    });
}
else{

    SList.findOne({name:listName},function(err,foundLists){
        if(!err){
            foundLists.items.forEach(function(item){
                if(item._id==Cid){
                    console.log("Before done DB value "+item.done);
                    item.done=!item.done;
                    
                }
            });
            foundLists.save();
                    console.log("Success");
                    //res.redirect("/"+listName);
        }
        

    });




    
    /*SList.findOne({items:{_id:id}},function(err,foundList){
        console.log("DB value "+foundList.items.done);
        
        console.log("changed value is "+!foundList.done);
        List.findOneAndUpdate({items:{_id:Cid}},{$set:{items:{done:!foundList.items.done}}},function(err,found){
            if(!err){
                console.log("Successfully checked");
            }
            
        });
    });*/

    SList.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}},function(err,foundList){
        if(!err){
            res.redirect("/"+listName);
        }
    });
}
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
    console.log("Server started at port 3000");
});