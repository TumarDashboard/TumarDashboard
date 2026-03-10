
import ExcelJS from "exceljs";
import { getDaysFromMonth } from "./dateUtils";
import { FPositionBUH, FPositionHRM, FPositionZDIR } from "../../components/levelZ_variable/FPositionItemList";
import { isFloat, ceil10, round10 } from "./mathUtils";
import { mapValue } from "./arrayUtils";

const defaultDayShift = process.env.NEXT_PUBLIC_DEFAULT_DAY_SHIFT;

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

const reportExcellForDay = {
  GuardPostNumber: {
    width: 6.00,
    text: '№',
  },
  GuardPostCallsignNameAddres: {
    width: 60.00,
    text: 'Наименование и адрес',
  },
  InitialsGuard: {
    width: 20.25,
    text: 'Ф.И.О. охранника',
  },
}

const reportExcellForMonthFull = {
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
}

const reportExcellForMonthBuh = {
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
    width: 8.50,
    text: 'сумма',
  },
  Award: {
    width: 8.50,
    text: 'премия',
  },
  Taxes: {
    width: 8.50,
    text: 'налоги',
  },
  Advance: {
    width: 8.50,
    text: 'аванс',
  },
  Payoff: {
    width: 8.50,
    text: 'к выплате',
  },
  Sign: {
    width: 8.50,
    text: 'подпись',
  },
  Date: {
    width: 8.50,
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
const maxRowFullCount = 33;
const maxRowBuhCount = 51;
const companyName = 'Тұмар Гранд Секьюрити';

const Style = {
  AlignmentMiddleCenter: { vertical: 'middle', horizontal: 'center' },
  AlignmentMiddleLeft: { vertical: 'middle', horizontal: 'left' },
  AlignmentMiddleRight: { vertical: 'middle', horizontal: 'right' },
  AlignmentMiddleCenterWrapText: { vertical: 'middle', horizontal: 'center', wrapText: true },
  AlignmentMiddleLeftWrapText: { vertical: 'middle', horizontal: 'left', wrapText: true },
  AlignmentMiddleRightWrapText: { vertical: 'middle', horizontal: 'right', wrapText: true },
  FontDefault: { name: "Calibri", family: 1, size: defaultFontSize },
  FontDefaultBold: { name: "Calibri", family: 1, size: defaultFontSize, bold: true },
  FontMediumBold: { name: "Calibri", family: 1, size: mediumFontSize, bold: true },
  FontSmall: { name: "Calibri", family: 1, size: smallFontSize },
  FontSmallBold: { name: "Calibri", family: 1, size: smallFontSize, bold: true },
  FontSmallBoldRed: { name: "Calibri", family: 1, size: smallFontSize, bold: true, color: { argb: 'ff0000' } },
  FontSmallBoldGreen: { name: "Calibri", family: 1, size: smallFontSize, bold: true, color: { argb: 'C6E0B4' } },
  FontSmallBoldYellow: { name: "Calibri", family: 1, size: smallFontSize, bold: true, color: { argb: 'ffff00' } },
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
  FillGrey1: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' }, },


  FillRose200: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fecdd3' }, },
  FillRose300: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fda4af' }, },
  FillRose700: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'be123c' }, },
  FillRose900: { type: 'pattern', pattern: 'solid', fgColor: { argb: '881337' }, },
  FillOrange200: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fed7aa' }, },
  FillOrange300: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fdba74' }, },
  FillOrange700: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'c2410c' }, },
  FillOrange900: { type: 'pattern', pattern: 'solid', fgColor: { argb: '7c2d12' }, },
  FillEmerald200: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'a7f3d0' }, },
  FillEmerald300: { type: 'pattern', pattern: 'solid', fgColor: { argb: '6ee7b7' }, },
  FillAmber100: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fef3c7' }, },
  FillStone50: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fafaf9' }, },

  FontSmallRose200: { name: "Calibri", family: 1, size: smallFontSize, color: { argb: 'fecdd3' }, },
  FontSmallRose300: { name: "Calibri", family: 1, size: smallFontSize, color: { argb: 'fda4af' }, },
  FontSmallRose700: { name: "Calibri", family: 1, size: smallFontSize, color: { argb: 'be123c' }, },
  FontSmallRose900: { name: "Calibri", family: 1, size: smallFontSize, color: { argb: '881337' }, },
  FontSmallOrange200: { name: "Calibri", family: 1, size: smallFontSize, color: { argb: 'fed7aa' }, },
  FontSmallOrange300: { name: "Calibri", family: 1, size: smallFontSize, color: { argb: 'fdba74' }, },
  FontSmallOrange700: { name: "Calibri", family: 1, size: smallFontSize, color: { argb: 'c2410c' }, },
  FontSmallOrange900: { name: "Calibri", family: 1, size: smallFontSize, color: { argb: '7c2d12' }, },
  FontSmallEmerald200: { name: "Calibri", family: 1, size: smallFontSize, color: { argb: 'a7f3d0' }, },
  FontSmallEmerald300: { name: "Calibri", family: 1, size: smallFontSize, color: { argb: '6ee7b7' }, },
  FontSmallAmber100: { name: "Calibri", family: 1, size: smallFontSize, color: { argb: 'fef3c7' }, },
  FontSmallStone50: { name: "Calibri", family: 1, size: smallFontSize, color: { argb: 'fafaf9' }, },

  FillNone: { type: 'pattern', pattern: 'none', },
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

