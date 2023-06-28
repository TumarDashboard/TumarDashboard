export const FProviderEMPTY = 'Отсутствует';
export const FProviderALTEL = 'Altel';
export const FProviderTELE2 = 'Tele2';
export const FProviderKCELL = 'Kcell';
export const FProviderBEELINE = 'Beeline';

export const HTMLpattern = '(([+]{1}[7]{1})|[78]{1})(([\(]{1}([0-9]{3})[\)]{1})|([0-9]{3}))[\-\s]{0,1}([0-9]{3})[\-\s]{0,1}([0-9]{2})[\-\s]{0,1}([0-9]{2})';
const regexTel = /^(([+]{1}[7]{1})|[78]{1})(([\(]{1}([0-9]{3})[\)]{1})|([0-9]{3}))[\-\s]{0,1}([0-9]{3})[\-\s]{0,1}([0-9]{2})[\-\s]{0,1}([0-9]{2})$/;

const FProviderItemList = [
    { label: FProviderEMPTY, value: FProviderEMPTY },
    { label: FProviderALTEL, value: FProviderALTEL },
    { label: FProviderTELE2, value: FProviderTELE2 },
    { label: FProviderKCELL, value: FProviderKCELL },
    { label: FProviderBEELINE, value: FProviderBEELINE },
];

export function isTelephoneNumber(value){
    return regexTel.test(value);
}

export function getFormatedTelephoneNumberAndProvider(value){

    let reg = regexTel.exec(value);

    let telephoneNumber = `+7(${reg[5]||reg[6]})${reg[7]} ${reg[8]} ${reg[9]}`;

    let provider;

    switch (reg[5]||reg[6]) {
        case '700':
        case '708':
            provider = FProviderALTEL
            break;

        case '707':
        case '747':
            provider = FProviderTELE2
            break;  

        case '701':
        case '702':
        case '775':
        case '778':
            provider = FProviderKCELL
            break;

        case '705':
        case '771':
        case '776':
        case '777':
            provider = FProviderBEELINE
            break;

        default:
            break;
    }
    return [telephoneNumber, provider];
}

export default FProviderItemList;