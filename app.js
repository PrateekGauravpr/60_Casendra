const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy; // Import LocalStrategy
const user = require("./models/register"); // Import the user model
const session = require("express-session");
const flash = require("connect-flash");
const expressLayouts = require("express-ejs-layouts");
const ejsMate = require('ejs-mate');
const task = require("./models/tasklist");
const { render } = require("ejs");
const { findByIdAndUpdate, findById } = require("./models/register");
const moment = require("moment");
const { response } = require("express");
const multer = require("multer")
const {isloggedin} = require("./Middleware/Middleware.js");
const { userInfo } = require("os");
const local = require("local")
const ExpressError = require("./utils/expressError");
const item = require("./models/shooping");




let port = 2223;

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "/public")));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

// Session options
const sessionOptions = {
  secret: "mycode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 2 * 24 * 60 * 60 * 1000,
    maxAge: 2 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
};

app.use(session(sessionOptions));






// Passport configuration
passport.use(new LocalStrategy(user.authenticate())); // Use LocalStrategy provided by passport-local-mongoose
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.err = req.flash("err");
  res.locals.userinfo = req.user;
  // console.log(req.user)
  next();
});

// Body parser middleware (Express 4.16+ has this built-in)
app.use(express.urlencoded({ extended: true }));  // No need for body-parser

// Connect to MongoDB
async function main() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/cassandra', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
}

// Start the server
app.listen(port, () => {
  console.log("App is listening on port " + port);
});

// Route to render the register page
app.get("/", (req, res) => {
  res.render("register.ejs");  // Assuming you have a 'register.ejs' file
});

// Route to render the registration form
app.get("/register", (req, res,next) => {
  try{
    res.render("register_form.ejs");  // Assuming you have a 'register_form.ejs' file
  }
  catch(err){
    next(err)
  }
  
});

