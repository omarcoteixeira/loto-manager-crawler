import * as functions from 'firebase-functions';
import * as request from "request-promise-native";
import { Firestore } from '@google-cloud/firestore';

const firestore = new Firestore();

const parseDrawData = (draw: any) => {
    return {
        number: draw.numero,
        date: draw.data,
        numbers: draw.sorteio,
        accumulated: draw.acumulado,
        accumulatedValue: draw.valor_acumulado,
        extimatedValue: draw.proximo_estimativa,
        nextDate: draw.proximo_data
    }
};

export const crawlers = functions.pubsub.topic('crawlers').onPublish(async (message: any) => {

    const data = JSON.parse(
        Buffer.from(message.data, 'base64').toString()
    );

    const url = `https://www.lotodicas.com.br/api/${data.type}`;
    const raw = JSON.parse(
        await request.get(url)
    );

    const result = parseDrawData(raw);
    return firestore
        .collection(`draws`)
        .doc(data.type)
        .collection(result.number.toString())
        .add(result);
});
