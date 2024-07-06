import { MongoStore } from "wwebjs-mongo";
import mongoose from "mongoose";
// import { RemoteAuth, Client } from "whatsapp-web.js";
import pkg from 'whatsapp-web.js';
const { Client, RemoteAuth,MessageMedia,LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
// import path from 'path';
// import { dirname } from "path";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';
// const { RemoteAuth, Client } = require('whatsapp-web.js');
dotenv.config();

class WhastappClient{
    constructor(userId){
        this.mongoURI    = process.env.MONGODB_URI;
        this.userId      = userId;
        this.client      = null;
        this.clientReady = false;
    }

    getUserId(){
        return this.userId;
    }

    setClient(client){
        if(client){
            this.client =  client;
        }else{
            console.log('client inexisistente')
        }
    }

    setReadyClient(state){
        this.clientReady = state;
    }

    createClientConnection(){
        return new Promise(async(resolve,reject)=>{
            
            const mongoURI = this.mongoURI;
            await mongoose.connect(mongoURI).then(()=>{
                console.log('conectado a mognodb')
            });

            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            console.log(__dirname)
            const dataPath = process.env.NODE_ENV === 'production' ? '/tmp/sessions' : path.join(__dirname, 'sessions');            
            mkdirSync(dataPath, { recursive: true });
            console.log(dataPath)
            const store = new MongoStore({mongoose: mongoose})
            const client = new Client({
                puppeteer: {
                  args: ["--no-sandbox"],
                },
                authStrategy: new LocalAuth({
                    dataPath: dataPath, // Specify the data path for local storage
                }),
                // authStrategy: new RemoteAuth({
                //   clientId: `${this.userId}`,
                //   store: store,
                //   backupSyncIntervalMs: 300000,
                // }),
              });
            
              client.on("qr", (qr) => {
                console.log("Qrcode gerado!");
                qrcode.generate(qr, { small: true });
              });
        
              client.on("authenticated", async () => {
                console.log("Authenticated");
              });
        
              client.once("ready", () => {
                console.log("Client is ready!");
                console.log(client.info);
                this.clientReady = true;
                resolve(client);
              });
        
              client.initialize();
        })
    }
}

export default WhastappClient; 