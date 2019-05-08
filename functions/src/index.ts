import * as functions from 'firebase-functions';
import * as request from "request-promise-native";
import { Firestore } from '@google-cloud/firestore';
import { Draw } from './models/Draw';

const firestore = new Firestore();

const getDraw = async (data: any, draw?: number) => {
    const drawNumber = !!draw ? draw : '';
    const url = `https://www.lotodicas.com.br/api/${data.type}/${drawNumber}`;

    const raw = await request.get(url);
    return Draw.fromJson(raw);
};

const saveDraw = (data: any, draw: Draw) => {
    return firestore
        .collection(data.type)
        .doc(draw.number.toString())
        .set(JSON.parse(JSON.stringify(draw)), { merge: true });
};

const saveCurrentDraw = async (data: any) => {
    const draw = await getDraw(data);

    await saveDraw(data, draw);
    return draw;
}

const savePreviousDraw = async (data: any, draw: Draw) => {
    const previousDraw = await getDraw(
        data, 
        parseInt(draw.number) - 1
    );

    return saveDraw(data, previousDraw);
}

export const crawlers = functions
    .pubsub
    .topic('crawlers')
    .onPublish(async (message: any) => {

    const data = JSON.parse(
        Buffer.from(message.data, 'base64').toString()
    );
    
    const draw = await saveCurrentDraw(data);
    return savePreviousDraw(data, draw);
});