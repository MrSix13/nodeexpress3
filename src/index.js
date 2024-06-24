import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json())
app.use(cors());


app.get('/', (req,res)=>{
    return res.json({messge:"Hola Mundo"})
});


app.listen(port, ()=>{
    console.log('app escuchando en puerto' + port)
})