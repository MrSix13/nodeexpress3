import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import pkg from 'whatsapp-web.js';
import dotenv from 'dotenv';
const { Client, RemoteAuth,MessageMedia } = pkg;
import qrcode from 'qrcode-terminal';
import {mongoose} from 'mongoose';
import { MongoStore } from 'wwebjs-mongo';


const router = express.Router();

const app = express();


dotenv.config();
app.use('/api', router);
app.use(express.json())
app.use(morgan('dev'));
app.use(cors());






let client                   = null;
let isWhatsAppConnection     = false;
// https://github.com/wppconnect-team/wa-version/blob/main/html/2.3000.1012089252-alpha.html
let versionCacheWhastAppWeb  = '2.3000.1012089252-alpha.html'

const port       = process.env.PORT || 5000;
//=======================MONGODB=========================//
const MONGO_URI  = process.env.MONGODB_URI;






async function conectDB(){
  try {
    await mongoose.connect(MONGO_URI)
    const store = new MongoStore({mongoose: mongoose});
      console.log('Conectandose a Whastap Web')
      if(!isWhatsAppConnection){
        console.log('Creando Instancia Client')
        client = new Client({
          authStrategy: new MongoRemoteAuth({
              store: store,
              backupSyncIntervalMs: 300000
          }),
          webVersionCache: {
                  type: "remote",
                  remotePath:
                    `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${versionCacheWhastAppWeb}`,
                },
        });
        client.on('qr', (qr) => {
            qrcode.generate(qr, { small: true });
            console.log('QR RECEIVED', qr);
        });

        
        client.on('ready', () => {
          console.log('Conectado a WhatsApp');
          isWhatsAppConnection = true;
        });

        console.log('Finalizando Instancia Client')  
        await client.initialize();
      }
   
    console.log('conectado  MONGODB')
      
    } catch (error) {
      console.log(error)
      throw error
    }

};

const SessionSchema = new mongoose.Schema({
  id        : {type: String, unique:true},
  session   : {type: Buffer},
  qrCode    : {type: Buffer},
  expiresAt : {type: Date}
});

const Session = mongoose.model('Session',SessionSchema);


class MongoRemoteAuth extends RemoteAuth {
  constructor(store) {
    super(store);
  }

  async getSession() {
    const sessions = await Session.find();
    return sessions.map((session) => ({
      id: session.id,
      session: session.session,
      qrCode: session.qrCode,
      expiresAt: session.expiresAt,
    }));
  }

  async saveSession(session) {
    const existingSession = await Session.findById(session.id);
    if (existingSession) {
      await existingSession.updateOne(session);
    } else {
      const newSession = new Session(session);
      await newSession.save();
    }
  }

  async deleteSession(sessionId) {
    await Session.findByIdAndDelete(sessionId);
  }
}


//=======================MONGODB=========================//


async function reconnect() {
  try {
    await client.initialize();
    console.log('Reconnected to WhatsApp Web!');
  } catch (error) {
    console.error('Error during reconnection:', error);
    // Implement exponential backoff or retry logic here
  }
}




// const client = new Client({
//     authStrategy: new LocalAuth({ dataPath: 'session' }),
//     webVersionCache: {
//       type: "remote",
//       remotePath:
//         "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
//     },
//   });


app.get('/', (req,res)=>{
  return res.json({
     mensaje:"Bienvenido a API node index"
  })
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
      await conectDB()
    } catch (error) {
      console.log(error)
      return res.json({error: 'Error al conectar WhatsApp'})
    }  
  

  
  return res.json({isWhatsAppConnection})
})


app.post('/enviar-mensaje', async(req,res)=>{
  try {
  if (!client) {
      await conectDB();
  }


  if(!isWhatsAppConnection){
    return res.json({mensaje:"Conenctando a wsp, intente mas tarde"})
  }
    if(isWhatsAppConnection){
      const {numero, mensaje} = req.body;   
      for (const phoneNumber of numero) {
          const formattedNumber = phoneNumber + '@c.us';
          console.log('formattedNumber:', formattedNumber)
          await client.sendMessage(formattedNumber, mensaje || 'test');

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
    // conectDB()
})

// await client.initialize();
