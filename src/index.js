import express from 'express';
import cors from 'cors';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json())
app.use(cors());



const client = new Client({
    authStrategy: new LocalAuth({ dataPath: 'session' }),
    webVersionCache: {
      type: "remote",
      remotePath:
        "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
  });



app.get('/', (req,res)=>{
    return res.json({mensaje: "hola mundo v2"})
})

app.get('/1', (req,res)=>{
    return res.json({mensaje: "hola mundo- 1"})
})


app.get('/mensaje', (req,res)=>{



})




app.listen(port, ()=>{
    console.log('app escuchando en puerto' + port)
})

await client.initialize();