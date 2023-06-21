
import ExcelJS from "exceljs";
import { getDaysFromMonth } from "./dateUtils";
import { FPositionBUH, FPositionHRM, FPositionZDIR } from "../../components/levelZ_variable/FPositionItemList";
import { isFloat, ceil10, round10 } from "./mathUtils";
import { mapValue } from "./arrayUtils";

const reportColumnsForAllGuardPosts = {
  Index: {
    width: 3.50,
    text: '№ п.п.',
  },
  Number: {
    width: 5.00,
    text: '№ поста',
  },
  Callsign: {
    width: 14.00,
    text: 'Позывной',
  },
  NameAddress: {
    width: 55.00,
    text: 'Наименование и адрес',
  },
  Rate: {
    width: 8.50,
    text: 'Тариф',
  },
  Manager: {
    width: 14.00,
    text: 'НСО',
  },
}

const reportColumnsForAllProtectedObjects = {
  Index: {
    width: 3.50,
    text: '№ п.п.',
  },
  Number: {
    width: 5.00,
    text: '№ объекта',
  },
  NameAddress: {
    width: 55.00,
    text: 'Наименование и адрес',
  },
}

const smallFontSize = 9;
const mediumFontSize = 12;
const defaultFontSize = 14;
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
  FillGrey2: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9D9D9' }, },
  FillNone: { type: 'pattern', pattern: 'none', },
  BorderThin: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
}

