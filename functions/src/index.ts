import * as functions from 'firebase-functions';
import * as request from "request-promise-native";
import { Firestore } from '@google-cloud/firestore';
import { Draw } from './model/Draw';

const firestore = new Firestore();

/**
 * Get details from a draw
 * @param data Data retrieved from pub/sub
 * @param draw (Optional) Retrieve data from a specific draw
 */
const getDraw = async (data: any, draw?: number) => {
    const drawNumber = !!draw ? draw : '';
    const url = `https://www.lotodicas.com.br/api/${data.type}/${drawNumber}`;

    const raw = await request.get(url);
    return Draw.fromJson(raw);
};

/**
 * Save draw details on firestore
 * @param data Data retrieved from pub/sub
 * @param draw Draw to be saved
 */
const saveDraw = (data: any, draw: Draw) => {
    return firestore
        .collection(data.type)
        .doc(draw.number.toString())
        .set(JSON.parse(JSON.stringify(draw)), { merge: true });
};

/**
 * Get a current draw and save on firestore
 * @param data Data retrieved from pub/sub
 */
const saveCurrentDraw = async (data: any) => {
    const draw = await getDraw(data);

    await saveDraw(data, draw);
    return draw;
}

/**
 * Get a previous draw based on the current draw and save it on firestore.
 * @param data Data retrieved from pub/sub
 * @param currentDraw Current Draw used to find the previous one
 */
const savePreviousDraw = async (data: any, currentDraw: Draw) => {
    const previousDraw = await getDraw(
        data, 
        parseInt(currentDraw.number) - 1
    );

    return saveDraw(data, previousDraw);
}

/**
 * Trigger for crawlers pub/sub.
 */
export const crawlers = functions
    .pubsub
    .topic('crawlers')
    .onPublish(async (message: any) => {

    // Parse data retrieved from Pub/Sub
    const data = JSON.parse(
        Buffer.from(message.data, 'base64').toString()
    );
    
    // Save the current draw and use the returned object to find/save the previous one.
    const currentDraw = await saveCurrentDraw(data);
    return savePreviousDraw(data, currentDraw);
});