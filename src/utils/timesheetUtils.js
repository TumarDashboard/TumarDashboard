
import ExcelJS from "exceljs";
import { getDaysFromMonth } from "./dateUtils";
import { FPositionBUH, FPositionHRM, FPositionZDIR } from "../../components/variable/FPositionItemList";

const tableHeader = {
  Index: {
    width: 3.5,
    text: '№\r\nп/п'
  },
  Initials: {
    width: 20.25,
    text: 'Ф.И.О.',
  },
  Days: {
    width: 3.05,
  },
  Count: {
    width: 6.15,
    text: 'кол-во\r\nчас',
  },
  Rate: {
    width: 6.15,
    text: 'тариф',
  },
  RateSumm: {
    width: 7,
    text: 'сумма',
  }
}

const smallFontSize = 10;
const defaultFontSize = 14;
const maxRowCount = 30;
const companyName = 'Тұмар Грант Секьюрити';

const Style = {
  AlignmentMiddleCenter: { vertical: 'middle', horizontal: 'center' },
  AlignmentMiddleLeft: { vertical: 'middle', horizontal: 'left' },
  AlignmentMiddleCenterWrapText: { vertical: 'middle', horizontal: 'center', wrapText: true },
  AlignmentMiddleRightWrapText: { vertical: 'middle', horizontal: 'right', wrapText: true },
  FontDefault: { name: "Calibri", family: 1, size: defaultFontSize },
  FontDefaultBold: { name: "Calibri", family: 1, size: defaultFontSize, bold: true },
  FontSmall: { name: "Calibri", family: 1, size: smallFontSize },
  FontSmallBold: { name: "Calibri", family: 1, size: smallFontSize, bold: true },
  // FillYellow1: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'f4b084' }, },
  // FillYellow2: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'f8cbad' }, },
  // FillYellow3: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffe699' }, },
  // FillYellow4: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fff2cc' }, },
  FillYellow1: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffff00' }, },
  FillYellow2: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffff00' }, },
  FillYellow3: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fff2cc' }, },
  FillYellow4: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' }, },
  BorderThin: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
}

