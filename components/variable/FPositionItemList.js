const FPositionItemList = [
    { text: "Отсутствует", code: 'FPEMP' },
    { text: "Директор", code: 'FPDIR' },
    { text: "Зам. директора", code: 'FPZDIR' },
    { text: "Начальник службы охраны", code: 'FPNSO' },
    { text: "Сотрудник отдела кадров", code: 'FPHRM' },
    { text: "Дежурный оператор", code: 'FPOPR' },
    { text: "Бухгалтер", code: 'FPBUH' },
    { text: "Сотрудник технического отдела", code: 'FPTHN' },
];

export function getPositionWithCode( code ){
    for ( let i = 0; i < FPositionItemList.length; i++ ) {
        if( FPositionItemList[i].code == code ){
            return FPositionItemList[i];
        }
    }
}

export function getPositionWithCodeList( codeList ){
    var result = [];
    codeList.forEach(code => {
        let text = getPositionWithCode(code).text;
        if( text )
            result.push(text)
    });
    return result;
}

export default FPositionItemList;