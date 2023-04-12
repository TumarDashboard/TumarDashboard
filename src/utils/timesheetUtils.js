
import ExcelJS from "exceljs";
import { getDaysFromMonth } from "./dateUtils";
import { FPositionBUH, FPositionHRM, FPositionZDIR } from "../../components/levelZ_variable/FPositionItemList";
import { isFloat, ceil10, round10 } from "./mathUtils";
import { mapValue } from "./arrayUtils";

const reportFullTableHeader = {
  Index: {
    width: 3.5,
    text: '№\r\nп/п'
  },
  Initials: {
    width: 20.25,
    text: 'Ф.И.О.',
  },
  Days: {
    width: 2.65,
  },
  Count: {
    width: 5.85,
    text: 'кол-во\r\nчас',
  },
  Rate: {
    width: 9.00,
    text: 'тариф',
  },
  RateSumm: {
    width: 10.00,
    text: 'сумма',
  },
  GuardPostNumber: {
    width: 6.00,
    text: '№',
  },
  GuardPostCallsignNameAddres: {
    width: 65.00,
    text: 'Наименование и адрес',
  },
  InitialsGuard: {
    width: 20.25,
    text: 'Ф.И.О. охранника',
  },
}

const reportBuhTableHeader = {
  Index: {
    width: 3.5,
    text: '№',
  },
  Initials: {
    width: 20.25,
    text: 'Ф. И. О.',
  },
  Object: {
    width: 9.00,
    text: 'объект',
  },
  Summ: {
    width: 9.00,
    text: 'сумма',
  },
  Taxes: {
    width: 9.00,
    text: 'налоги',
  },
  Advance: {
    width: 9.00,
    text: 'аванс',
  },
  Payoff: {
    width: 9.00,
    text: 'к выплате',
  },
  Sign: {
    width: 9.00,
    text: 'подпись',
  },
  Date: {
    width: 9.00,
    text: 'дата',
  },
  SignInitials: {
    width: 9.00,
    text: 'фамилия',
  },
}

const smallFontSize = 9;
const mediumFontSize = 12;
const defaultFontSize = 14;
const maxRowFullCount = 28;
const maxRowBuhCount = 48;
const companyName = 'Тұмар Гранд Секьюрити';

const Style = {
  AlignmentMiddleCenter: { vertical: 'middle', horizontal: 'center' },
  AlignmentMiddleLeft: { vertical: 'middle', horizontal: 'left' },
  AlignmentMiddleRightText: { vertical: 'middle', horizontal: 'right' },
  AlignmentMiddleCenterWrapText: { vertical: 'middle', horizontal: 'center', wrapText: true },
  AlignmentMiddleRightWrapText: { vertical: 'middle', horizontal: 'right', wrapText: true },
  FontDefault: { name: "Calibri", family: 1, size: defaultFontSize },
  FontDefaultBold: { name: "Calibri", family: 1, size: defaultFontSize, bold: true },
  FontMediumBold: { name: "Calibri", family: 1, size: mediumFontSize, bold: true },
  FontSmall: { name: "Calibri", family: 1, size: smallFontSize },
  FontSmallBold: { name: "Calibri", family: 1, size: smallFontSize, bold: true },
  FontSmallBoldRed: { name: "Calibri", family: 1, size: smallFontSize, bold: true, color: { argb: 'ff0000' } },
  // FillYellow1: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'f4b084' }, },
  // FillYellow2: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'f8cbad' }, },
  // FillYellow3: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffe699' }, },
  // FillYellow4: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fff2cc' }, },
  FillYellow1: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffff00' }, },
  FillYellow2: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffff00' }, },
  FillYellow3: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fff2cc' }, },
  FillYellow4: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' }, },
  FillYellow5: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E4D8B4' }, },
  FillGreen1: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6E0B4' }, },
  FillBlue1: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'B4C6E7' }, },
  BorderThin: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
}

