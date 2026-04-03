export const FPositionEMPTY = 'FPEMP';
export const FPositionDIR = 'FPDIR';
export const FPositionZDIR = 'FPZDIR';
export const FPositionNSO = 'FPNSO';
export const FPositionHRM = 'FPHRM';
export const FPositionOPR = 'FPOPR';
export const FPositionBUH = 'FPBUH';
export const FPositionING = 'FPING';
export const FPositionTHN = 'FPTHN';

const FPositionItemList = [
    { label: "Отсутствует", value: FPositionEMPTY },
    { label: "Директор", value: FPositionDIR },
    { label: "Зам. директора", value: FPositionZDIR },
    { label: "Начальник службы охраны", value: FPositionNSO },
    { label: "Сотрудник отдела кадров", value: FPositionHRM },
    { label: "Дежурный оператор", value: FPositionOPR },
    { label: "Бухгалтер", value: FPositionBUH },
    { label: "Инженер технического отдела", value: FPositionING },
    { label: "Сотрудник технического отдела", value: FPositionTHN },
];

export function getPositionWithCode( value ){
    for ( let i = 0; i < FPositionItemList.length; i++ ) {
        if( FPositionItemList[i].value == value ){
            return FPositionItemList[i];
        }
    }
}

export function getPositionWithCodeList( valueList ){
    var result = [];
    if (!valueList || !Array.isArray(valueList)) return result;
    valueList.forEach(value => {
        if (!value) return;
        let position = getPositionWithCode(value);
        if( position && position.label )
            result.push(position.label)
    });
    return result;
}

export default FPositionItemList;