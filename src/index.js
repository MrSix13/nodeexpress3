import cors from 'cors';
import express from 'express';
// import morgan from 'morgan';

import pkg from 'whatsapp-web.js';

import dotenv from 'dotenv';
const { Client, RemoteAuth,MessageMedia } = pkg;
import qrcode from 'qrcode-terminal';
import {mongoose} from 'mongoose';
import { MongoStore } from 'wwebjs-mongo';
import WhastappClient from './WhatsappClient.js';


const router = express.Router();

const app = express();
let userWsp = null;


dotenv.config();
app.use('/api', router);
app.use(express.json())
// app.use(morgan('dev'));
app.use(cors());






let client                   = null;
// https://github.com/wppconnect-team/wa-version/blob/main/html/2.3000.1012089252-alpha.html

const port       = process.env.PORT || 5000;
//=======================MONGODB=========================//
const MONGO_URI  = process.env.MONGODB_URI;

app.get('/', async(req,res)=>{
  try {
    // if(!isWhatsAppConnection){
    //   await conectDB()
    //   return res.json({isWhatsAppConnection})
    // }

    // const user = new WhastappClient('bastian')
    // const connection = await user.createClientConnection();
    // console.log('user-client-ready',user.clientReady)
    return res.json({"user-wsp": userWsp.clientReady})
  } catch (error) {
    console.log(error)
    return res.json({error: 'Error al conectar WhatsApp'})
  }  
})

app.get('/2', (req,res)=>{
  return res.json({
     mensaje:"Bienvenido a API node index 2"
  })
})


app.get('/status', (req,res)=>{
    return res.json({
      mensaje: isWhatsAppConnection
    })
})


app.get('/conection', async(req,res)=>{
    try {
      await userWsp.createClientConnection('bastian')
      return res.json({"user-ready": userWsp.clientReady})
    } catch (error) {
      console.log(error)
      return res.json({error: 'Error al conectar WhatsApp'})
    }  
})
app.get('/info', async(req,res)=>{
    try {
      let info = userWsp.clientReady
      console.log('user-client-ready',info)
      return res.json({"user-ready": info})
    } catch (error) {
      console.log(error)
      return res.json({error: 'Error al conectar WhatsApp'})
    }  
})


app.post('/enviar-mensaje', async(req,res)=>{
  try {
    if(userWsp.clientReady){
      const {numero, mensaje} = req.body;   
      for (const phoneNumber of numero) {
          const formattedNumber = phoneNumber + '@c.us';
          console.log('formattedNumber:', formattedNumber)
          await userWsp.client.sendMessage(formattedNumber, mensaje || 'test');

      }   
     res.json({ mensaje: 'Mensajes enviados correctamente.' });
    }
 } catch (error) {
  console.error('Error sending message:', error);
  conectDB()
  res.status(500).json({ mensaje: 'Error al enviar mensajes' });
  }
  
});


app.post('/enviar-mensaje-pdf', async(req,res)=>{
  try {
  if (!client) {
      await conectDB();
  }

  if(!isWhatsAppConnection){
    await conectDB();
  }
    if(isWhatsAppConnection){
      const {numero, mensaje} = req.body;   
      for (const phoneNumber of numero) {
          const formattedNumber = phoneNumber + '@c.us';
          console.log('formattedNumber:', formattedNumber)
          const media = await MessageMedia.fromUrl('https://www.mtoopticos.cl/pdf/junaeb.pdf');
          await client.sendMessage(formattedNumber, media,  { caption: 'this is my caption' });

      }   
     res.json({ mensaje: 'Mensajes enviados correctamente.' });
    }
 } catch (error) {
  console.error('Error sending message:', error);
  conectDB()
  res.status(500).json({ mensaje: 'Error al enviar mensajes' });
  }
  
});






app.listen(port, ()=>{
    console.log('app escuchando en puerto' + port)
    userWsp = new WhastappClient('bastian')
    // conectDB()
})

// await client.initialize();
