export const FProviderEMPTY = 'Отсутствует';
export const FProviderALTEL = 'Altel';
export const FProviderTELE2 = 'Tele2';
export const FProviderKCELL = 'Kcell';
export const FProviderBEELINE = 'Beeline';

export const HTMLpattern = '(([+]{1}[7]{1})|[78]{1})(([\\(]{1}([0-9]{3})[\\)]{1})|([0-9]{3}))[\\-\s]{0,1}([0-9]{3})[\\-\s]{0,1}([0-9]{2})[\\-\s]{0,1}([0-9]{2})';

const FProviderItemList = [
    { label: FProviderEMPTY, value: FProviderEMPTY, operatorCode: [] },
    { label: FProviderALTEL, value: FProviderALTEL, operatorCode: ['700','708'] },
    { label: FProviderTELE2, value: FProviderTELE2, operatorCode: ['707','747'] },
    { label: FProviderKCELL, value: FProviderKCELL, operatorCode: ['701','702','775','778'] },
    { label: FProviderBEELINE, value: FProviderBEELINE, operatorCode: ['705','771','776','777'] },
];

var regexOffsiteMSISDN = 0;

export const FProviderRegEx = FProviderItemList.reduce((result,value)=>{
    regexOffsiteMSISDN += value.operatorCode.length;
    result.push(value.operatorCode.reduce((result2,value2)=>{result2.push('('+value2+')'); return result2}, []).join('|'));
    return result;
}, []).filter(Boolean).join('|');

const regexMSISDN = new RegExp(`^(([+]{1}[7]{1})|[78]{0,1})[\\(]{0,1}(${FProviderRegEx})[\\)]{0,1}[\\-\\s]{0,1}([0-9]{3})[\\-\\s]{0,1}([0-9]{2})[\\-\\s]{0,1}([0-9]{2})$`);

const regexICCID = /^8999([0-9]{3})([0-9]{11})([0-9A-Za-z]{0,2})$/

export function isNumberMSISDN(value){
    return regexMSISDN.test(value);
}

export function isNumberICCID(value){
    return regexICCID.test(value);
}

export function getFormatedTelephoneNumberAndProvider(value){

    let reg = regexMSISDN.exec(value);

    let telephoneNumber = `+7(${reg[3]})${reg[4+regexOffsiteMSISDN]} ${reg[5+regexOffsiteMSISDN]} ${reg[6+regexOffsiteMSISDN]}`;

    let provider = FProviderItemList.find(value=>value.operatorCode.includes(reg[3])).value;

    return [telephoneNumber, provider];
}

export default FProviderItemList;