// Register a new user
app.post("/register", async (req, res, next) => {
  const { mobile_no, name, email_id, username, password } = req.body;
  
  try {
    // Check if the user already exists (email or username)
    const existingUser = await user.findOne({ $or: [{ email_id }, { username }] });
    if (existingUser) {
      return res.status(400).send("User with this email or username already exists");
    }

    // Create a new user
    const newUser = new user({
      name,
      mobile_no,
      email_id,
      username,
    });

    // Set the password using passport-local-mongoose's method
    await newUser.setPassword(password);

    // Save the user
    await newUser.save();
    res.status(201).redirect("/home");  // Redirect after successful registration
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// Login route using passport
app.post("/login", passport.authenticate('local', { 
  failureRedirect: '/',  // If login fails, redirect to root page
}), (req, res) => {
  req.flash("success", "successful logged in")
  res.redirect("/home") // Send a success message
});

app.get("/task",isloggedin, (req, res)=>{
  
  res.render("task_form.ejs")
})

app.post("/task",isloggedin, async(req, res)=>{
 let  { Tname,Tdesc,Personal,Tassign,tat } = req.body
 const userid = (req.user._id)
 const task1 = new task({
  Task_Name:Tname,
  Description: Tdesc,
  Assigned_to: Tassign,
  created_by : userid,
  TAT : tat
 })
  
 task1.save();
 res.redirect("/home")


})

app.get("/home",isloggedin, async (req, res) => {
 
    // Query to fetch tasks where Status is not 'Open' and created_by matches req.user._id
    const taskData = await task.find({
      created_by: req.user._id,
      Status : "Open" ,
    })

    // console.log(taskData);  // This logs the task data for debugging

    // Render the home page and pass taskData to the view
    res.render("home.ejs", { taskData });

  
});

app.post("/close/:id",isloggedin, async(req , res, next)=>{
let {id}= req.params
console.log(id)
let close_data = await task.findById(id)
console.log(close_data)
res.render("done_form.ejs", {close_data})
})

app.post("/comment/:id",isloggedin, async(req, res)=>{
let {id} = req.params
let {comment} = req.body
let Updated_status = await task.findByIdAndUpdate(id, {Status : "Closed", comment:comment }, {new : true})
// console.log(Updated_status)
res.redirect("/home")
})


app.get("/task/today", isloggedin, async(req, res)=>{

const DayStart = moment().startOf('day').toDate();
const Dayend = moment().endOf('day').toDate();

  let pend_today = await task.find( {created_by : req.user._id, Status : "Open"  ,TAT : {$gte : DayStart, $lt: Dayend }})
  res.render("Task_today.ejs", {pend_today})
})

app.get("/All_closed" , isloggedin, async (req, res)=>{
  let data_closed = await task.find({created_by : req.user._id, Status : "Closed"})
  res.render("closed_task.ejs", {data_closed})

})

// Reopen the Closed Task
app.post("/close/:id/reopen",isloggedin, async(req , res ,next)=>{
try{
  let {id} = req.params
  let data_reopen = await task.findByIdAndUpdate(id ,{Status : "Open"}, {new : true})
  res.redirect("/home");
  console.log(data_reopen)
  
} catch(err){
  next(err);
}

})

app.get("/postpond/:id", isloggedin,  asyncWrap(async (req, res)=>{
  let {id} = req.params
  let data_post = await task.findById(id)
res.render("task_postpon.ejs", {data_post})

})) 

app.post("/postpon/:id/update",isloggedin, asyncWrap( async (req,res)=>{
  let {id} = req.params
let {TAT} = req.body
  let data = await task.findByIdAndUpdate(id, {TAT : TAT }, {new : true})
res.redirect("/home")
}))

app.get("/bulk", isloggedin,(req, res)=>{
  res.render("Bau_form.ejs")
})

// request for one time form

app.post("/OneTime", isloggedin, asyncWrap(async (req, res)=>{

  let{Task_Name,Description,TAT,duration,duration_months} = req.body
let data2 = new task ({
  Task_Name : Task_Name,
  Description :Description,
  TAT : TAT,
  duration : duration,
  duration_months : duration_months
})
let data3 = await data2.save();
console.log(data3)
res.redirect("/home")
})  ); 


// form render for bulk upload

app.get("/bulkupload",isloggedin,(req,res)=>{
  res.render("bulk_form.ejs")
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb)=> {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix)}
})
const upload = multer({ storage });

app.post("/bulkupload", upload.single("bulkdata"), (req,res)=>{
  let file = req.file;
  console.log(file)
  res.send(file)
})

app.get("/logout", (req, res, next)=>{
 try{
  req.logOut((err)=>{
    if(err){
      next(err);
    }
    console.log("We have been logout successfully")
    res.redirect("/")
  })
 }catch(err){
  next(err)
 }
  
})

app.get("/shooping", (req,res)=>{
  res.render("Shooping_form.ejs")
})

app.post("/table_data", async (req, res) => {
  let { item_name, schedule_on, category } = req.body;
  console.log(schedule_on)

  // Make sure that item_name, schedule_on, and category are not empty
  if (!item_name || !schedule_on || !category) {
      return res.status(400).send("All fields are required.");
  }

  try {
      // Loop through the received arrays and save them as individual tasks
      for (let i = 0; i < item_name.length; i++) {
        console.log(item_name.length)
        console.log(i)
          let data_push = new item({
              item: item_name[i],  // Task Name
              scheduled: schedule_on[i],  // Scheduled Date
              category: category[i],  // Category
              createdby: req.user._id,
              date_new: schedule_on[i]
          });
          console.log(data_push)
          // Save each task
          await data_push.save();
      }

      // Redirect after successful saving of tasks
      res.redirect("/home");

  } catch (err) {
      console.error(err);
      res.status(500).send("Error while saving tasks.");
  }
});



function asyncWrap (fn){
  return(req,res,next)=>{
    fn(req,res,next).catch((err)=>{next(err)})
  }
}

app.get("/show_list", asyncWrap(async (req, res, next) => {



  let id = req.user._id;
  let data1 = await item.find({createdby : id, statu: "open" })
  console.log(data1)

  // Aggregate to find items created by the user and with status 'Open', then group by 'date_new'
  let data = await item.aggregate([
    {
      $match: {
        createdby: id,
        statu: 'Open'
      }
    },
    {
      $group: {
        _id: "$date_new", // Grouping by 'date_new'
        items: { $push: "$$ROOT" } // Pushing the whole document as an array under 'items'
      }
    },
    {
      $sort: { "_id": 1 } // Sorting by date_new in ascending order
    }
  ]);

  // console.log(data);
  
  // Render the data to the EJS view
  res.render("shopping_list_display.ejs", { data });

}));

app.get("/sholis/:id", async(req,res,next)=>{
  let date = req.params
  console.log(date.id)
  let fetch_date = await item.find({date_new : date.id, createdby : req.user._id})
  console.log(fetch_date)
  res.render("shoping_list_display.ejs", {fetch_date})
})

app.post("/listupdate/:id", async(req, res, next)=>{
  let {id} = req.params
  let {name}= req.body
  console.log(name)
  console.log(id)
  let data = await item.findByIdAndUpdate( {_id:id}, {statu : "Closed"} ,{new : true})
  console.log(data)
  let rout = req.get("referer")
  console.log(rout)
  res.redirect(rout)
})





app.all("*", ( req, res, next)=>{
  next(new ExpressError(404, "This page does not exist"))
});

app.use((err, req, res, next)=>{
  let { statusCode = 500, message = "Something went wrong!" } = err;
res.status(statusCode).send(message)
// console.log(statusCode , message)
console.log(err)
} );
  


// Initiate DB connection
main();
