import { MongoStore } from "wwebjs-mongo";
import mongoose from "mongoose";
// import { RemoteAuth, Client } from "whatsapp-web.js";
import pkg from 'whatsapp-web.js';
const { Client, RemoteAuth,MessageMedia } = pkg;
import qrcode from 'qrcode-terminal';
// const { RemoteAuth, Client } = require('whatsapp-web.js');

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

            const store = new MongoStore({mongoose: mongoose})
            const client = new Client({
                puppeteer: {
                  args: ["--no-sandbox"],
                },
                authStrategy: new RemoteAuth({
                  clientId: `${this.userId}`,
                  store: store,
                  backupSyncIntervalMs: 300000,
                }),
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