export function timesheetPrintServer( responce, usersData, date ) {

  const daysTimesheet = getDaysFromMonth(date);
  const daysCount = daysTimesheet.length;
  const columns = daysCount + 5;

  // Workbook and worksheet create
  var ExcelJSWorkbook = new ExcelJS.Workbook();

  // 
  for (const NSOdata of responce) {

    const NSOinitials = NSOdata.surname ? [
      NSOdata.surname,
      NSOdata.firstName?.length > 0 ? NSOdata.firstName.charAt(0) + '.' : null,
      NSOdata.patronymic?.length > 0 ? NSOdata.patronymic.charAt(0) + '.' : null,
    ].filter(Boolean).join(' ') : null;

    const worksheet = ExcelJSWorkbook.addWorksheet( NSOinitials ? NSOinitials : "без НСО", {
      pageSetup: {
        paperSize: 9,
        orientation: 'landscape',
        margins: {
          left: 0.25, right: 0.25,
          top: 0.6, bottom: 0.6,
          header: 0.25, footer: 0.25
        }
      },
      headerFooter: {
        oddHeader: `&L&IТабель сотрудников ТОО "${companyName}" за ${date.toLocaleDateString('ru-KZ', { year: 'numeric', month: 'long' })}${NSOinitials ? "&R&IНСО " + NSOinitials : ''}`,
        oddFooter: `&LЗаместитель Директора______________${usersData[FPositionZDIR]}
Начальник службы охраны____________${NSOinitials?NSOinitials:''}&CБухгалтер_________________${usersData[FPositionBUH]}
Инспектор ОК______________${usersData[FPositionHRM]}&U&RДата формирования: &D
страница &P из &N`
      }
    });

    // Header 
    var customCell = worksheet.getCell(1, 2);
    customCell.font = Style.FontDefaultBold;
    customCell.alignment = Style.AlignmentMiddleLeft;
    customCell.value = `НСО: ${NSOinitials ? NSOinitials : 'не указан'}`;
    worksheet.getRow(1).height = (defaultFontSize + 5) * 4;

    customCell = worksheet.getCell(1, 3);
    customCell.font = Style.FontDefaultBold;
    customCell.alignment = Style.AlignmentMiddleRightWrapText;
    customCell.value = `Утверждаю \r\n Директор ТОО \r\n "${companyName}" \r\n _______________Ким А.А.`;
    worksheet.mergeCells(1, 3, 1, columns);
    worksheet.getRow(1).height = (defaultFontSize + 5) * 4;

    customCell = worksheet.getCell(2, 1);
    customCell.font = Style.FontDefaultBold;
    customCell.alignment = Style.AlignmentMiddleCenter;
    customCell.value = `Табель сотрудников ТОО "${companyName}"`;
    worksheet.mergeCells(2, 1, 2, columns);

    customCell = worksheet.getCell(3, 1);
    customCell.font = Style.FontDefaultBold;
    customCell.alignment = Style.AlignmentMiddleCenter;
    customCell.value = `за ${date.toLocaleDateString('ru-KZ', { year: 'numeric', month: 'long' })}`;
    worksheet.mergeCells(3, 1, 3, columns);

    //columns heights
    worksheet.getColumn(1).width = tableHeader.Index.width;
    worksheet.getColumn(2).width = tableHeader.Initials.width;
    worksheet.getColumn(3 + daysCount).width = tableHeader.Count.width;
    worksheet.getColumn(4 + daysCount).width = tableHeader.Rate.width;
    worksheet.getColumn(5 + daysCount).width = tableHeader.RateSumm.width;
    for (let i = 0; i < daysCount; i++) {
      worksheet.getColumn(3 + i).width = tableHeader.Days.width;
    }

    var rowsCount = 0;

    for (const guardPost of NSOdata.guardPosts) {
      
      var tableRowsCount = guardPost.guardRow?.length > 0 ? guardPost.guardRow.length + 5 : 3;

      if (rowsCount > 0) {
        if (rowsCount + tableRowsCount > maxRowCount) {
          if (rowsCount < maxRowCount) {
            worksheet.addRow();
          }
          worksheet.lastRow.addPageBreak();
          rowsCount = 0;
        } else {
          worksheet.addRow();
        }
      }

      rowsCount += tableRowsCount;

      // Наименование таблицы
      var tableCaptionRow = worksheet.addRow([[guardPost.number ? '№' + guardPost.number : null, guardPost.callsign, guardPost.name, guardPost.address].filter(Boolean).join(', ')]);
      var tableCustomCell = tableCaptionRow.getCell(1);
      tableCustomCell.font = Style.FontSmallBold;
      tableCustomCell.alignment = Style.AlignmentMiddleCenter;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;
      worksheet.mergeCells(tableCaptionRow.number, 1, tableCaptionRow.number, columns);

      // Заголовок таблицы
      var tableHeaderRow = worksheet.addRow();
      tableHeaderRow.height = 27;

      tableCustomCell = tableHeaderRow.getCell(1);
      tableCustomCell.value = tableHeader.Index.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      tableCustomCell = tableHeaderRow.getCell(2);
      tableCustomCell.value = tableHeader.Initials.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenter;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      tableCustomCell = tableHeaderRow.getCell(3 + daysCount);
      tableCustomCell.value = tableHeader.Count.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      tableCustomCell = tableHeaderRow.getCell(4 + daysCount);
      tableCustomCell.value = tableHeader.Rate.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      tableCustomCell = tableHeaderRow.getCell(5 + daysCount);
      tableCustomCell.value = tableHeader.RateSumm.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      for (let i = 0; i < daysCount; i++) {
        tableCustomCell = tableHeaderRow.getCell(3 + i);
        tableCustomCell.value = i + 1;
        tableCustomCell.font = Style.FontSmall;
        tableCustomCell.alignment = Style.AlignmentMiddleCenter;
        tableCustomCell.border = Style.BorderThin;
        if( daysTimesheet[i] == 'сб' || daysTimesheet[i] == 'вс' ){
          tableCustomCell.font = Style.FontSmallBold;
          tableCustomCell.fill = Style.FillYellow2;
        }else{
          tableCustomCell.font = Style.FontSmall;
          tableCustomCell.fill = Style.FillYellow1;
        }
      }

      // Тело таблицы
      if (guardPost.guardRow?.length > 0) {

        var totalHoursCount = 0;
        var totalHoursAddressStart = '';
        var totalHoursAddressFinish = '';
        var totalRateSummCount = 0;
        var totalRateSummAddressStart = '';
        var totalRateSummAddressFinish = '';
        var rate = guardPost.rate ? guardPost.rate : 0;
        // Тело таблицы
        guardPost.guardRow.forEach((guard, i) => {

          const tableBodyRow = worksheet.addRow();

          const bodyRowFillColor = i & 1 ? Style.FillYellow3 : Style.FillYellow4;

          var tableBodyCell = tableBodyRow.getCell(1);
          tableBodyCell.value = i + 1;
          tableBodyCell.font = Style.FontSmall;
          tableBodyCell.alignment = Style.AlignmentMiddleCenter;
          tableBodyCell.border = Style.BorderThin;
          tableBodyCell.fill = bodyRowFillColor;

          tableBodyCell = tableBodyRow.getCell(2);
          tableBodyCell.value = [guard.surname, guard.firstName].join(' ');
          tableBodyCell.font = Style.FontSmall;
          tableBodyCell.alignment = Style.AlignmentMiddleLeft;
          tableBodyCell.border = Style.BorderThin;
          tableBodyCell.fill = bodyRowFillColor;

          var hoursCount = 0;

          for (let i = 0; i < daysCount; i++) {

            tableBodyCell = tableBodyRow.getCell(3 + i);
            tableBodyCell.alignment = Style.AlignmentMiddleCenter;
            tableBodyCell.border = Style.BorderThin;

            if( daysTimesheet[i] == 'сб' || daysTimesheet[i] == 'вс' ){
              tableBodyCell.fill = Style.FillYellow3;
            }else{
              tableBodyCell.fill = bodyRowFillColor;
            }
            let index = guard.timesheetDays?.indexOf(i);

            if (index >= 0) {

              let shift = parseInt(guard.timesheetShifts[index]);

              if (shift >= 0) {
                hoursCount += shift;
                tableBodyCell.value = shift;
                tableBodyCell.font = Style.FontSmall;
              } else {
                tableBodyCell.value = guard.timesheetShifts[index];
                tableBodyCell.font = Style.FontSmallBold;
              }

            } else {

              tableBodyCell.font = Style.FontSmall;

            }
          }

          // Сумма часов в строке
          tableBodyCell = tableBodyRow.getCell(3 + daysCount);
          tableBodyCell.value = { formula: `SUM(${tableBodyRow.getCell(3).address}:${tableBodyRow.getCell(2 + daysCount).address})`, result: hoursCount };
          tableBodyCell.font = Style.FontSmallBold;
          tableBodyCell.alignment = Style.AlignmentMiddleCenter;
          tableBodyCell.border = Style.BorderThin;
          tableBodyCell.fill = bodyRowFillColor;

          totalHoursCount += hoursCount;

          if (i == 0) {
            totalHoursAddressStart = tableBodyCell.address;
          }

          if (i == (guardPost.guardRow.length - 1)) {
            totalHoursAddressFinish = tableBodyCell.address;
          }

          // Тариф
          tableBodyCell = tableBodyRow.getCell(4 + daysCount);
          tableBodyCell.value = rate;
          tableBodyCell.font = Style.FontSmallBold;
          tableBodyCell.alignment = Style.AlignmentMiddleCenter;
          tableBodyCell.border = Style.BorderThin;
          tableBodyCell.fill = bodyRowFillColor;

          // Сумма Тариф*часы
          let rateSumm = hoursCount*rate;
          tableBodyCell = tableBodyRow.getCell(5 + daysCount);
          tableBodyCell.value = { formula: `PRODUCT(${tableBodyRow.getCell(3 + daysCount).address}:${tableBodyRow.getCell(4 + daysCount).address})`, result: rateSumm };
          tableBodyCell.font = Style.FontSmallBold;
          tableBodyCell.alignment = Style.AlignmentMiddleCenter;
          tableBodyCell.border = Style.BorderThin;
          tableBodyCell.fill = bodyRowFillColor;

          totalRateSummCount += rateSumm;

          if (i == 0) {
            totalRateSummAddressStart = tableBodyCell.address;
          }

          if (i == (guardPost.guardRow.length - 1)) {
            totalRateSummAddressFinish = tableBodyCell.address;
          }
        })

        // Строка итогов
        const tableFooterRow = worksheet.addRow();

        const bodyFooterFillColor = guardPost.guardRow.length & 1 ? Style.FillYellow3 : Style.FillYellow4;

        var tableFooterCell = tableFooterRow.getCell(1);
        tableFooterCell.font = Style.FontSmall;
        tableFooterCell.alignment = Style.AlignmentMiddleCenter;
        tableFooterCell.border = Style.BorderThin;
        tableFooterCell.fill = bodyFooterFillColor;

        tableFooterCell = tableFooterRow.getCell(2);
        tableFooterCell.font = Style.FontSmall;
        tableFooterCell.alignment = Style.AlignmentMiddleLeft;
        tableFooterCell.border = Style.BorderThin;
        tableFooterCell.fill = bodyFooterFillColor;

        for (let i = 0; i < daysCount; i++) {

          tableFooterCell = tableFooterRow.getCell(3 + i);
          tableFooterCell.font = Style.FontSmall;
          tableFooterCell.alignment = Style.AlignmentMiddleCenter;
          tableFooterCell.border = Style.BorderThin;
          tableFooterCell.fill = bodyFooterFillColor;

        }
        // Итого сумма часов
        tableFooterCell = tableFooterRow.getCell(3 + daysCount);
        tableFooterCell.value = { formula: `SUM(${totalHoursAddressStart}:${totalHoursAddressFinish})`, result: totalHoursCount };
        tableFooterCell.font = Style.FontSmallBold;
        tableFooterCell.alignment = Style.AlignmentMiddleCenter;
        tableFooterCell.border = Style.BorderThin;
        tableFooterCell.fill = bodyFooterFillColor;

        // Итого тариф
        tableFooterCell = tableFooterRow.getCell(4 + daysCount);
        tableFooterCell.font = Style.FontSmallBold;
        tableFooterCell.alignment = Style.AlignmentMiddleCenter;
        tableFooterCell.border = Style.BorderThin;
        tableFooterCell.fill = bodyFooterFillColor;

        // Итого сумма по тарифу
        tableFooterCell = tableFooterRow.getCell(5 + daysCount);
        tableFooterCell.value = { formula: `SUM(${totalRateSummAddressStart}:${totalRateSummAddressFinish})`, result: totalRateSummCount };
        tableFooterCell.font = Style.FontSmallBold;
        tableFooterCell.alignment = Style.AlignmentMiddleCenter;
        tableFooterCell.border = Style.BorderThin;
        tableFooterCell.fill = bodyFooterFillColor;

      } else {

        // Строка отсутствия данных
        var tableEmptyRow = worksheet.addRow();
        var tableEmptyCell = tableEmptyRow.getCell(1);
        tableEmptyCell.value = 'Отсутствуют данные';
        tableEmptyCell.font = Style.FontSmall;
        tableEmptyCell.alignment = Style.AlignmentMiddleCenter;
        tableEmptyCell.fill = Style.FillYellow1;
        tableEmptyCell.border = Style.BorderThin;
        worksheet.mergeCells(tableEmptyRow.number, 1, tableEmptyRow.number, columns);

      }
    }

  }
  
  return ExcelJSWorkbook.xlsx;

}