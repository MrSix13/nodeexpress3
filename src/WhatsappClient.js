import { MongoStore } from "wwebjs-mongo";
import mongoose from "mongoose";
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
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
        this.mongoURI    = process.env.MONGODB_URI || "";
        this.userId      = userId;
        this.client      = null;
        this.clientReady = false;
    }

    getUserId(){
        return this.userId;
    }

    getClient(){
        return this.client;
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
            try {
            const mongoURI = this.mongoURI;
            await mongoose.connect(mongoURI).then(()=>{
                console.log('conectado a mognodb')
            })
            const  puppeterOption = {
                    headless: true,
                    executablePath: puppeteer.executablePath(),
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
            }
            const store = new MongoStore({mongoose: mongoose})
            const client = new Client({
                puppeteer: puppeterOption,
                authStrategy: new RemoteAuth({
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
                this.client = client
                this.clientReady = true;
                resolve(client);
              });
        
              client.initialize();    
            } catch (error) {
                reject(error)
            }
            
        
    })
    }
}

export default WhastappClient; 