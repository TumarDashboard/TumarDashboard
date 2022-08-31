export const FPositionNSO = 'FPNSO';

const FPositionItemList = [
    { label: "Отсутствует", value: 'FPEMP' },
    { label: "Директор", value: 'FPDIR' },
    { label: "Зам. директора", value: 'FPZDIR' },
    { label: "Начальник службы охраны", value: FPositionNSO },
    { label: "Сотрудник отдела кадров", value: 'FPHRM' },
    { label: "Дежурный оператор", value: 'FPOPR' },
    { label: "Бухгалтер", value: 'FPBUH' },
    { label: "Сотрудник технического отдела", value: 'FPTHN' },
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
    valueList.forEach(value => {
        let label = getPositionWithCode(value).label;
        if( label )
            result.push(label)
    });
    return result;
}

export default FPositionItemList;