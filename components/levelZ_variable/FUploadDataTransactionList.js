export const FUDTransactionArchive = 1;//'Архивация';
export const FUDTransactionNoChange = 2;//'Без изменений';
export const FUDTransactionUpdate = 3;//'Обновление';
export const FUDTransactionReplacement = 4;//'Замена';
export const FUDTransactionIgnore = 5;//'Игнорирование';
export const FUDTransactionAddition = 6;//'Добавление';

export function getBGColorWithAction(value) {
    switch (value) {
        case FUDTransactionArchive:
            return 'bg-red-300';

        case FUDTransactionNoChange:
            return 'bg-color_G';

        case FUDTransactionUpdate:
            return 'bg-green-100';

        case FUDTransactionReplacement:
            return 'bg-orange-300';

        case FUDTransactionIgnore:
            return 'bg-blue-100';

        case FUDTransactionAddition:
            return 'bg-slate-100';

        default:
            return 'bg-color_G';
    }
}