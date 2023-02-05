export function getCurrentMonth() {

    const date = new Date();

    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}`;

}

export function getMonthFromString(stamp) {

    let datePrepare = stamp.split('-');

    datePrepare.pop();
    
    return new Date( datePrepare.join('-') )

}

export function getCurrentTimeStamp() {

    const date = new Date();

    return `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;

}

export function getCurrentDateStamp(selector='') {

    const date = new Date();

    return `${date.getFullYear()}${selector}${(date.getMonth()+1).toString().padStart(2, '0')}${selector}${date.getDate().toString().padStart(2, '0')}`;

}

export function getDateStamp(date) {
    if (!date) {
        return;
    }
    return `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;

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