export function timesheetPrintServer(responce, usersData, date) {

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

    const worksheet = ExcelJSWorkbook.addWorksheet(NSOinitials ? NSOinitials : "без НСО", {
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
Начальник службы охраны____________${NSOinitials ? NSOinitials : ''}&CБухгалтер_________________${usersData[FPositionBUH]}
Инспектор ОК______________${usersData[FPositionHRM]}&U&RДата формирования: &D
страница &P из &N`
      }
    });

    // Header 
    let headerCellCenter = Math.trunc(columns / 2);
    var customCell = worksheet.getCell(1, 2);
    customCell.font = Style.FontDefaultBold;
    customCell.alignment = Style.AlignmentMiddleLeft;
    customCell.value = `НСО: ${NSOinitials ? NSOinitials : 'не указан'}`;
    worksheet.mergeCells(1, 2, 1, headerCellCenter - 1);

    customCell = worksheet.getCell(1, headerCellCenter);
    customCell.font = Style.FontDefaultBold;
    customCell.alignment = Style.AlignmentMiddleRightWrapText;
    customCell.value = `Утверждаю \r\n Директор ТОО \r\n "${companyName}" \r\n _______________Ким А.А.`;
    worksheet.mergeCells(1, headerCellCenter, 1, columns);
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
    worksheet.getColumn(1).width = reportFullTableHeader.Index.width;
    worksheet.getColumn(2).width = reportFullTableHeader.Initials.width;
    worksheet.getColumn(3 + daysCount).width = reportFullTableHeader.Count.width;
    worksheet.getColumn(4 + daysCount).width = reportFullTableHeader.Rate.width;
    worksheet.getColumn(5 + daysCount).width = reportFullTableHeader.RateSumm.width;
    for (let i = 0; i < daysCount; i++) {
      worksheet.getColumn(3 + i).width = reportFullTableHeader.Days.width;
    }

    var rowsCount = 0;

    for (const guardPost of NSOdata.guardPosts) {

      var tableRowsCount = guardPost.element?.length > 0 ? guardPost.element.length + 5 : 3;

      if (rowsCount > 0) {
        if (rowsCount + tableRowsCount > maxRowFullCount) {
          if (rowsCount < maxRowFullCount) {
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
      tableCustomCell.value = reportFullTableHeader.Index.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      tableCustomCell = tableHeaderRow.getCell(2);
      tableCustomCell.value = reportFullTableHeader.Initials.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenter;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      tableCustomCell = tableHeaderRow.getCell(3 + daysCount);
      tableCustomCell.value = reportFullTableHeader.Count.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      tableCustomCell = tableHeaderRow.getCell(4 + daysCount);
      tableCustomCell.value = reportFullTableHeader.Rate.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      tableCustomCell = tableHeaderRow.getCell(5 + daysCount);
      tableCustomCell.value = reportFullTableHeader.RateSumm.text;
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
        if (daysTimesheet[i] == 'сб' || daysTimesheet[i] == 'вс') {
          tableCustomCell.font = Style.FontSmallBold;
          tableCustomCell.fill = Style.FillYellow2;
        } else {
          tableCustomCell.font = Style.FontSmall;
          tableCustomCell.fill = Style.FillYellow1;
        }
      }

      // Тело таблицы
      if (guardPost.element?.length > 0) {

        var totalHoursCount = 0;
        var totalHoursAddressStart = '';
        var totalHoursAddressFinish = '';
        var totalRateSummCount = 0;
        var totalRateSummAddressStart = '';
        var totalRateSummAddressFinish = '';
        const totalDaysHoursCount = new Array(daysCount).fill(0);
        const totalDaysHoursCountAddressStart = new Array(daysCount).fill('');
        const totalDaysHoursCountAddressFinish = new Array(daysCount).fill('');
        var rate = guardPost.rate ? guardPost.rate : 0;
        // Тело таблицы
        guardPost.element.forEach((guard, index) => {

          const tableBodyRow = worksheet.addRow();

          const bodyRowFillColor = index & 1 ? Style.FillYellow3 : Style.FillYellow4;

          var tableBodyCell = tableBodyRow.getCell(1);
          tableBodyCell.value = index + 1;
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

            if (daysTimesheet[i] == 'сб' || daysTimesheet[i] == 'вс') {
              tableBodyCell.fill = Style.FillYellow3;
            } else {
              tableBodyCell.fill = bodyRowFillColor;
            }

            if (index == 0) {
              totalDaysHoursCountAddressStart[i] = tableBodyCell.address;
            }
            if (index == (guardPost.element.length - 1)) {
              totalDaysHoursCountAddressFinish[i] = tableBodyCell.address;
            }

            let indexOfDay = guard.timesheetDays?.indexOf(i);

            if (indexOfDay >= 0) {

              let shift = parseInt(guard.timesheetShifts[indexOfDay]);

              if (shift >= 0) {
                hoursCount += shift;
                tableBodyCell.value = shift;
                tableBodyCell.font = Style.FontSmall;

                totalDaysHoursCount[i] += shift;

              } else {
                tableBodyCell.value = guard.timesheetShifts[indexOfDay];
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

          if (index == 0) {
            totalHoursAddressStart = tableBodyCell.address;
          }

          if (index == (guardPost.element.length - 1)) {
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
          let rateSumm = hoursCount * rate;
          tableBodyCell = tableBodyRow.getCell(5 + daysCount);
          tableBodyCell.value = { formula: `PRODUCT(${tableBodyRow.getCell(3 + daysCount).address}:${tableBodyRow.getCell(4 + daysCount).address})`, result: rateSumm };
          tableBodyCell.font = Style.FontSmallBold;
          tableBodyCell.alignment = Style.AlignmentMiddleCenter;
          tableBodyCell.border = Style.BorderThin;
          tableBodyCell.fill = bodyRowFillColor;

          totalRateSummCount += rateSumm;

          if (index == 0) {
            totalRateSummAddressStart = tableBodyCell.address;
          }

          if (index == (guardPost.element.length - 1)) {
            totalRateSummAddressFinish = tableBodyCell.address;
          }
        })

        // Строка итогов
        const tableFooterRow = worksheet.addRow();

        const bodyFooterFillColor = guardPost.element.length & 1 ? Style.FillYellow3 : Style.FillYellow4;

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

        // console.log(totalDaysHoursCountAddressStart);
        // console.log(totalDaysHoursCountAddressFinish);
        for (let i = 0; i < daysCount; i++) {

          tableFooterCell = tableFooterRow.getCell(3 + i);
          tableFooterCell.font = Style.FontSmall;
          tableFooterCell.alignment = Style.AlignmentMiddleCenter;
          tableFooterCell.border = Style.BorderThin;
          tableFooterCell.fill = bodyFooterFillColor;
          tableFooterCell.value = {
            formula: `SUM(${totalDaysHoursCountAddressStart[i]}:${totalDaysHoursCountAddressFinish[i]})`,
            result: totalDaysHoursCount[i] > 0 ? totalDaysHoursCount[i] : '',
          };
          // if( totalDaysHoursCount[i] > 0)
          //   tableFooterCell.value = totalDaysHoursCount[i];
          // console.log(`SUM(${totalDaysHoursCountAddressStart.col}${i+totalDaysHoursCountAddressStart.row}:${totalDaysHoursCountAddressFinish.col}${i+totalDaysHoursCountAddressFinish.row})`);
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

export function timesheetExcellForDay(responce, date) {

  // Workbook and worksheet create
  const ExcelJSWorkbook = new ExcelJS.Workbook();

  const worksheet = ExcelJSWorkbook.addWorksheet(date, {
    pageSetup: {
      paperSize: 9,
      orientation: 'portrait',
      margins: {
        left: 0.25, right: 0.25,
        top: 0.6, bottom: 0.6,
        header: 0.25, footer: 0.25
      }
    }
  });

  // Header 
  var customCell = worksheet.getCell(1, 1);
  customCell.font = Style.FontDefaultBold;
  customCell.alignment = Style.AlignmentMiddleCenter;
  customCell.value = `Список охранников заступивших на смену ${new Date(date).toLocaleString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}`;
  worksheet.mergeCells(1, 1, 1, 3);

  worksheet.getColumn(1).width = reportFullTableHeader.GuardPostNumber.width;
  worksheet.getColumn(2).width = reportFullTableHeader.GuardPostCallsignNameAddres.width;
  worksheet.getColumn(3).width = reportFullTableHeader.InitialsGuard.width;

  // Заголовок таблицы
  var tableHeaderRow = worksheet.addRow();
  tableHeaderRow.height = 27;

  var tableHeaderCell = tableHeaderRow.getCell(1);
  tableHeaderCell.value = reportFullTableHeader.GuardPostNumber.text;
  tableHeaderCell.font = Style.FontSmallBold;
  tableHeaderCell.alignment = Style.AlignmentMiddleCenterWrapText;
  tableHeaderCell.fill = Style.FillYellow1;
  tableHeaderCell.border = Style.BorderThin;

  tableHeaderCell = tableHeaderRow.getCell(2);
  tableHeaderCell.value = reportFullTableHeader.GuardPostCallsignNameAddres.text;
  tableHeaderCell.font = Style.FontSmallBold;
  tableHeaderCell.alignment = Style.AlignmentMiddleCenter;
  tableHeaderCell.fill = Style.FillYellow1;
  tableHeaderCell.border = Style.BorderThin;

  tableHeaderCell = tableHeaderRow.getCell(3);
  tableHeaderCell.value = reportFullTableHeader.InitialsGuard.text;
  tableHeaderCell.font = Style.FontSmallBold;
  tableHeaderCell.alignment = Style.AlignmentMiddleCenterWrapText;
  tableHeaderCell.fill = Style.FillYellow1;
  tableHeaderCell.border = Style.BorderThin;

  for (const NSOdata of responce) {

    const NSOinitials = NSOdata.surname ? [
      NSOdata.surname,
      NSOdata.firstName ? NSOdata.firstName : null,
      NSOdata.patronymic ? NSOdata.patronymic : null,
    ].filter(Boolean).join(' ') : null;

    var tableCaptionRow = worksheet.addRow();

    var tableCustomCell = tableCaptionRow.getCell(1);
    tableCustomCell.value = NSOinitials ? "НСО " + NSOinitials : "Без НСО";
    tableCustomCell.font = Style.FontSmallBold;
    tableCustomCell.alignment = Style.AlignmentMiddleCenter;
    tableCustomCell.fill = Style.FillYellow3;
    tableCustomCell.border = Style.BorderThin;
    worksheet.mergeCells(tableCaptionRow.number, 1, tableCaptionRow.number, 3);

    for (const guardPost of NSOdata.guardPosts) {

      const tableBodyRow = worksheet.addRow();

      var tableBodyCell = tableBodyRow.getCell(1);
      tableBodyCell.value = guardPost.number;
      tableBodyCell.font = Style.FontSmall;
      tableBodyCell.alignment = Style.AlignmentMiddleCenter;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = Style.FillYellow4;

      tableBodyCell = tableBodyRow.getCell(2);
      tableBodyCell.value = [guardPost.callsign, guardPost.name, guardPost.address].filter(Boolean).join(', ');
      tableBodyCell.font = Style.FontSmall;
      tableBodyCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = Style.FillYellow4;

      tableBodyCell = tableBodyRow.getCell(3);
      tableBodyCell.value = guardPost.element?.length > 0 ?
        guardPost.element.map(guard => {
          return guard.surname ? [
            guard.surname,
            guard.firstName?.length > 0 ? guard.firstName.charAt(0) + '.' : null,
            guard.patronymic?.length > 0 ? guard.patronymic.charAt(0) + '.' : null,
          ].filter(Boolean).join(' ') : null;
        }).filter(Boolean).join('\r\n')
        : null;
      tableBodyCell.font = Style.FontSmall;
      tableBodyCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = Style.FillYellow4;

    }

  }

  return ExcelJSWorkbook.xlsx;

}

export function timesheetExcellForMonthPart(NSOinitials, guardPosts, usersData, date) {

  const daysTimesheet = getDaysFromMonth(date);
  const daysCount = daysTimesheet.length;
  const columns = daysCount + 5;

  // Workbook and worksheet create
  var ExcelJSWorkbook = new ExcelJS.Workbook();

  // 

  const worksheet = ExcelJSWorkbook.addWorksheet(NSOinitials ? NSOinitials : "без НСО", {
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
Начальник службы охраны____________${NSOinitials ? NSOinitials : ''}&CБухгалтер_________________${usersData[FPositionBUH]}
Инспектор ОК______________${usersData[FPositionHRM]}&U&RДата формирования: &D
страница &P из &N`
    }
  });

  // Header 
  let headerCellCenter = Math.trunc(columns / 2);
  var customCell = worksheet.getCell(1, 2);
  customCell.font = Style.FontDefaultBold;
  customCell.alignment = Style.AlignmentMiddleLeft;
  customCell.value = `НСО: ${NSOinitials ? NSOinitials : 'не указан'}`;
  worksheet.mergeCells(1, 2, 1, headerCellCenter - 1);

  customCell = worksheet.getCell(1, headerCellCenter);
  customCell.font = Style.FontDefaultBold;
  customCell.alignment = Style.AlignmentMiddleRightWrapText;
  customCell.value = `Утверждаю \r\n Директор ТОО \r\n "${companyName}" \r\n _______________Ким А.А.`;
  worksheet.mergeCells(1, headerCellCenter, 1, columns);
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
  worksheet.getColumn(1).width = reportFullTableHeader.Index.width;
  worksheet.getColumn(2).width = reportFullTableHeader.Initials.width;
  worksheet.getColumn(3 + daysCount).width = reportFullTableHeader.Count.width;
  worksheet.getColumn(4 + daysCount).width = reportFullTableHeader.Rate.width;
  worksheet.getColumn(5 + daysCount).width = reportFullTableHeader.RateSumm.width;
  for (let i = 0; i < daysCount; i++) {
    worksheet.getColumn(3 + i).width = reportFullTableHeader.Days.width;
  }

  var rowsCount = 0;

  for (const guardPost of guardPosts) {
    var tableRowsCount = guardPost.element?.length > 0 ? guardPost.element.length + 5 : 3;

    if (rowsCount > 0) {
      if (rowsCount + tableRowsCount > maxRowFullCount) {
        if (rowsCount < maxRowFullCount) {
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
    tableCustomCell.value = reportFullTableHeader.Index.text;
    tableCustomCell.font = Style.FontSmall;
    tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
    tableCustomCell.fill = Style.FillYellow1;
    tableCustomCell.border = Style.BorderThin;

    tableCustomCell = tableHeaderRow.getCell(2);
    tableCustomCell.value = reportFullTableHeader.Initials.text;
    tableCustomCell.font = Style.FontSmall;
    tableCustomCell.alignment = Style.AlignmentMiddleCenter;
    tableCustomCell.fill = Style.FillYellow1;
    tableCustomCell.border = Style.BorderThin;

    tableCustomCell = tableHeaderRow.getCell(3 + daysCount);
    tableCustomCell.value = reportFullTableHeader.Count.text;
    tableCustomCell.font = Style.FontSmall;
    tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
    tableCustomCell.fill = Style.FillYellow1;
    tableCustomCell.border = Style.BorderThin;

    tableCustomCell = tableHeaderRow.getCell(4 + daysCount);
    tableCustomCell.value = reportFullTableHeader.Rate.text;
    tableCustomCell.font = Style.FontSmall;
    tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
    tableCustomCell.fill = Style.FillYellow1;
    tableCustomCell.border = Style.BorderThin;

    tableCustomCell = tableHeaderRow.getCell(5 + daysCount);
    tableCustomCell.value = reportFullTableHeader.RateSumm.text;
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
      if (daysTimesheet[i] == 'сб' || daysTimesheet[i] == 'вс') {
        tableCustomCell.font = Style.FontSmallBold;
        tableCustomCell.fill = Style.FillYellow2;
      } else {
        tableCustomCell.font = Style.FontSmall;
        tableCustomCell.fill = Style.FillYellow1;
      }
    }

    // Тело таблицы
    if (guardPost.element?.length > 0) {

      var totalHoursCount = 0;
      var totalHoursAddressStart = '';
      var totalHoursAddressFinish = '';
      var totalRateSummCount = 0;
      var totalRateSummAddressStart = '';
      var totalRateSummAddressFinish = '';
      const totalDaysHoursCount = new Array(daysCount).fill(0);
      const totalDaysHoursCountAddressStart = new Array(daysCount).fill('');
      const totalDaysHoursCountAddressFinish = new Array(daysCount).fill('');
      var rate = guardPost.rate ? guardPost.rate : 0;
      // Тело таблицы
      guardPost.element.forEach((guard, index) => {

        const tableBodyRow = worksheet.addRow();

        const bodyRowFillColor = index & 1 ? Style.FillYellow3 : Style.FillYellow4;

        var tableBodyCell = tableBodyRow.getCell(1);
        tableBodyCell.value = index + 1;
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

          if (daysTimesheet[i] == 'сб' || daysTimesheet[i] == 'вс') {
            tableBodyCell.fill = Style.FillYellow3;
          } else {
            tableBodyCell.fill = bodyRowFillColor;
          }

          if (index == 0) {
            totalDaysHoursCountAddressStart[i] = tableBodyCell.address;
          }
          if (index == (guardPost.element.length - 1)) {
            totalDaysHoursCountAddressFinish[i] = tableBodyCell.address;
          }

          let indexOfDay = guard.timesheetDays?.indexOf(i);

          if (indexOfDay >= 0) {

            let shift = parseInt(guard.timesheetShifts[indexOfDay]);

            if (shift >= 0) {
              hoursCount += shift;
              tableBodyCell.value = shift;
              tableBodyCell.font = Style.FontSmall;

              totalDaysHoursCount[i] += shift;

            } else {
              tableBodyCell.value = guard.timesheetShifts[indexOfDay];
              tableBodyCell.font = Style.FontSmallBold;
            }

          } else {

            tableBodyCell.font = Style.FontSmall;

          }
        }

        // Сумма часов в строке
        tableBodyCell = tableBodyRow.getCell(3 + daysCount);
        tableBodyCell.value = { formula: `SUM(${tableBodyRow.getCell(3).address}:${tableBodyRow.getCell(2 + daysCount).address})`, result: hoursCount };
        tableBodyCell.numFmt = isFloat(hoursCount) ? '#.####' : '#';
        tableBodyCell.font = Style.FontSmallBold;
        tableBodyCell.alignment = Style.AlignmentMiddleCenter;
        tableBodyCell.border = Style.BorderThin;
        tableBodyCell.fill = bodyRowFillColor;

        totalHoursCount += hoursCount;

        if (index == 0) {
          totalHoursAddressStart = tableBodyCell.address;
        }

        if (index == (guardPost.element.length - 1)) {
          totalHoursAddressFinish = tableBodyCell.address;
        }

        // Тариф
        tableBodyCell = tableBodyRow.getCell(4 + daysCount);
        tableBodyCell.value = rate;
        tableBodyCell.numFmt = isFloat(rate) ? '#.####' : '#';
        tableBodyCell.font = Style.FontSmallBold;
        tableBodyCell.alignment = Style.AlignmentMiddleCenter;
        tableBodyCell.border = Style.BorderThin;
        tableBodyCell.fill = bodyRowFillColor;

        // Сумма Тариф*часы
        let rateSumm = round10(hoursCount * rate);
        tableBodyCell = tableBodyRow.getCell(5 + daysCount);
        tableBodyCell.value = {
          formula: `ROUND(PRODUCT(${tableBodyRow.getCell(3 + daysCount).address}:${tableBodyRow.getCell(4 + daysCount).address}), -1)`,
          result: rateSumm
        };
        tableBodyCell.numFmt = '#';
        tableBodyCell.font = Style.FontSmallBold;
        tableBodyCell.alignment = Style.AlignmentMiddleCenter;
        tableBodyCell.border = Style.BorderThin;
        tableBodyCell.fill = bodyRowFillColor;

        totalRateSummCount += rateSumm;

        if (index == 0) {
          totalRateSummAddressStart = tableBodyCell.address;
        }

        if (index == (guardPost.element.length - 1)) {
          totalRateSummAddressFinish = tableBodyCell.address;
        }
      })

      // Строка итогов
      const tableFooterRow = worksheet.addRow();

      const bodyFooterFillColor = guardPost.element.length & 1 ? Style.FillYellow3 : Style.FillYellow4;

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

      // console.log(totalDaysHoursCountAddressStart);
      // console.log(totalDaysHoursCountAddressFinish);
      for (let i = 0; i < daysCount; i++) {

        tableFooterCell = tableFooterRow.getCell(3 + i);
        tableFooterCell.font = Style.FontSmall;
        tableFooterCell.alignment = Style.AlignmentMiddleCenter;
        tableFooterCell.border = Style.BorderThin;
        tableFooterCell.fill = bodyFooterFillColor;
        tableFooterCell.value = {
          formula: `SUM(${totalDaysHoursCountAddressStart[i]}:${totalDaysHoursCountAddressFinish[i]})`,
          result: totalDaysHoursCount[i] > 0 ? totalDaysHoursCount[i] : '',
        };
        tableFooterCell.numFmt = isFloat(totalDaysHoursCount[i]) ? '#.####' : '#';
        // if( totalDaysHoursCount[i] > 0)
        //   tableFooterCell.value = totalDaysHoursCount[i];
        // console.log(`SUM(${totalDaysHoursCountAddressStart.col}${i+totalDaysHoursCountAddressStart.row}:${totalDaysHoursCountAddressFinish.col}${i+totalDaysHoursCountAddressFinish.row})`);
      }
      // Итого сумма часов
      tableFooterCell = tableFooterRow.getCell(3 + daysCount);
      tableFooterCell.value = { formula: `SUM(${totalHoursAddressStart}:${totalHoursAddressFinish})`, result: totalHoursCount };
      tableFooterCell.numFmt = isFloat(totalHoursCount) ? '#.####' : '#';
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
      tableFooterCell.numFmt = '#';
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



  return ExcelJSWorkbook.xlsx;

}

export function timesheetExcellForMonthFull(responce, usersData, date) {

  const daysTimesheet = getDaysFromMonth(date);
  const daysCount = daysTimesheet.length;
  const columns = daysCount + 5;

  // Workbook and worksheet create
  const ExcelJSWorkbook = new ExcelJS.Workbook();

  // Данные отчета по охранникам
  // var GuardsData = [];

  for (const NSOdata of responce) {

    const NSOinitials = NSOdata.surname ? [
      NSOdata.surname,
      NSOdata.firstName?.length > 0 ? NSOdata.firstName.charAt(0) + '.' : null,
      NSOdata.patronymic?.length > 0 ? NSOdata.patronymic.charAt(0) + '.' : null,
    ].filter(Boolean).join(' ') : null;

    const worksheet = ExcelJSWorkbook.addWorksheet(NSOinitials ? NSOinitials : "без НСО", {
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
Начальник службы охраны____________${NSOinitials ? NSOinitials : ''}&CБухгалтер_________________${usersData[FPositionBUH]}
Инспектор ОК______________${usersData[FPositionHRM]}&U&RДата формирования: &D
страница &P из &N`
      }
    });

    // Header 
    let headerCellCenter = Math.trunc(columns / 2);
    var customCell = worksheet.getCell(1, 2);
    customCell.font = Style.FontDefaultBold;
    customCell.alignment = Style.AlignmentMiddleLeft;
    customCell.value = `НСО: ${NSOinitials ? NSOinitials : 'не указан'}`;
    worksheet.mergeCells(1, 2, 1, headerCellCenter - 1);

    customCell = worksheet.getCell(1, headerCellCenter);
    customCell.font = Style.FontDefaultBold;
    customCell.alignment = Style.AlignmentMiddleRightWrapText;
    customCell.value = `Утверждаю \r\n Директор ТОО \r\n "${companyName}" \r\n _______________Ким А.А.`;
    worksheet.mergeCells(1, headerCellCenter, 1, columns);
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
    worksheet.getColumn(1).width = reportFullTableHeader.Index.width;
    worksheet.getColumn(2).width = reportFullTableHeader.Initials.width;
    worksheet.getColumn(3 + daysCount).width = reportFullTableHeader.Count.width;
    worksheet.getColumn(4 + daysCount).width = reportFullTableHeader.Rate.width;
    worksheet.getColumn(5 + daysCount).width = reportFullTableHeader.RateSumm.width;
    for (let i = 0; i < daysCount; i++) {
      worksheet.getColumn(3 + i).width = reportFullTableHeader.Days.width;
    }

    var rowsCount = 0;

    for (const guardPost of NSOdata.guardPosts) {

      var tableRowsCount = guardPost.element?.length > 0 ? guardPost.element.length + 5 : 3;

      if (rowsCount > 0) {
        if (rowsCount + tableRowsCount > maxRowFullCount) {
          if (rowsCount < maxRowFullCount) {
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
      tableCustomCell.font = Style.FontMediumBold;
      tableCustomCell.alignment = Style.AlignmentMiddleCenter;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;
      worksheet.mergeCells(tableCaptionRow.number, 1, tableCaptionRow.number, columns);

      // Заголовок таблицы
      var tableHeaderRow = worksheet.addRow();
      tableHeaderRow.height = 27;

      tableCustomCell = tableHeaderRow.getCell(1);
      tableCustomCell.value = reportFullTableHeader.Index.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      tableCustomCell = tableHeaderRow.getCell(2);
      tableCustomCell.value = reportFullTableHeader.Initials.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenter;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      tableCustomCell = tableHeaderRow.getCell(3 + daysCount);
      tableCustomCell.value = reportFullTableHeader.Count.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      tableCustomCell = tableHeaderRow.getCell(4 + daysCount);
      tableCustomCell.value = reportFullTableHeader.Rate.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      tableCustomCell = tableHeaderRow.getCell(5 + daysCount);
      tableCustomCell.value = reportFullTableHeader.RateSumm.text;
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
        if (daysTimesheet[i] == 'сб' || daysTimesheet[i] == 'вс') {
          tableCustomCell.font = Style.FontSmallBold;
          tableCustomCell.fill = Style.FillYellow2;
        } else {
          tableCustomCell.font = Style.FontSmall;
          tableCustomCell.fill = Style.FillYellow1;
        }
      }
      // console.log(guardPost.element?.length);
      // Тело таблицы
      if (guardPost.element?.length > 0) {

        var totalHoursCount = 0;
        var totalHoursAddressStart = '';
        var totalHoursAddressFinish = '';
        var totalRateSummCount = 0;
        var totalRateSummAddressStart = '';
        var totalRateSummAddressFinish = '';
        const totalDaysHoursCount = new Array(daysCount).fill(0);
        const totalDaysHoursCountAddressStart = new Array(daysCount).fill('');
        const totalDaysHoursCountAddressFinish = new Array(daysCount).fill('');
        var rate = guardPost.rate ? guardPost.rate : 0;
        // Тело таблицы
        guardPost.element.forEach((guard, index) => {

          const tableBodyRow = worksheet.addRow();

          const bodyRowFillColor = index & 1 ? Style.FillYellow3 : Style.FillYellow4;

          var tableBodyCell = tableBodyRow.getCell(1);
          tableBodyCell.value = index + 1;
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

            if (daysTimesheet[i] == 'сб' || daysTimesheet[i] == 'вс') {
              tableBodyCell.fill = Style.FillYellow3;
            } else {
              tableBodyCell.fill = bodyRowFillColor;
            }

            if (index == 0) {
              totalDaysHoursCountAddressStart[i] = tableBodyCell.address;
            }
            if (index == (guardPost.element.length - 1)) {
              totalDaysHoursCountAddressFinish[i] = tableBodyCell.address;
            }

            let indexOfDay = guard.timesheetDays?.indexOf(i);

            if (indexOfDay >= 0) {

              let shift = parseInt(guard.timesheetShifts[indexOfDay]);

              if (shift >= 0) {
                hoursCount += shift;
                tableBodyCell.value = shift;
                tableBodyCell.font = Style.FontSmall;

                totalDaysHoursCount[i] += shift;

              } else {
                tableBodyCell.value = guard.timesheetShifts[indexOfDay];
                switch (guard.timesheetShifts[indexOfDay]) {
                  case '?':
                    tableBodyCell.font = Style.FontSmallBoldRed;
                    tableBodyCell.fill = Style.FillYellow5;
                    break;

                  default:
                    tableBodyCell.font = Style.FontSmallBold;
                    break;
                }
              }

            } else {

              tableBodyCell.font = Style.FontSmall;

            }
          }

          // Сумма часов в строке
          tableBodyCell = tableBodyRow.getCell(3 + daysCount);
          tableBodyCell.value = { formula: `SUM(${tableBodyRow.getCell(3).address}:${tableBodyRow.getCell(2 + daysCount).address})`, result: hoursCount };
          tableBodyCell.numFmt = isFloat(hoursCount) ? '#.####' : '#';
          tableBodyCell.font = Style.FontSmallBold;
          tableBodyCell.alignment = Style.AlignmentMiddleCenter;
          tableBodyCell.border = Style.BorderThin;
          tableBodyCell.fill = bodyRowFillColor;

          totalHoursCount += hoursCount;

          if (index == 0) {
            totalHoursAddressStart = tableBodyCell.address;
          }

          if (index == (guardPost.element.length - 1)) {
            totalHoursAddressFinish = tableBodyCell.address;
          }

          // Тариф
          tableBodyCell = tableBodyRow.getCell(4 + daysCount);
          tableBodyCell.value = rate;
          tableBodyCell.numFmt = isFloat(rate) ? '#.####' : '#';
          tableBodyCell.font = Style.FontSmallBold;
          tableBodyCell.alignment = Style.AlignmentMiddleCenter;
          tableBodyCell.border = Style.BorderThin;
          tableBodyCell.fill = bodyRowFillColor;

          // Сумма Тариф*часы
          let rateSumm = round10(hoursCount * rate);
          tableBodyCell = tableBodyRow.getCell(5 + daysCount);
          tableBodyCell.value = {
            formula: `ROUND(PRODUCT(${tableBodyRow.getCell(3 + daysCount).address}:${tableBodyRow.getCell(4 + daysCount).address}), -1)`,
            result: rateSumm
          };
          tableBodyCell.numFmt = '#';
          tableBodyCell.font = Style.FontSmallBold;
          tableBodyCell.alignment = Style.AlignmentMiddleCenter;
          tableBodyCell.border = Style.BorderThin;
          tableBodyCell.fill = bodyRowFillColor;

          totalRateSummCount += rateSumm;

          if (index == 0) {
            totalRateSummAddressStart = tableBodyCell.address;
          }

          if (index == (guardPost.element.length - 1)) {
            totalRateSummAddressFinish = tableBodyCell.address;
          }

          //Обновление данных страницы отчёта по охранникам
          // if (hoursCount > 0) {

          //   const guardDataCandidate = GuardsData.find(guardsDataElement => guardsDataElement._id == guard._id.toString());

          //   if (guardDataCandidate) {

          //     guardDataCandidate.hoursSumm += hoursCount;
          //     guardDataCandidate.rateSumm += rateSumm;

          //     guardDataCandidate.lineTimesheet.push({
          //       lineGuardPost: [guardPost.number ? guardPost.number : null, guardPost.callsign].filter(Boolean).join(', '),
          //       lineHours: hoursCount,
          //       lineRate: rate,
          //       lineSumm: rateSumm
          //     })

          //   } else {

          //     GuardsData.push({
          //       _id: guard._id.toString(),
          //       value: [guard.surname, guard.firstName].join(' '),
          //       hoursSumm: hoursCount,
          //       rateSumm: rateSumm,
          //       lineTimesheet: [{
          //         lineGuardPost: [guardPost.number ? guardPost.number : null, guardPost.callsign].filter(Boolean).join(', '),
          //         lineHours: hoursCount,
          //         lineRate: rate,
          //         lineSumm: rateSumm
          //       }]
          //     });

          //   }
          // }

        })

        // Строка итогов
        const tableFooterRow = worksheet.addRow();

        const bodyFooterFillColor = guardPost.element.length & 1 ? Style.FillYellow3 : Style.FillYellow4;

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

        // console.log(totalDaysHoursCountAddressStart);
        // console.log(totalDaysHoursCountAddressFinish);
        for (let i = 0; i < daysCount; i++) {

          tableFooterCell = tableFooterRow.getCell(3 + i);
          tableFooterCell.font = Style.FontSmall;
          tableFooterCell.alignment = Style.AlignmentMiddleCenter;
          tableFooterCell.border = Style.BorderThin;
          tableFooterCell.fill = bodyFooterFillColor;
          tableFooterCell.value = {
            formula: `SUM(${totalDaysHoursCountAddressStart[i]}:${totalDaysHoursCountAddressFinish[i]})`,
            result: totalDaysHoursCount[i] > 0 ? totalDaysHoursCount[i] : '',
          };
          tableFooterCell.numFmt = isFloat(totalDaysHoursCount[i]) ? '#.####' : '#';
          // if( totalDaysHoursCount[i] > 0)
          //   tableFooterCell.value = totalDaysHoursCount[i];
          // console.log(`SUM(${totalDaysHoursCountAddressStart.col}${i+totalDaysHoursCountAddressStart.row}:${totalDaysHoursCountAddressFinish.col}${i+totalDaysHoursCountAddressFinish.row})`);
        }

        // Итого сумма часов
        tableFooterCell = tableFooterRow.getCell(3 + daysCount);
        tableFooterCell.value = { formula: `SUM(${totalHoursAddressStart}:${totalHoursAddressFinish})`, result: totalHoursCount };
        tableFooterCell.numFmt = isFloat(totalHoursCount) ? '#.####' : '#';
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
        tableFooterCell.numFmt = '#';
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

  // if (GuardsData.length > 0) {

  //   // console.log('%o', GuardsData);

  //   GuardsData = GuardsData.sort((a, b) => a.value.localeCompare(b.value));

  //   const worksheet = ExcelJSWorkbook.addWorksheet('Общий отчёт', {
  //     pageSetup: {
  //       paperSize: 9,
  //       orientation: 'portrait',
  //       margins: {
  //         left: 0.25, right: 0.25,
  //         top: 0.6, bottom: 0.6,
  //         header: 0.25, footer: 0.25
  //       }
  //     },
  //   });

  //   // Заголовок таблицы
  //   var tableHeaderRow = worksheet.addRow();
  //   tableHeaderRow.height = 27;

  //   tableCustomCell = tableHeaderRow.getCell(1);
  //   tableCustomCell.value = tableHeader.Index.text;
  //   tableCustomCell.font = Style.FontSmall;
  //   tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
  //   tableCustomCell.fill = Style.FillYellow1;
  //   tableCustomCell.border = Style.BorderThin;

  //   tableCustomCell = tableHeaderRow.getCell(2);
  //   tableCustomCell.value = tableHeader.Initials.text;
  //   tableCustomCell.font = Style.FontSmall;
  //   tableCustomCell.alignment = Style.AlignmentMiddleCenter;
  //   tableCustomCell.fill = Style.FillYellow1;
  //   tableCustomCell.border = Style.BorderThin;

  //   tableCustomCell = tableHeaderRow.getCell(3);
  //   tableCustomCell.value = tableHeader.Count.text;
  //   tableCustomCell.font = Style.FontSmall;
  //   tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
  //   tableCustomCell.fill = Style.FillYellow1;
  //   tableCustomCell.border = Style.BorderThin;

  //   tableCustomCell = tableHeaderRow.getCell(4);
  //   tableCustomCell.value = tableHeader.RateSumm.text;
  //   tableCustomCell.font = Style.FontSmall;
  //   tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
  //   tableCustomCell.fill = Style.FillYellow1;
  //   tableCustomCell.border = Style.BorderThin;

  //   //columns heights
  //   worksheet.getColumn(1).width = tableHeader.Index.width;
  //   worksheet.getColumn(2).width = tableHeader.Initials.width;
  //   worksheet.getColumn(3).width = tableHeader.RateSumm.width;
  //   worksheet.getColumn(4).width = tableHeader.RateSumm.width;

  //   const columnLineStart = 5;
  //   var countOfColumn = columnLineStart;

  //   var totalHoursCount = 0;
  //   var totalHoursAddressStart = '';
  //   var totalHoursAddressFinish = '';
  //   var totalRateSummCount = 0;
  //   var totalRateSummAddressStart = '';
  //   var totalRateSummAddressFinish = '';

  //   GuardsData.forEach((guardData, index) => {

  //     const tableBodyRow = worksheet.addRow();

  //     // const bodyRowFillColor = index & 1 ? Style.FillYellow3 : Style.FillYellow4;
  //     const bodyRowFillColor = Style.FillYellow4;

  //     var tableBodyCell = tableBodyRow.getCell(1);
  //     tableBodyCell.value = index + 1;
  //     tableBodyCell.font = Style.FontSmall;
  //     tableBodyCell.alignment = Style.AlignmentMiddleCenter;
  //     tableBodyCell.border = Style.BorderThin;
  //     tableBodyCell.fill = bodyRowFillColor;

  //     tableBodyCell = tableBodyRow.getCell(2);
  //     tableBodyCell.value = guardData.value;
  //     tableBodyCell.font = Style.FontSmall;
  //     tableBodyCell.alignment = Style.AlignmentMiddleLeft;
  //     tableBodyCell.border = Style.BorderThin;
  //     tableBodyCell.fill = bodyRowFillColor;

  //     tableBodyCell = tableBodyRow.getCell(3);
  //     tableBodyCell.value = guardData.hoursSumm;
  //     tableBodyCell.numFmt = isFloat(guardData.hoursSumm) ? '#.####' : '#';
  //     tableBodyCell.font = Style.FontSmall;
  //     tableBodyCell.alignment = Style.AlignmentMiddleCenter;
  //     tableBodyCell.border = Style.BorderThin;
  //     tableBodyCell.fill = bodyRowFillColor;

  //     totalHoursCount += guardData.hoursSumm;

  //     if (index == 0) {
  //       totalHoursAddressStart = tableBodyCell.address;
  //     }

  //     if (index == (GuardsData.length - 1)) {
  //       totalHoursAddressFinish = tableBodyCell.address;
  //     }

  //     tableBodyCell = tableBodyRow.getCell(4);
  //     tableBodyCell.value = guardData.rateSumm;
  //     tableBodyCell.numFmt = '#';
  //     tableBodyCell.font = Style.FontSmall;
  //     tableBodyCell.alignment = Style.AlignmentMiddleCenter;
  //     tableBodyCell.border = Style.BorderThin;
  //     tableBodyCell.fill = bodyRowFillColor;

  //     totalRateSummCount += guardData.rateSumm;

  //     if (index == 0) {
  //       totalRateSummAddressStart = tableBodyCell.address;
  //     }

  //     if (index == (GuardsData.length - 1)) {
  //       totalRateSummAddressFinish = tableBodyCell.address;
  //     }

  //     guardData.lineTimesheet.forEach((line, lineIndex) => {

  //       let offSetIndex = columnLineStart + lineIndex;

  //       countOfColumn = countOfColumn < offSetIndex ? offSetIndex : countOfColumn;

  //       tableBodyCell = tableBodyRow.getCell(offSetIndex);
  //       tableBodyCell.value = `${line.lineGuardPost}\r\n${line.lineHours}ч x ${line.lineRate} = ${line.lineSumm}`;
  //       tableBodyCell.font = Style.FontSmall;
  //       tableBodyCell.alignment = Style.AlignmentMiddleCenterWrapText;
  //       // tableBodyCell.border = Style.BorderThin;
  //       // tableBodyCell.fill = bodyRowFillColor;

  //     })

  //   })

  //   // Строка итогов
  //   const tableFooterRow = worksheet.addRow();

  //   const bodyFooterFillColor = Style.FillYellow3;

  //   var tableFooterCell = tableFooterRow.getCell(1);
  //   tableFooterCell.font = Style.FontSmall;
  //   tableFooterCell.alignment = Style.AlignmentMiddleCenter;
  //   tableFooterCell.border = Style.BorderThin;
  //   tableFooterCell.fill = bodyFooterFillColor;

  //   tableFooterCell = tableFooterRow.getCell(2);
  //   tableFooterCell.value = 'ИТОГО';
  //   tableFooterCell.font = Style.FontSmallBold;
  //   tableFooterCell.alignment = Style.AlignmentMiddleRightWrapText;
  //   tableFooterCell.border = Style.BorderThin;
  //   tableFooterCell.fill = bodyFooterFillColor;
  //   // console.log(totalHoursCount);
  //   // Итого сумма часов
  //   tableFooterCell = tableFooterRow.getCell(3);
  //   tableFooterCell.value = { formula: `SUM(${totalHoursAddressStart}:${totalHoursAddressFinish})`, result: totalHoursCount };
  //   tableFooterCell.numFmt = isFloat(totalHoursCount) ? '#.####' : '#';
  //   tableFooterCell.font = Style.FontSmallBold;
  //   tableFooterCell.alignment = Style.AlignmentMiddleCenter;
  //   tableFooterCell.border = Style.BorderThin;
  //   tableFooterCell.fill = bodyFooterFillColor;

  //   // Итого сумма по тарифу
  //   tableFooterCell = tableFooterRow.getCell(4);
  //   tableFooterCell.value = { formula: `SUM(${totalRateSummAddressStart}:${totalRateSummAddressFinish})`, result: totalRateSummCount };
  //   tableFooterCell.numFmt = '#';
  //   tableFooterCell.font = Style.FontSmallBold;
  //   tableFooterCell.alignment = Style.AlignmentMiddleCenter;
  //   tableFooterCell.border = Style.BorderThin;
  //   tableFooterCell.fill = bodyFooterFillColor;

  //   for (let i = columnLineStart; i < countOfColumn + 1; i++) {
  //     worksheet.getColumn(i).width = tableHeader.Initials.width;

  //     // tableFooterCell = tableHeaderRow.getCell(i);
  //     // tableFooterCell.value = 'ИТОГО';
  //     // tableFooterCell.font = Style.FontSmall;
  //     // tableFooterCell.alignment = Style.AlignmentMiddleCenter;
  //     // tableFooterCell.fill = Style.FillYellow1;
  //     // tableFooterCell.border = Style.BorderThin;

  //     // tableFooterCell = tableFooterRow.getCell(i);
  //     // tableFooterCell.font = Style.FontSmall;
  //     // tableFooterCell.alignment = Style.AlignmentMiddleRightWrapText;
  //     // tableFooterCell.border = Style.BorderThin;
  //     // tableFooterCell.fill = bodyFooterFillColor;

  //   }

  // }

  return ExcelJSWorkbook.xlsx;

}

export function timesheetExcellForMonthBuh(responce, date) {

  // Переменные листа
  const columns = 10;
  const tableBodyStartRow = 4;

  // Workbook and worksheet create
  const ExcelJSWorkbook = new ExcelJS.Workbook();

  const worksheet = ExcelJSWorkbook.addWorksheet("Пл. ведомость", {
    pageSetup: {
      paperSize: 9,
      orientation: 'portrait',
      margins: {
        left: 0.25, right: 0.25,
        top: 0.6, bottom: 0.6,
        header: 0.25, footer: 0.25
      }
    }
  });

  //columns heights
  try {

    var keyIndex = 0;

    mapValue(reportBuhTableHeader, (value, key) => {

      keyIndex++;

      worksheet.getColumn(keyIndex).width = reportBuhTableHeader[key].width;

    })

  } catch (error) { console.log(error) }

  // Заголовок страницы 
  try {

    let customCell = worksheet.getCell(1, 1);
    customCell.font = Style.FontDefaultBold;
    customCell.alignment = Style.AlignmentMiddleCenter;
    customCell.value = `ТОО "${companyName}"`;
    worksheet.mergeCells(1, 1, 1, columns);

    customCell = worksheet.getCell(2, 1);
    customCell.font = Style.FontDefaultBold;
    customCell.alignment = Style.AlignmentMiddleCenter;
    customCell.value = `Платежная ведомость`;
    worksheet.mergeCells(2, 1, 2, columns);

    customCell = worksheet.getCell(3, 1);
    customCell.font = Style.FontDefault;
    customCell.alignment = Style.AlignmentMiddleCenter;
    customCell.value = `за ${date.toLocaleDateString('ru-KZ', { year: 'numeric', month: 'long' })}`;
    worksheet.mergeCells(3, 1, 3, columns);

  } catch (error) { console.log(error) }

  // Заголовок таблицы
  try {

    var tableHeaderRow = worksheet.addRow();

    tableHeaderRow.height = 27;

    var keyIndex = 0;

    mapValue(reportBuhTableHeader, (value, key) => {

      keyIndex++;

      let tableCustomCell = tableHeaderRow.getCell(keyIndex);
      tableCustomCell.value = reportBuhTableHeader[key].text;
      tableCustomCell.font = Style.FontSmallBold;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

    })

  } catch (error) { console.log(error) }

  // Тело таблицы
  var rowsCount = 0;
  var indexStartRow = tableBodyStartRow + 1;

  responce.forEach((guard, indexA) => {

    const bodyRowFillColor = indexA & 1 ? Style.FillGreen1 : Style.FillBlue1;

    const indexEndRow = indexStartRow + ( guard.element.length > 1 ? guard.element.length : 0 );

    // Index
    var tableBodyCell = worksheet.getCell(indexStartRow, 1);
    tableBodyCell.value = indexA + 1;
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.alignment = Style.AlignmentMiddleCenter;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    // Initials
    tableBodyCell = worksheet.getCell(indexStartRow, 2);
    tableBodyCell.value = [guard.surname, guard.firstName].join(' ');
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.alignment = Style.AlignmentMiddleLeft;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    var allSumm = 0, allTaxes = 0, allAdvance = 0, allPayoff = 0;

    guard.element.forEach((guarpPost, indexB) => {

      // Object
      tableBodyCell = worksheet.getCell(indexStartRow + indexB, 3);
      tableBodyCell.value = guarpPost.number ? +guarpPost.number : guarpPost.callsign;
      tableBodyCell.font = Style.FontSmall;
      tableBodyCell.alignment = Style.AlignmentMiddleCenter;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = bodyRowFillColor;

      // Calculate Summ
      let totalHoursCount = guarpPost.timesheetShifts.reduce((partialSum, a) => partialSum + (isNaN(a) ? 0 : parseInt(a)), 0);
      let guardPostSumm = round10( totalHoursCount * guarpPost.rate );
      allSumm += guardPostSumm ? guardPostSumm : 0;
      if(!guardPostSumm){
        console.log(totalHoursCount, guarpPost.rate, guarpPost.timesheetShifts);
      }
      // Summ
      tableBodyCell = worksheet.getCell(indexStartRow + indexB, 4);
      tableBodyCell.value = guardPostSumm ? {
        formula: `ROUND(${guardPostSumm}, -1)`,
        result: guardPostSumm
      } : ( totalHoursCount ? totalHoursCount + "ч" : "?" );
      tableBodyCell.numFmt = '#';
      tableBodyCell.font = guardPostSumm ? Style.FontSmall : Style.FontSmallBoldRed;
      tableBodyCell.alignment = Style.AlignmentMiddleCenter;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = bodyRowFillColor;

      // Taxes
      tableBodyCell = worksheet.getCell(indexStartRow + indexB, 5);
      tableBodyCell.font = Style.FontSmall;
      tableBodyCell.alignment = Style.AlignmentMiddleCenter;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = bodyRowFillColor;

      // Advance
      tableBodyCell = worksheet.getCell(indexStartRow + indexB, 6);
      tableBodyCell.font = Style.FontSmall;
      tableBodyCell.alignment = Style.AlignmentMiddleCenter;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = bodyRowFillColor;

      // Payoff
      tableBodyCell = worksheet.getCell(indexStartRow + indexB, 7);
      tableBodyCell.value = guardPostSumm ? { 
        formula: `ROUND(${
          worksheet.getCell(indexStartRow + indexB, 4).address
        }-${
          worksheet.getCell(indexStartRow + indexB, 5).address
        }-${
          worksheet.getCell(indexStartRow + indexB, 6).address
        }, -1)`, 
        result: guardPostSumm 
      } : "?";
      tableBodyCell.font = guardPostSumm ? Style.FontSmall : Style.FontSmallBoldRed;
      tableBodyCell.alignment = Style.AlignmentMiddleCenter;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = bodyRowFillColor;

    })

    // Слияние данных если выход выполнялся на несколько физ постов
    if ( indexStartRow != indexEndRow ) {
      worksheet.mergeCells(indexStartRow, 1, indexEndRow, 1);
      worksheet.mergeCells(indexStartRow, 2, indexEndRow, 2);
      worksheet.mergeCells(indexStartRow, 8, indexEndRow, 8);
      worksheet.mergeCells(indexStartRow, 9, indexEndRow, 9);
      worksheet.mergeCells(indexStartRow, 10, indexEndRow, 10);

      // Object all
      tableBodyCell = worksheet.getCell(indexEndRow, 3);
      tableBodyCell.value = "итого";
      tableBodyCell.font = Style.FontSmall;
      tableBodyCell.alignment = Style.AlignmentMiddleRightText;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = bodyRowFillColor;

      // Summ all
      tableBodyCell = worksheet.getCell(indexEndRow, 4);
      tableBodyCell.value = { 
        formula: `SUM(${worksheet.getCell(indexStartRow, 4).address}:${worksheet.getCell(indexEndRow-1, 4).address})`, 
        result: allSumm 
      };
      tableBodyCell.font = Style.FontSmall;
      tableBodyCell.alignment = Style.AlignmentMiddleCenter;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = bodyRowFillColor;

      // Taxes all
      tableBodyCell = worksheet.getCell(indexEndRow, 5);
      tableBodyCell.value = { 
        formula: `SUM(${worksheet.getCell(indexStartRow, 5).address}:${worksheet.getCell(indexEndRow-1, 5).address})`, 
        result: 0 
      };
      tableBodyCell.font = Style.FontSmall;
      tableBodyCell.alignment = Style.AlignmentMiddleCenter;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = bodyRowFillColor;

      // Advance all
      tableBodyCell = worksheet.getCell(indexEndRow, 6);
      tableBodyCell.value = { 
        formula: `SUM(${worksheet.getCell(indexStartRow, 6).address}:${worksheet.getCell(indexEndRow-1, 6).address})`, 
        result: 0 
      };
      tableBodyCell.font = Style.FontSmall;
      tableBodyCell.alignment = Style.AlignmentMiddleCenter;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = bodyRowFillColor;

      // Payoff all
      tableBodyCell = worksheet.getCell(indexEndRow, 7);
      tableBodyCell.value = { 
        formula: `SUM(${worksheet.getCell(indexStartRow, 7).address}:${worksheet.getCell(indexEndRow-1, 7).address})`, 
        result: allSumm 
      };
      tableBodyCell.font = Style.FontSmall;
      tableBodyCell.alignment = Style.AlignmentMiddleCenter;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = bodyRowFillColor;
    }

    // Sign
    tableBodyCell = worksheet.getCell(indexStartRow, 8);
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.alignment = Style.AlignmentMiddleLeft;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    // Date
    tableBodyCell = worksheet.getCell(indexStartRow, 9);
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.alignment = Style.AlignmentMiddleLeft;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    // SignInitials
    tableBodyCell = worksheet.getCell(indexStartRow, 10);
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.alignment = Style.AlignmentMiddleLeft;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    indexStartRow = indexEndRow + 1; 
  });

  return ExcelJSWorkbook.xlsx;

}