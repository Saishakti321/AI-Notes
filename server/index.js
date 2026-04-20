  import express from "express"
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./utils/connectDB.js"
import authRouter from "./routes/auth.route.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/user.route.js"
import notesRouter from "./routes/generate.route.js"
import pdfRouter from "./routes/pdfroute.js"
import { stripeWebhook } from "./controllers/credit.controller.js"
import creditRouter from "./routes/credits.route.js"

const app = express();

app.post("/api/credits/webhook", express.raw({type: "application/json"}),
stripeWebhook
)


app.use(cors(
    {origin:"https://ai-notes-clientside.onrender.com" ,
    credentials:true,
    methods:["GET","POST","PUT","DELETE","OPTIONS"]
   }
))
app.use(express.json())
app.use(cookieParser())
// app.use((req, res, next) => {
//   res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups")
//   next()
// })
const  PORT = process.env.PORT || 5000
app.get("/",(req,res)=>{
    // console.log(req.url);
    
    res.json({message:"ExamNotes AI Backend Running"})
})
app.use("/api/auth", authRouter) 
app.use("/api/user",userRouter)
app.use("/api/notes",notesRouter)
app.use("/api/pdf",pdfRouter)
app.use("/api/credit", creditRouter)

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
    connectDB()
})
