export function getCurrentMonth() {

    const date = new Date();

    return `${date.getFullYear()}-${(date.getMonth()).toString().padStart(2, '0')}`;

}

export function getCurrentTimeStamp() {

    const date = new Date();

    return `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;

}

const daysOfWeek = ["вс","пн", "вт", "ср", "чт", "пт", "сб" ];

export function getDaysFromMonth(month){
    
    const date = new Date(month);

    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const daysCount = lastDay.getDate();

    const firstDayOfWeek = date.getDay();

    var result = [];

    for( var i=0; i<daysCount; i++){
        result.push(daysOfWeek[(i+firstDayOfWeek)%7])
    }

    return result;
    // console.log(result);
}