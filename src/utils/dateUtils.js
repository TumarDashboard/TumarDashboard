export function getCurrentMonth() {

    const date = new Date();

    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}`;

}