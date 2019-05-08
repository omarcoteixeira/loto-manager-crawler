export class Draw {

    number: string;
    date: string;
    numbers: Array<number>;
    accumulated: boolean;
    accumulatedValue: number;
    extimatedValue: number;
    nextDate: string

    constructor(
        number: string,
        date: string,
        numbers: Array<number>,
        accumulated: boolean,
        accumulatedValue: number,
        extimatedValue: number,
        nextDate: string) {

        this.number = number;
        this.date = date;
        this.numbers = numbers;
        this.accumulated = accumulated;
        this.accumulatedValue = accumulatedValue;
        this.extimatedValue = extimatedValue;
        this.nextDate = nextDate;
    }

    static fromJson(data: any) : Draw {
        const draw = JSON.parse(data);

        return new Draw(
            draw.numero,
            draw.data,
            draw.sorteio,
            draw.acumulado === 'sim',
            draw.valor_acumulado,
            draw.proximo_estimativa,
            draw.proximo_data
        );
    }
}