import guardPostService from "../src/service/guardPostService";

const data = [
    {number: 788, callsign: "Акбулак", manager: "63051625739d936356444e32"},
    {number: 770, callsign: "Посольство", manager: "63051625739d936356444e32"},
    {number: 888, callsign: "Коттедж Жылыой", manager: "63051625739d936356444e32"},
    {number: 769, callsign: "Ишим", manager: "63051625739d936356444e32"},
    {number: 704, callsign: "Детский сад", manager: "63051625739d936356444e32"},
    {number: 804, callsign: "Детский сад  (Ночной)", manager: "63051625739d936356444e32"},
    {number: 752, callsign: "Жаскала", manager: "63051625739d936356444e32"},
    {number: 111, callsign: "Лесозавод", manager: "63051625739d936356444e32"},
    {number: 708, callsign: "Мади-ТС", manager: "63051394739d936356444dc1"},
    {number: 748, callsign: "Косшы", manager: "63051394739d936356444dc1"},
    {number: 789, callsign: "Мебельный центр ", manager: "63051394739d936356444dc1"},
    {number: 707, callsign: "Мади", manager: "63051394739d936356444dc1"},
    {number: null, callsign: "МГБР", manager: "63051394739d936356444dc1"},
    {number: null, callsign: "Ресторан ", manager: "63051394739d936356444dc1"},
    {number: 773, callsign: "станция 40-ая", manager: "63051394739d936356444dc1"},
    {number: 772, callsign: "станция  40-ая", manager: "63051394739d936356444dc1"},
    {number: 702, callsign: "Восток Инвест", manager: "63051394739d936356444dc1"},
    {number: 723, callsign: "АИС Сейфуллина", manager: "63051394739d936356444dc1"},
    {number: 751, callsign: "КазГЮА ночной", manager: "63051394739d936356444dc1"},
    {number: 716, callsign: "АИС Сейфуллина", manager: "63051394739d936356444dc1"},
    {number: 757, callsign: "АИС Сейфуллина", manager: "63051394739d936356444dc1"},
    {number: 765, callsign: "КазГЮА", manager: "63051394739d936356444dc1"},
    {number: 764, callsign: "КазГЮА", manager: "63051394739d936356444dc1"},
    {number: 760, callsign: "Офис АИС", manager: "63051394739d936356444dc1"},
    {number: 750, callsign: "Косшы", manager: "63051394739d936356444dc1"},
    {number: null, callsign: "МГБР-боец", manager: "63051394739d936356444dc1"},
    {number: 749, callsign: "Косшы", manager: "63051394739d936356444dc1"},
    {number: 725, callsign: "База АИС", manager: "63051394739d936356444dc1"},
    {number: null, callsign: "Миллениум Парк", manager: "63051866739d936356444ed9"},
    {number: 790, callsign: "Сауна", manager: "63051866739d936356444ed9"},
    {number: 777, callsign: "Автозапчасти", manager: "63051866739d936356444ed9"},
    {number: 755, callsign: "Блок В", manager: "63051866739d936356444ed9"},
    {number: 758, callsign: "Софиевка", manager: "63051866739d936356444ed9"},
    {number: 703, callsign: "АИС Умит", manager: "63051866739d936356444ed9"},
    {number: 754, callsign: "Коктал", manager: "63051866739d936356444ed9"},
    {number: 705, callsign: "Мебельный", manager: "63051866739d936356444ed9"},
    {number: 766, callsign: "Тельмана", manager: "63051866739d936356444ed9"},
    {number: 780, callsign: "Тельмана", manager: "63051866739d936356444ed9"},
    {number: 753, callsign: "Софиевка", manager: "63051866739d936356444ed9"},
    {number: 768, callsign: "Софиевка", manager: "63051866739d936356444ed9"},
    {number: 774, callsign: "Софиевка", manager: "63051866739d936356444ed9"},
    {number: 759, callsign: "Сарыоба", manager: "63051797739d936356444e88"},
    {number: 761, callsign: "Сарыоба", manager: "63051797739d936356444e88"},
    {number: 762, callsign: "Сарыоба", manager: "63051797739d936356444e88"},
    {number: 756, callsign: "Сарыоба", manager: "63051797739d936356444e88"},
    {number: 767, callsign: "Сарыоба", manager: "63051797739d936356444e88"},
    {number: 771, callsign: "Сарыоба", manager: "63051797739d936356444e88"},
    {number: 763, callsign: "Сарыоба", manager: "63051797739d936356444e88"},    
];

export default async function loadGuardPostDataFromExcel(){
    try {
        for (let i = 0; i < data.length; i++) {
            if(data[i]['number']){
                await guardPostService.createGuardPost(data[i])
            }else{
                delete data[i]['number'];
                await guardPostService.createGuardPost(data[i])
            }
        }
    } catch (error) {
        console.log(error);
    }
}