export function reportForAllGuardPosts(responce) {

  // Переменные листа
  const date = new Date();
  const columns = 6;

  // Workbook and worksheet create
  const ExcelJSWorkbook = new ExcelJS.Workbook();

  const worksheet = ExcelJSWorkbook.addWorksheet("Список физ. постов", {
    pageSetup: {
      paperSize: 9,
      orientation: 'portrait',
      margins: {
        left: 0.25, right: 0.25,
        top: 0.6, bottom: 0.6,
        header: 0.25, footer: 0.25
      },
    },
    // views: [{
    //   state: 'frozen',
    //   xSplit: 2,
    //   ySplit: 4,
    // }]
  });

  //columns heights
  try {

    var keyIndex = 0;

    mapValue(reportColumnsForAllGuardPosts, (value, key) => {

      keyIndex++;

      worksheet.getColumn(keyIndex).width = reportColumnsForAllGuardPosts[key].width;

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
    customCell.value = `Список физ постов`;
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

    mapValue(reportColumnsForAllGuardPosts, (value, key) => {

      keyIndex++;

      let tableCustomCell = tableHeaderRow.getCell(keyIndex);
      tableCustomCell.value = reportColumnsForAllGuardPosts[key].text;
      tableCustomCell.font = Style.FontSmallBold;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

    })

  } catch (error) { console.log(error) }

  // Тело таблицы
  var colorIndex = 1;
  var currentManager;

  responce.forEach((guardPost, indexA) => {

    //Start variable
    colorIndex += guardPost.manager?._id?.equals(currentManager?._id) ? 0 : 1;

    currentManager = guardPost.manager;

    const bodyRowFillColor = colorIndex & 1 ? Style.FillNone : Style.FillGrey2;

    const tableBodyRow = worksheet.addRow();

    // Index
    var tableBodyCell = tableBodyRow.getCell( 1 );
    tableBodyCell.value = indexA + 1;
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.numFmt = '#';
    tableBodyCell.alignment = Style.AlignmentMiddleCenter;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    // Number
    tableBodyCell = tableBodyRow.getCell( 2 );
    tableBodyCell.value = guardPost.number ? parseInt(guardPost.number) : '';
    tableBodyCell.font = Style.FontSmallBold;
    tableBodyCell.numFmt = '#';
    tableBodyCell.alignment = Style.AlignmentMiddleCenter;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    // Callsign
    tableBodyCell = tableBodyRow.getCell( 3 );
    tableBodyCell.value = guardPost.callsign;
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.alignment = Style.AlignmentMiddleLeftWrapText;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    // Name address
    tableBodyCell = tableBodyRow.getCell( 4 );
    tableBodyCell.value = [guardPost.name, guardPost.address].filter(Boolean).join(', ');
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.alignment = Style.AlignmentMiddleCenterWrapText;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    // Rate
    tableBodyCell = tableBodyRow.getCell( 5 );
    tableBodyCell.value = guardPost.rate;
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.numFmt = '#.####';
    tableBodyCell.alignment = Style.AlignmentMiddleCenter;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    // Manager
    const NSOinitials = guardPost.manager?.surname ? [
      guardPost.manager.surname,
      guardPost.manager.firstName?.length > 0 ? guardPost.manager.firstName.charAt(0) + '.' : null,
      guardPost.manager.patronymic?.length > 0 ? guardPost.manager.patronymic.charAt(0) + '.' : null,
    ].filter(Boolean).join(' ') : 'без НСО';

    tableBodyCell = tableBodyRow.getCell( 6 );
    tableBodyCell.value = NSOinitials;
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.alignment = Style.AlignmentMiddleLeftWrapText;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

  });

  return ExcelJSWorkbook.xlsx;

}

export function reportForAllProtectedObjects(responce) {

  // Переменные листа
  const date = new Date();
  const columns = 3;

  // Workbook and worksheet create
  const ExcelJSWorkbook = new ExcelJS.Workbook();

  const worksheet = ExcelJSWorkbook.addWorksheet("Список физ. постов", {
    pageSetup: {
      paperSize: 9,
      orientation: 'portrait',
      margins: {
        left: 0.25, right: 0.25,
        top: 0.6, bottom: 0.6,
        header: 0.25, footer: 0.25
      },
    }
  });

  //columns heights
  try {

    var keyIndex = 0;

    mapValue(reportColumnsForAllProtectedObjects, (value, key) => {

      keyIndex++;

      worksheet.getColumn(keyIndex).width = reportColumnsForAllProtectedObjects[key].width;

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
    customCell.value = `Список пультовых объектов`;
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

    mapValue(reportColumnsForAllProtectedObjects, (value, key) => {

      keyIndex++;

      let tableCustomCell = tableHeaderRow.getCell(keyIndex);
      tableCustomCell.value = reportColumnsForAllProtectedObjects[key].text;
      tableCustomCell.font = Style.FontSmallBold;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYellow1;
      tableCustomCell.border = Style.BorderThin;

    })

  } catch (error) { console.log(error) }

  // Тело таблицы

  responce.forEach((protectedObject, indexA) => {

    // Переменные строки итогов
    const bodyRowFillColor = indexA & 1 ? Style.FillYellow3 : Style.FillYellow4;

    const tableBodyRow = worksheet.addRow();

    // Index
    var tableBodyCell = tableBodyRow.getCell( 1 );
    tableBodyCell.value = indexA + 1;
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.numFmt = '#';
    tableBodyCell.alignment = Style.AlignmentMiddleCenter;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    // Number
    tableBodyCell = tableBodyRow.getCell( 2 );
    tableBodyCell.value = protectedObject.number ? parseInt(protectedObject.number) : '';
    tableBodyCell.font = Style.FontSmallBold;
    tableBodyCell.numFmt = '#';
    tableBodyCell.alignment = Style.AlignmentMiddleCenter;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

    // Name address
    tableBodyCell = tableBodyRow.getCell( 3 );
    tableBodyCell.value = [protectedObject.name, protectedObject.address].filter(Boolean).join(', ');
    tableBodyCell.font = Style.FontSmall;
    tableBodyCell.alignment = Style.AlignmentMiddleCenterWrapText;
    tableBodyCell.border = Style.BorderThin;
    tableBodyCell.fill = bodyRowFillColor;

  });

  return ExcelJSWorkbook.xlsx;

}