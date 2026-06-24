import express from 'express';
import cors from 'cors'
import subjectRouter from './routes/subjects.js';

const app=express();
const PORT=8000;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true,
}))
app.use(express.json());

app.use('/api/subjects',subjectRouter)
app.get('/',(req,res)=>{
  res.send('Hello, welcome to the classroom API!');
});

app.listen(PORT, ()=>{
  console.log(`server is running at http://localhost:${PORT}`);
});