export function timesheetPrintServerHoursOnly(responce, usersData, date) {

  const daysTimesheet = getDaysFromMonth(date);
  const daysCount = daysTimesheet.length;
  const columns = daysCount + 3;

  // Workbook and worksheet create
  var ExcelJSWorkbook = new ExcelJS.Workbook();

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
        oddFooter: `&LЗаместитель Директора______________${usersData[FPositionZDIR]}\nНачальник службы охраны____________${NSOinitials ? NSOinitials : ''}&CБухгалтер_________________${usersData[FPositionBUH]}\nИнспектор ОК______________${usersData[FPositionHRM]}&U&RДата формирования: &D\nстраница &P из &N`
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
    worksheet.getColumn(2).width = reportFullTableHeader.Initials.width + 10;
    worksheet.getColumn(3 + daysCount).width = reportFullTableHeader.Count.width;
    for (let i = 0; i < daysCount; i++) {
      worksheet.getColumn(3 + i).width = reportFullTableHeader.Days.width + 0.5;
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
        const totalDaysHoursCount = new Array(daysCount).fill(0);
        const totalDaysHoursCountAddressStart = new Array(daysCount).fill('');
        const totalDaysHoursCountAddressFinish = new Array(daysCount).fill('');

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
        }
        
        // Итого сумма часов
        tableFooterCell = tableFooterRow.getCell(3 + daysCount);
        tableFooterCell.value = { formula: `SUM(${totalHoursAddressStart}:${totalHoursAddressFinish})`, result: totalHoursCount };
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
        left: 0.6, right: 0.25,
        top: 0.6, bottom: 0.6,
        header: 0.25, footer: 0.25
      }
    }
  });

  //columns heights
  try {

    var keyIndex = 0;

    mapValue(reportExcellForDay, (value, key) => {

      keyIndex++;

      worksheet.getColumn(keyIndex).width = reportExcellForDay[key].width;

    })

  } catch (error) { console.log(error) }

  // Заголовок страницы
  try {

    let customCell = worksheet.getCell(1, 1);
    customCell.font = Style.FontDefaultBold;
    customCell.alignment = Style.AlignmentMiddleCenter;
    customCell.value = `Список охранников заступивших на смену ${new Date(date).toLocaleString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    worksheet.mergeCells(1, 1, 1, 3);

  } catch (error) { console.log(error) }

  // Заголовок таблицы
  try {

    var tableFooterRow = worksheet.addRow();

    tableFooterRow.height = 27;

    var keyIndex = 0;

    mapValue(reportExcellForDay, (value, key) => {

      keyIndex++;

      let tableCustomCell = tableFooterRow.getCell(keyIndex);
      tableCustomCell.value = reportExcellForDay[key].text;
      tableCustomCell.font = Style.FontSmallBold;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

    })

  } catch (error) { console.log(error) }

  // Тело таблицы
  for (const NSOdata of responce) {

    // Глава таблицы с записями об НСО
    try {

      const NSOinitials = NSOdata.surname ? [
        NSOdata.surname,
        NSOdata.firstName ? NSOdata.firstName : null,
        NSOdata.patronymic ? NSOdata.patronymic : null,
      ].filter(Boolean).join(' ') : null;

      let tableCaptionRow = worksheet.addRow();

      let tableCustomCell = tableCaptionRow.getCell(1);
      tableCustomCell.value = NSOinitials ? "НСО " + NSOinitials : "Без НСО";
      tableCustomCell.font = Style.FontSmallBold;
      tableCustomCell.alignment = Style.AlignmentMiddleCenter;
      tableCustomCell.fill = Style.FillYellow3;
      tableCustomCell.border = Style.BorderThin;
      worksheet.mergeCells(tableCaptionRow.number, 1, tableCaptionRow.number, 3);

    } catch (error) { console.log(error) }

    // Список физ постов
    for (const guardPost of NSOdata.guardPosts) {

      // Новая строка
      let tableBodyRow = worksheet.addRow();

      // Номер физ поста
      let tableBodyCell = tableBodyRow.getCell(1);
      tableBodyCell.value = guardPost.number;
      tableBodyCell.font = Style.FontSmall;
      tableBodyCell.alignment = Style.AlignmentMiddleRight;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = Style.FillYellow4;

      // Наименование и адрес физ поста
      tableBodyCell = tableBodyRow.getCell(2);
      tableBodyCell.value = [guardPost.callsign, guardPost.name, guardPost.address].filter(Boolean).join(', ');
      tableBodyCell.font = Style.FontSmall;
      tableBodyCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = Style.FillYellow4;

      // Охранники физ. поста
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

  // Переменные
  const daysTimesheet = getDaysFromMonth(date);
  const daysCount = daysTimesheet.length;
  const columns = daysCount + 5;
  const maxRateCalc = process.env.NEXT_PUBLIC_OVER_RATE_CALC;
  const selectedMonth = date.getMonth();
  const currentMonth = new Date().getMonth();
  const currentDay = new Date().getDate();

  // Workbook create
  var ExcelJSWorkbook = new ExcelJS.Workbook();

  // Worksheet create
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

  // columns heights
  try {

    worksheet.getColumn(1).width = reportExcellForMonthFull.Index.width;
    worksheet.getColumn(2).width = reportExcellForMonthFull.Initials.width;
    worksheet.getColumn(3 + daysCount).width = reportExcellForMonthFull.Count.width;
    worksheet.getColumn(4 + daysCount).width = reportExcellForMonthFull.Rate.width;
    worksheet.getColumn(5 + daysCount).width = reportExcellForMonthFull.RateSumm.width;

    for (let i = 0; i < daysCount; i++) {
      worksheet.getColumn(3 + i).width = reportExcellForMonthFull.Days.width;
    }

  } catch (error) { console.log(error) }

  // Заголовок страницы 
  try {

    let headerCellCenter = Math.trunc(columns / 2);

    // Имя НСО
    var customCell = worksheet.getCell(1, 2);
    customCell.font = Style.FontDefaultBold;
    customCell.alignment = Style.AlignmentMiddleLeft;
    customCell.value = `НСО: ${NSOinitials ? NSOinitials : 'не указан'}`;
    worksheet.mergeCells(1, 2, 1, headerCellCenter - 1);

    // Шапочка страницы
    customCell = worksheet.getCell(1, headerCellCenter);
    customCell.font = Style.FontDefaultBold;
    customCell.alignment = Style.AlignmentMiddleRightWrapText;
    customCell.value = `Утверждаю \r\n Директор ТОО \r\n "${companyName}" \r\n _______________Ким А.А.`;
    worksheet.mergeCells(1, headerCellCenter, 1, columns);
    worksheet.getRow(1).height = (defaultFontSize + 5) * 4;

    // Оглавление страницы 1
    customCell = worksheet.getCell(2, 1);
    customCell.font = Style.FontDefaultBold;
    customCell.alignment = Style.AlignmentMiddleCenter;
    customCell.value = `Табель сотрудников ТОО "${companyName}"`;
    worksheet.mergeCells(2, 1, 2, columns);
    
    // Оглавление страницы 2
    customCell = worksheet.getCell(3, 1);
    customCell.font = Style.FontDefaultBold;
    customCell.alignment = Style.AlignmentMiddleCenter;
    customCell.value = `за ${date.toLocaleDateString('ru-KZ', { year: 'numeric', month: 'long' })}`;
    worksheet.mergeCells(3, 1, 3, columns);

  } catch (error) { console.log(error) }

  // Тело таблицы
  var rowsCount = 7;

  for (const guardPost of guardPosts) {

    // Расчёт разрыва страницы
    let indexElementsB = guardPost.element?.length > 0 ? guardPost.element.length + 4 : 3;

    if (rowsCount + indexElementsB > maxRowFullCount) {
      worksheet.lastRow.addPageBreak();
      rowsCount = indexElementsB;
    } else {
      rowsCount += indexElementsB;
    }

    // Заголовок таблицы
    try {

      // Наименование таблицы
      let tableCaptionRow = worksheet.addRow([[guardPost.number ? '№' + guardPost.number : null, guardPost.callsign, guardPost.name, guardPost.address].filter(Boolean).join(', ')]);
      let tableCustomCell = tableCaptionRow.getCell(1);
      tableCustomCell.font = Style.FontMediumBold;
      tableCustomCell.alignment = Style.AlignmentMiddleCenter;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;
      worksheet.mergeCells(tableCaptionRow.number, 1, tableCaptionRow.number, columns);

      // Заголовок таблицы
      let tableHeaderRow = worksheet.addRow();
      tableHeaderRow.height = 27;
      
      // Индекс
      tableCustomCell = tableHeaderRow.getCell(1);
      tableCustomCell.value = reportExcellForMonthFull.Index.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      // Инициалы охранника
      tableCustomCell = tableHeaderRow.getCell(2);
      tableCustomCell.value = reportExcellForMonthFull.Initials.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenter;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      // Кол-во часов
      tableCustomCell = tableHeaderRow.getCell(3 + daysCount);
      tableCustomCell.value = reportExcellForMonthFull.Count.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      // Тариф
      tableCustomCell = tableHeaderRow.getCell(4 + daysCount);
      tableCustomCell.value = reportExcellForMonthFull.Rate.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      // Сумма
      tableCustomCell = tableHeaderRow.getCell(5 + daysCount);
      tableCustomCell.value = reportExcellForMonthFull.RateSumm.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

      // Дни
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
    } catch (error) { console.log(error) }

    // Тело таблицы
    if (guardPost.element?.length > 0) {

      // Переменные таблицы
      var totalHoursCount = 0;
      var totalDaysCount = 0;
      const totalDaysHoursCount = new Array(daysCount).fill(0);
      const totalDaysCalcCount = new Array(daysCount).fill(0);
      const totalDaysHoursCountAddressStart = new Array(daysCount).fill('');
      const totalDaysHoursCountAddressFinish = new Array(daysCount).fill('');
      var totalHoursAddressStart = '';
      var totalHoursAddressFinish = '';
      var totalRateSummCount = 0;
      var totalRateSummAddressStart = '';
      var totalRateSummAddressFinish = '';
      var rate = guardPost.rate ? guardPost.rate : 0;

      // Строки таблицы 1
      guardPost.element.forEach((guard, index) => {

        // Переменные строк таблицы
        guard.bodyRowFillColor = index & 1 ? Style.FillYellow3 : Style.FillYellow4;

        // Добавление строки таблицы
        guard.tableBodyRow = worksheet.addRow();

        // Индекс строки таблицы
        var tableBodyCell = guard.tableBodyRow.getCell(1);
        tableBodyCell.value = index + 1;
        tableBodyCell.font = Style.FontSmall;
        tableBodyCell.alignment = Style.AlignmentMiddleCenter;
        tableBodyCell.border = Style.BorderThin;
        tableBodyCell.fill = guard.bodyRowFillColor;

        // Инициалы строки таблицы
        tableBodyCell = guard.tableBodyRow.getCell(2);
        tableBodyCell.value = [guard.surname, guard.firstName].join(' ');
        tableBodyCell.font = Style.FontSmall;
        tableBodyCell.alignment = Style.AlignmentMiddleLeft;
        tableBodyCell.border = Style.BorderThin;
        tableBodyCell.fill = guard.bodyRowFillColor;

        // Часы в днях таблицы
        guard.hoursCount = 0;

        for (let i = 0; i < daysCount; i++) {

          tableBodyCell = guard.tableBodyRow.getCell(3 + i);
          tableBodyCell.alignment = Style.AlignmentMiddleCenter;
          tableBodyCell.border = Style.BorderThin;

          if (daysTimesheet[i] == 'сб' || daysTimesheet[i] == 'вс') {
            tableBodyCell.fill = Style.FillYellow3;
          } else {
            tableBodyCell.fill = guard.bodyRowFillColor;
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
              guard.hoursCount += shift;
              tableBodyCell.value = shift;
              tableBodyCell.font = Style.FontSmall;

              if( totalDaysCalcCount[i] == 0 ){
                totalDaysCount++;
                totalDaysCalcCount[i] = 1;
              }

              totalDaysHoursCount[i] += shift;

            } else {
              tableBodyCell.value = guard.timesheetShifts[indexOfDay];
              switch (guard.timesheetShifts[indexOfDay]) {
                case '?':
                  tableBodyCell.font = Style.FontSmallBoldRed;
                  tableBodyCell.fill = Style.FillYellow5;
                  break;
                case 'В':
                  if( totalDaysCalcCount[i] == 0 && ( ( selectedMonth < currentMonth ) || (selectedMonth == currentMonth && i <= currentDay) )){
                    totalDaysCount++;
                    totalDaysCalcCount[i] = 1;
                  }
                  tableBodyCell.font = Style.FontSmallBold;
                  break;
                case 'B':
                  if( totalDaysCalcCount[i] == 0 && ( ( selectedMonth < currentMonth ) || (selectedMonth == currentMonth && i <= currentDay) )){
                    totalDaysCount++;
                    totalDaysCalcCount[i] = 1;
                  }
                  tableBodyCell.font = Style.FontSmallBold;
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
        tableBodyCell = guard.tableBodyRow.getCell(3 + daysCount);
        tableBodyCell.value = { formula: `SUM(${guard.tableBodyRow.getCell(3).address}:${guard.tableBodyRow.getCell(2 + daysCount).address})`, result: guard.hoursCount };
        tableBodyCell.numFmt = isFloat(guard.hoursCount) ? '#.####' : '#';
        tableBodyCell.font = Style.FontSmallBold;
        tableBodyCell.alignment = Style.AlignmentMiddleCenter;
        tableBodyCell.border = Style.BorderThin;
        tableBodyCell.fill = guard.bodyRowFillColor;

        // Фиксация стартовой и оконечной яйчейки Сумма часов в строке
        totalHoursCount += guard.hoursCount;

        if (index == 0) {
          totalHoursAddressStart = tableBodyCell.address;
        }

        if (index == (guardPost.element.length - 1)) {
          totalHoursAddressFinish = tableBodyCell.address;
        }

      })

      // Переменные таблицы
      rate = rate > maxRateCalc ? (rate * totalDaysCount) / (totalHoursCount * daysCount) : rate;

      // Строки таблицы 2
      guardPost.element.forEach((guard, index) => {

        // Тариф
        var tableBodyCell = guard.tableBodyRow.getCell(4 + daysCount);
        tableBodyCell.value = rate;
        tableBodyCell.numFmt = isFloat(rate) ? '#.####' : '#';
        tableBodyCell.alignment = Style.AlignmentMiddleCenter;
        tableBodyCell.border = Style.BorderThin;

        if((rate != guardPost.rate) && (totalDaysCount!=daysCount)){
          tableBodyCell.font = Style.FontSmallBoldRed;
          tableBodyCell.fill = Style.FillYellow5;
        }else{
          tableBodyCell.font = Style.FontSmallBold;
          tableBodyCell.fill = guard.bodyRowFillColor;
        }

        // Сумма Тариф*часы
        let rateSumm = round10(guard.hoursCount * rate, 2);
        tableBodyCell = guard.tableBodyRow.getCell(5 + daysCount);
        tableBodyCell.value = {
          formula: `ROUND(PRODUCT(${guard.tableBodyRow.getCell(3 + daysCount).address}:${guard.tableBodyRow.getCell(4 + daysCount).address}), -2)`,
          result: rateSumm
        };
        tableBodyCell.numFmt = '#';
        tableBodyCell.alignment = Style.AlignmentMiddleCenter;
        tableBodyCell.border = Style.BorderThin;

        if((rate != guardPost.rate) && (totalDaysCount!=daysCount)){
          tableBodyCell.font = Style.FontSmallBoldRed;
          tableBodyCell.fill = Style.FillYellow5;
        }else{
          tableBodyCell.font = Style.FontSmallBold;
          tableBodyCell.fill = guard.bodyRowFillColor;
        }

        // Фиксация стартовой и оконечной яйчейки Сумма Тариф*часы
        totalRateSummCount += rateSumm;
        
        if (index == 0) {
          totalRateSummAddressStart = tableBodyCell.address;
        }

        if (index == (guardPost.element.length - 1)) {
          totalRateSummAddressFinish = tableBodyCell.address;
        }

      })

      // Строка итогов
      try {

        // Переменные строки итогов
        const bodyFooterFillColor = guardPost.element.length & 1 ? Style.FillYellow3 : Style.FillYellow4;

        // Добавление Строки итогов
        const tableFooterRow = worksheet.addRow();

        // Индекс
        var tableFooterCell = tableFooterRow.getCell(1);
        tableFooterCell.font = Style.FontSmall;
        tableFooterCell.alignment = Style.AlignmentMiddleCenter;
        tableFooterCell.border = Style.BorderThin;
        tableFooterCell.fill = bodyFooterFillColor;

        // Инициалы
        tableFooterCell = tableFooterRow.getCell(2);
        tableFooterCell.font = Style.FontSmall;
        tableFooterCell.alignment = Style.AlignmentMiddleLeft;
        tableFooterCell.border = Style.BorderThin;
        tableFooterCell.fill = bodyFooterFillColor;

        // Дни
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

      } catch (error) { console.log(error) }

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

    // Расчёт отступа для новой таблицы
    if (rowsCount < maxRowFullCount) {
      worksheet.addRow();
    }
  }

  return ExcelJSWorkbook.xlsx;

}



export function timesheetExcellForMonthFull(responce, usersData, date) {  

  // Переменные книги
  const daysTimesheet = getDaysFromMonth(date);
  const daysCount = daysTimesheet.length;
  const columns = daysCount + 5;
  const maxRateCalc = process.env.NEXT_PUBLIC_OVER_RATE_CALC;
  const selectedMonth = date.getMonth();
  const currentMonth = new Date().getMonth();
  const currentDay = new Date().getDate();

  // Workbook create
  const ExcelJSWorkbook = new ExcelJS.Workbook();

  // Данные отчета по охранникам
  for (const NSOdata of responce) {

    // Переменные листа
    const NSOinitials = NSOdata.surname ? [
      NSOdata.surname,
      NSOdata.firstName?.length > 0 ? NSOdata.firstName.charAt(0) + '.' : null,
      NSOdata.patronymic?.length > 0 ? NSOdata.patronymic.charAt(0) + '.' : null,
    ].filter(Boolean).join(' ') : null;

    // Worksheet create
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

    // columns heights
    try {

      worksheet.getColumn(1).width = reportExcellForMonthFull.Index.width;
      worksheet.getColumn(2).width = reportExcellForMonthFull.Initials.width;
      worksheet.getColumn(3 + daysCount).width = reportExcellForMonthFull.Count.width;
      worksheet.getColumn(4 + daysCount).width = reportExcellForMonthFull.Rate.width;
      worksheet.getColumn(5 + daysCount).width = reportExcellForMonthFull.RateSumm.width;
  
      for (let i = 0; i < daysCount; i++) {
        worksheet.getColumn(3 + i).width = reportExcellForMonthFull.Days.width;
      }

    } catch (error) { console.log(error) }

    // Заголовок страницы 
    try {

      let headerCellCenter = Math.trunc(columns / 2);

      // Имя НСО
      var customCell = worksheet.getCell(1, 2);
      customCell.font = Style.FontDefaultBold;
      customCell.alignment = Style.AlignmentMiddleLeft;
      customCell.value = `НСО: ${NSOinitials ? NSOinitials : 'не указан'}`;
      worksheet.mergeCells(1, 2, 1, headerCellCenter - 1);
  
      // Шапочка страницы
      customCell = worksheet.getCell(1, headerCellCenter);
      customCell.font = Style.FontDefaultBold;
      customCell.alignment = Style.AlignmentMiddleRightWrapText;
      customCell.value = `Утверждаю \r\n Директор ТОО \r\n "${companyName}" \r\n _______________Ким А.А.`;
      worksheet.mergeCells(1, headerCellCenter, 1, columns);
      worksheet.getRow(1).height = (defaultFontSize + 5) * 4;
  
      // Оглавление страницы 1
      customCell = worksheet.getCell(2, 1);
      customCell.font = Style.FontDefaultBold;
      customCell.alignment = Style.AlignmentMiddleCenter;
      customCell.value = `Табель сотрудников ТОО "${companyName}"`;
      worksheet.mergeCells(2, 1, 2, columns);
      
      // Оглавление страницы 2
      customCell = worksheet.getCell(3, 1);
      customCell.font = Style.FontDefaultBold;
      customCell.alignment = Style.AlignmentMiddleCenter;
      customCell.value = `за ${date.toLocaleDateString('ru-KZ', { year: 'numeric', month: 'long' })}`;
      worksheet.mergeCells(3, 1, 3, columns);

    } catch (error) { console.log(error) }

    // Тело таблицы
    var rowsCount = 7;

    for (const guardPost of NSOdata.guardPosts) {

      // Расчёт разрыва страницы
      let indexElementsB = guardPost.element?.length > 0 ? guardPost.element.length + 4 : 3;

      if (rowsCount + indexElementsB > maxRowFullCount) {
        worksheet.lastRow.addPageBreak();
        rowsCount = indexElementsB;
      } else {
        rowsCount += indexElementsB;
      }

      // Заголовок таблицы
      try {

        // Наименование таблицы
        let tableCaptionRow = worksheet.addRow([[guardPost.number ? '№' + guardPost.number : null, guardPost.callsign, guardPost.name, guardPost.address].filter(Boolean).join(', ')]);
        let tableCustomCell = tableCaptionRow.getCell(1);
        tableCustomCell.font = Style.FontMediumBold;
        tableCustomCell.alignment = Style.AlignmentMiddleCenter;
        tableCustomCell.fill = Style.FillYellow1;
        tableCustomCell.border = Style.BorderThin;
        worksheet.mergeCells(tableCaptionRow.number, 1, tableCaptionRow.number, columns);

        // Заголовок таблицы
        let tableHeaderRow = worksheet.addRow();
        tableHeaderRow.height = 27;
        
        // Индекс
        tableCustomCell = tableHeaderRow.getCell(1);
        tableCustomCell.value = reportExcellForMonthFull.Index.text;
        tableCustomCell.font = Style.FontSmall;
        tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
        tableCustomCell.fill = Style.FillYellow1;
        tableCustomCell.border = Style.BorderThin;

        // Инициалы охранника
        tableCustomCell = tableHeaderRow.getCell(2);
        tableCustomCell.value = reportExcellForMonthFull.Initials.text;
        tableCustomCell.font = Style.FontSmall;
        tableCustomCell.alignment = Style.AlignmentMiddleCenter;
        tableCustomCell.fill = Style.FillYellow1;
        tableCustomCell.border = Style.BorderThin;

        // Кол-во часов
        tableCustomCell = tableHeaderRow.getCell(3 + daysCount);
        tableCustomCell.value = reportExcellForMonthFull.Count.text;
        tableCustomCell.font = Style.FontSmall;
        tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
        tableCustomCell.fill = Style.FillYellow1;
        tableCustomCell.border = Style.BorderThin;

        // Тариф
        tableCustomCell = tableHeaderRow.getCell(4 + daysCount);
        tableCustomCell.value = reportExcellForMonthFull.Rate.text;
        tableCustomCell.font = Style.FontSmall;
        tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
        tableCustomCell.fill = Style.FillYellow1;
        tableCustomCell.border = Style.BorderThin;

        // Сумма
        tableCustomCell = tableHeaderRow.getCell(5 + daysCount);
        tableCustomCell.value = reportExcellForMonthFull.RateSumm.text;
        tableCustomCell.font = Style.FontSmall;
        tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
        tableCustomCell.fill = Style.FillYellow1;
        tableCustomCell.border = Style.BorderThin;

        // Дни
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
      } catch (error) { console.log(error) }
      
      // Тело таблицы
      if (guardPost.element?.length > 0) {

        // Переменные таблицы
        var totalHoursCount = 0;
        var totalDaysCount = 0;
        const totalDaysHoursCount = new Array(daysCount).fill(0);
        const totalDaysCalcCount = new Array(daysCount).fill(0);
        const totalDaysHoursCountAddressStart = new Array(daysCount).fill('');
        const totalDaysHoursCountAddressFinish = new Array(daysCount).fill('');
        var totalHoursAddressStart = '';
        var totalHoursAddressFinish = '';
        var totalRateSummCount = 0;
        var totalRateSummAddressStart = '';
        var totalRateSummAddressFinish = '';
        var rate = guardPost.rate ? guardPost.rate : 0;

        // Строки таблицы 1
        guardPost.element.forEach((guard, index) => {

          // Переменные строк таблицы
          guard.bodyRowFillColor = index & 1 ? Style.FillYellow3 : Style.FillYellow4;

          // Добавление строки таблицы
          guard.tableBodyRow = worksheet.addRow();

          // Индекс строки таблицы
          var tableBodyCell = guard.tableBodyRow.getCell(1);
          tableBodyCell.value = index + 1;
          tableBodyCell.font = Style.FontSmall;
          tableBodyCell.alignment = Style.AlignmentMiddleCenter;
          tableBodyCell.border = Style.BorderThin;
          tableBodyCell.fill = guard.bodyRowFillColor;

          // Инициалы строки таблицы
          tableBodyCell = guard.tableBodyRow.getCell(2);
          tableBodyCell.value = [guard.surname, guard.firstName].join(' ');
          tableBodyCell.font = Style.FontSmall;
          tableBodyCell.alignment = Style.AlignmentMiddleLeft;
          tableBodyCell.border = Style.BorderThin;
          tableBodyCell.fill = guard.bodyRowFillColor;

          // Часы в днях таблицы
          guard.hoursCount = 0;

          for (let i = 0; i < daysCount; i++) {

            tableBodyCell = guard.tableBodyRow.getCell(3 + i);
            tableBodyCell.alignment = Style.AlignmentMiddleCenter;
            tableBodyCell.border = Style.BorderThin;

            if (daysTimesheet[i] == 'сб' || daysTimesheet[i] == 'вс') {
              tableBodyCell.fill = Style.FillYellow3;
            } else {
              tableBodyCell.fill = guard.bodyRowFillColor;
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
                guard.hoursCount += shift;
                tableBodyCell.value = shift;
                tableBodyCell.font = Style.FontSmall;

                if( totalDaysCalcCount[i] == 0 ){
                  totalDaysCount++;
                  totalDaysCalcCount[i] = 1;
                }

                totalDaysHoursCount[i] += shift;

              } else {
                tableBodyCell.value = guard.timesheetShifts[indexOfDay];
                switch (guard.timesheetShifts[indexOfDay]) {
                  case '?':
                    tableBodyCell.font = Style.FontSmallBoldRed;
                    tableBodyCell.fill = Style.FillYellow5;
                    break;
                  case 'В':
                    if( totalDaysCalcCount[i] == 0 && ( ( selectedMonth < currentMonth ) || (selectedMonth == currentMonth && i <= currentDay) )){
                      totalDaysCount++;
                      totalDaysCalcCount[i] = 1;
                    }
                    tableBodyCell.font = Style.FontSmallBold;
                    break;
                  case 'B':
                    if( totalDaysCalcCount[i] == 0 && ( ( selectedMonth < currentMonth ) || (selectedMonth == currentMonth && i <= currentDay) )){
                      totalDaysCount++;
                      totalDaysCalcCount[i] = 1;
                    }
                    tableBodyCell.font = Style.FontSmallBold;
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
          tableBodyCell = guard.tableBodyRow.getCell(3 + daysCount);
          tableBodyCell.value = { formula: `SUM(${guard.tableBodyRow.getCell(3).address}:${guard.tableBodyRow.getCell(2 + daysCount).address})`, result: guard.hoursCount };
          tableBodyCell.numFmt = isFloat(guard.hoursCount) ? '#.####' : '#';
          tableBodyCell.font = Style.FontSmallBold;
          tableBodyCell.alignment = Style.AlignmentMiddleCenter;
          tableBodyCell.border = Style.BorderThin;
          tableBodyCell.fill = guard.bodyRowFillColor;

          // Фиксация стартовой и оконечной яйчейки Сумма часов в строке
          totalHoursCount += guard.hoursCount;

          if (index == 0) {
            totalHoursAddressStart = tableBodyCell.address;
          }

          if (index == (guardPost.element.length - 1)) {
            totalHoursAddressFinish = tableBodyCell.address;
          }

        })

        // Переменные таблицы
        rate = rate > maxRateCalc ? (rate * totalDaysCount) / (totalHoursCount * daysCount) : rate;

        // Строки таблицы 2
        guardPost.element.forEach((guard, index) => {

          // Тариф
          var tableBodyCell = guard.tableBodyRow.getCell(4 + daysCount);
          tableBodyCell.value = rate;
          tableBodyCell.numFmt = isFloat(rate) ? '#.####' : '#';
          tableBodyCell.alignment = Style.AlignmentMiddleCenter;
          tableBodyCell.border = Style.BorderThin;

          if((rate != guardPost.rate) && (totalDaysCount!=daysCount)){
            tableBodyCell.font = Style.FontSmallBoldRed;
            tableBodyCell.fill = Style.FillYellow5;
          }else{
            tableBodyCell.font = Style.FontSmallBold;
            tableBodyCell.fill = guard.bodyRowFillColor;
          }

          // Сумма Тариф*часы
          let rateSumm = round10(guard.hoursCount * rate, 2);

          tableBodyCell = guard.tableBodyRow.getCell(5 + daysCount);
          tableBodyCell.value = {
            formula: `ROUND(PRODUCT(${guard.tableBodyRow.getCell(3 + daysCount).address}:${guard.tableBodyRow.getCell(4 + daysCount).address}), -2)`,
            result: rateSumm
          };
          tableBodyCell.numFmt = '#';
          tableBodyCell.alignment = Style.AlignmentMiddleCenter;
          tableBodyCell.border = Style.BorderThin;

          if((rate != guardPost.rate) && (totalDaysCount!=daysCount)){
            tableBodyCell.font = Style.FontSmallBoldRed;
            tableBodyCell.fill = Style.FillYellow5;
          }else{
            tableBodyCell.font = Style.FontSmallBold;
            tableBodyCell.fill = guard.bodyRowFillColor;
          }

          // Фиксация стартовой и оконечной яйчейки Сумма Тариф*часы
          totalRateSummCount += rateSumm;
          
          if (index == 0) {
            totalRateSummAddressStart = tableBodyCell.address;
          }

          if (index == (guardPost.element.length - 1)) {
            totalRateSummAddressFinish = tableBodyCell.address;
          }

        })

        // Строка итогов
        try {
          // Переменные строки итогов
          const bodyFooterFillColor = guardPost.element.length & 1 ? Style.FillYellow3 : Style.FillYellow4;

          const summGuardPostShifts = guardPost.shifts?.length > 0 ?
            guardPost.shifts.reduce((result, value) => {
              let shiftHours = parseInt(value);
              if (shiftHours > 0) {
                result += shiftHours;
              }
              return result;
            }, 0) : defaultDayShift;

          // console.log('guardPost: %o, summGuardPostShifts: %o',
          //     [guardPost.number ? '№' + guardPost.number : null, guardPost.callsign, guardPost.name, guardPost.address].filter(Boolean).join(', '),
          //     summGuardPostShifts
          //     );

          // Добавление Строки итогов
          const tableFooterRow = worksheet.addRow();

          // Индекс
          var tableFooterCell = tableFooterRow.getCell(1);
          tableFooterCell.font = Style.FontSmall;
          tableFooterCell.alignment = Style.AlignmentMiddleCenter;
          tableFooterCell.border = Style.BorderThin;
          tableFooterCell.fill = bodyFooterFillColor;

          // Инициалы
          tableFooterCell = tableFooterRow.getCell(2);
          tableFooterCell.font = Style.FontSmall;
          tableFooterCell.alignment = Style.AlignmentMiddleLeft;
          tableFooterCell.border = Style.BorderThin;
          tableFooterCell.fill = bodyFooterFillColor;

          // Дни
          for (let i = 0; i < daysCount; i++) {

            const isDayOff = daysTimesheet[i] == "сб" || daysTimesheet[i] == "вс";
            const value = totalDaysHoursCount[i] > 0 ? totalDaysHoursCount[i] : '';
            // Style.Fill 
            const bodyFooterCellFillColor = value > 0 ? (
              value < summGuardPostShifts ?
                (isDayOff ? Style.FillRose300 : Style.FillRose200)
                : (
                  value > summGuardPostShifts ?
                    (isDayOff ? Style.FillOrange300 : Style.FillOrange200)
                    :
                    (isDayOff ? Style.FillEmerald300 : Style.FillEmerald200)
                )
            ) : ( isDayOff ? Style.FillAmber100 : Style.FillStone50 )

            const bodyFooterCellFont = value > 0 ? (
              value < summGuardPostShifts ?
                (isDayOff ? Style.FontSmallOrange900 : Style.FontSmallOrange700)
                : (
                  value > summGuardPostShifts ?
                    (isDayOff ? Style.FontSmallRose900 : Style.FontSmallRose700)
                    :
                    (isDayOff ? Style.FontSmallOrange900 : Style.FontSmallOrange700)
                )
            ) : (
              isDayOff ? Style.FontSmallOrange900 : Style.FontSmallOrange700
            )

            tableFooterCell = tableFooterRow.getCell(3 + i);
            tableFooterCell.font = bodyFooterCellFont;
            tableFooterCell.alignment = Style.AlignmentMiddleCenter;
            tableFooterCell.border = Style.BorderThin;
            tableFooterCell.fill = bodyFooterCellFillColor;
            tableFooterCell.value = {
              formula: `SUM(${totalDaysHoursCountAddressStart[i]}:${totalDaysHoursCountAddressFinish[i]})`,
              result: value,
            };
            tableFooterCell.numFmt = isFloat(totalDaysHoursCount[i]) ? '#.####' : '#';

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

        } catch (error) { console.log(error) }

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
      
      // Расчёт отступа для новой таблицы
      if (rowsCount < maxRowFullCount) {
        worksheet.addRow();
      }
    }

  }

  return ExcelJSWorkbook.xlsx;

}

export function timesheetExcellForMonthBuh(responce, date) {

  // Переменные листа
  const columns = 11;
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
      },
    },
    views: [{
      state: 'frozen',
      xSplit: 2,
      ySplit: 4,
      // topLeftCell: 'G1', 
      // activeCell: 'A1'
    }]
  });

  //columns heights
  try {

    var keyIndex = 0;

    mapValue(reportExcellForMonthBuh, (value, key) => {

      keyIndex++;

      worksheet.getColumn(keyIndex).width = reportExcellForMonthBuh[key].width;

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

    var tableFooterRow = worksheet.addRow();

    tableFooterRow.height = 27;

    var keyIndex = 0;

    mapValue(reportExcellForMonthBuh, (value, key) => {

      keyIndex++;

      let tableCustomCell = tableFooterRow.getCell(keyIndex);
      tableCustomCell.value = reportExcellForMonthBuh[key].text;
      tableCustomCell.font = Style.FontSmallBold;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

    })

  } catch (error) { console.log(error) }

  // Тело таблицы
  var rowsCount = tableBodyStartRow + 1;
  var indexStartRow = tableBodyStartRow + 1;
  var indexEndRow;
  var allSummFinish = 0;

  responce.forEach((guard, indexA) => {

    //Start variable
    const bodyRowFillColor = indexA & 1 ? Style.FillNone : Style.FillGrey1;

    indexEndRow = indexStartRow + (guard.element.length > 1 ? guard.element.length : 0);

    // Calc Page breaker
    let indexElementsB = guard.element.length > 1 ? guard.element.length + 1 : 1;

    if (rowsCount + indexElementsB > maxRowBuhCount) {
      worksheet.lastRow.addPageBreak();
      rowsCount = indexElementsB;
    } else {
      rowsCount += indexElementsB;
    }

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
    var isOverRate = true;

    guard.element.forEach((guardPost, indexB) => {

      // Object
      tableBodyCell = worksheet.getCell(indexStartRow + indexB, 3);
      tableBodyCell.value = guardPost.number ? +guardPost.number : guardPost.callsign;
      tableBodyCell.font = Style.FontSmall;
      tableBodyCell.alignment = Style.AlignmentMiddleCenter;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = bodyRowFillColor;

      // Calculate Summ
      let totalHoursCount = guardPost.timesheetShifts.reduce((partialSum, a) => partialSum + (isNaN(a) || !a ? 0 : parseInt(a)), 0);
      let rate = guardPost.rate;
      let isFinished = guardPost.isFinished;

      if (!totalHoursCount) {
        console.log('%o', guardPost.timesheetShifts);
      }

      let guardPostSumm = round10(totalHoursCount * rate, 2);
      isOverRate = isOverRate && guardPostSumm && isFinished;
      allSumm += guardPostSumm ? guardPostSumm : 0;

      // Summ
      tableBodyCell = worksheet.getCell(indexStartRow + indexB, 4);
      tableBodyCell.value = guardPostSumm ? {
        formula: `ROUND(${guardPostSumm}, -2)`,
        result: guardPostSumm
      } : (totalHoursCount ? totalHoursCount + "ч" : "?");
      tableBodyCell.numFmt = '#';
      tableBodyCell.font = guardPostSumm && isFinished ? Style.FontSmall : Style.FontSmallBoldRed;
      tableBodyCell.alignment = Style.AlignmentMiddleCenter;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = bodyRowFillColor;

    })

    // Слияние данных если выход выполнялся на несколько физ постов
    if (indexStartRow != indexEndRow) {
      worksheet.mergeCells(indexStartRow, 1, indexEndRow, 1);
      worksheet.mergeCells(indexStartRow, 2, indexEndRow, 2);
      worksheet.mergeCells(indexStartRow, 5, indexEndRow, 5);
      worksheet.mergeCells(indexStartRow, 6, indexEndRow, 6);
      worksheet.mergeCells(indexStartRow, 7, indexEndRow, 7);
      worksheet.mergeCells(indexStartRow, 8, indexEndRow, 8);
      worksheet.mergeCells(indexStartRow, 9, indexEndRow, 9);
      worksheet.mergeCells(indexStartRow, 10, indexEndRow, 10);
      worksheet.mergeCells(indexStartRow, 11, indexEndRow, 11);

      // Object all
      tableBodyCell = worksheet.getCell(indexEndRow, 3);
      tableBodyCell.value = "итого";
      tableBodyCell.font = Style.FontSmall;
      tableBodyCell.alignment = Style.AlignmentMiddleRight;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = bodyRowFillColor;

      // Summ all
      tableBodyCell = worksheet.getCell(indexEndRow, 4);
      tableBodyCell.value = {
        formula: `SUM(${worksheet.getCell(indexStartRow, 4).address}:${worksheet.getCell(indexEndRow - 1, 4).address})`,
        result: allSumm
      };
      tableBodyCell.font = Style.FontSmall;
      tableBodyCell.alignment = Style.AlignmentMiddleCenter;
      tableBodyCell.border = Style.BorderThin;
      tableBodyCell.fill = bodyRowFillColor;

    }

    // Awards
    tableBodyCell = worksheet.getCell(indexStartRow, 5);
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.alignment = Style.AlignmentMiddleCenter;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    // Taxes
    tableBodyCell = worksheet.getCell(indexStartRow, 6);
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.alignment = Style.AlignmentMiddleCenter;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    // Advance
    tableBodyCell = worksheet.getCell(indexStartRow, 7);
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.alignment = Style.AlignmentMiddleCenter;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    // Payoff
    tableBodyCell = worksheet.getCell(indexStartRow, 8);
    tableBodyCell.value = {
      formula: `ROUND(${worksheet.getCell(indexEndRow, 4).address
        }+${worksheet.getCell(indexStartRow, 5).address
        }-${worksheet.getCell(indexStartRow, 6).address
        }-${worksheet.getCell(indexStartRow, 7).address
        }, -1)`,
      result: allSumm
    };
    tableBodyCell.font = isOverRate ? Style.FontSmall : Style.FontSmallBoldRed;
    tableBodyCell.alignment = Style.AlignmentMiddleCenter;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    // Sign
    tableBodyCell = worksheet.getCell(indexStartRow, 9);
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.alignment = Style.AlignmentMiddleLeft;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    // Date
    tableBodyCell = worksheet.getCell(indexStartRow, 10);
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.alignment = Style.AlignmentMiddleLeft;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    // SignInitials
    tableBodyCell = worksheet.getCell(indexStartRow, 11);
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.alignment = Style.AlignmentMiddleLeft;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    // Variables
    allSummFinish += allSumm;
    indexStartRow = indexEndRow + 1;
  });

  // Низ таблицы
  try {

    var tableFooterRow = worksheet.addRow();

    tableFooterRow.height = 27;

    var keyIndex = 0;

    mapValue(reportExcellForMonthBuh, (value, key) => {

      keyIndex++;

      let tableCustomCell = tableFooterRow.getCell(keyIndex);
      tableCustomCell.font = Style.FontSmallBold;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow3;
      tableCustomCell.border = Style.BorderThin;

    })

    tableFooterRow.getCell(2).value = "ИТОГО:"

    tableFooterRow.getCell(5).value = {
      formula: `SUM(${worksheet.getCell(5, 5).address}:${worksheet.getCell(indexEndRow, 5).address})`,
      result: 0
    };

    tableFooterRow.getCell(6).value = {
      formula: `SUM(${worksheet.getCell(5, 6).address}:${worksheet.getCell(indexEndRow, 6).address})`,
      result: 0
    };

    tableFooterRow.getCell(7).value = {
      formula: `SUM(${worksheet.getCell(5, 7).address}:${worksheet.getCell(indexEndRow, 7).address})`,
      result: 0
    };

    tableFooterRow.getCell(8).value = {
      formula: `SUM(${worksheet.getCell(5, 8).address}:${worksheet.getCell(indexEndRow, 8).address})`,
      result: allSummFinish
    };

  } catch (error) { console.log(error) }

  return ExcelJSWorkbook.xlsx;

}
