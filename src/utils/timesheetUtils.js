
import ExcelJS from "exceljs";

const tableHeader = {
  Index: {
    width: 3.5,
    text: '№\r\nп/п'
  },
  Initials: {
    width: 31.25,
    text: 'Ф.И.О.',
  },
  Days: {
    width: 3.05,
  },
  Count: {
    width: 6.15,
    text: 'кол-во\r\nчас',
  }
}

const smallFontSize = 10;
const defaultFontSize = 14;
const maxRowCount = 28;
const companyName = 'Тұмар Гарант Астана';

const Style ={
  AlignmentMiddleCenter: { vertical: 'middle', horizontal: 'center' },
  AlignmentMiddleLeft: { vertical: 'middle', horizontal: 'left' },
  AlignmentMiddleCenterWrapText: { vertical: 'middle', horizontal: 'center', wrapText: true },
  AlignmentMiddleRightWrapText: { vertical: 'middle', horizontal: 'right', wrapText: true },
  FontDefault: { name: "Calibri", family: 1, size: defaultFontSize },
  FontDefaultBold: { name: "Calibri", family: 1, size: defaultFontSize, bold: true },
  FontSmall: { name: "Calibri", family: 1, size: smallFontSize },
  FontSmallBold: { name: "Calibri", family: 1, size: smallFontSize, bold: true },
  FillYelow: {type: 'pattern',pattern:'solid',fgColor:{argb:'FFFFFF00'},},
  BorderThin: {top: {style:'thin'},left: {style:'thin'},bottom: {style:'thin'},right: {style:'thin'}}
}

export function timesheetPrint( responce, date ) {

    const daysCount = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const columns = daysCount+3;

    // Workbook and worksheet create
    var ExcelJSWorkbook = new ExcelJS.Workbook();
    var worksheet = ExcelJSWorkbook.addWorksheet("Табель",{
      pageSetup:{
        paperSize: 9, 
        orientation:'landscape',
        margins:{
          left: 0.25, right: 0.25,
          top: 0.6, bottom: 0.6,
          header: 0.25, footer: 0.25
        }
      }
    });

    // Header 
    var customCell = worksheet.getCell(1, 1);
    customCell.font = Style.FontDefaultBold;
    customCell.alignment = Style.AlignmentMiddleRightWrapText;
    customCell.value = `Утверждаю \r\n Директор ТОО \r\n "${companyName}" \r\n _______________Ким А.А.`;
    worksheet.mergeCells(1, 1, 1, columns);
    worksheet.getRow(1).height = (defaultFontSize + 5)*4;

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
    worksheet.getColumn(3+daysCount).width = tableHeader.Count.width;
    for (let i = 0; i < daysCount; i++) {
      worksheet.getColumn(3+i).width = tableHeader.Days.width;
    }

    var rowsCount = 0;

    // guard post table
    Object.keys(responce).forEach((key) => {
      // Данные поста
      var guardPost = responce[key];
      
      var tableRowsCount = guardPost.guardRow?.length > 0 ? guardPost.guardRow.length + 5 :  3;

      if(rowsCount>0){
        if(rowsCount + tableRowsCount > maxRowCount){
          if (rowsCount<maxRowCount) {
            worksheet.addRow();
          }
          worksheet.lastRow.addPageBreak();
          rowsCount = 0;
        }else{
          worksheet.addRow();
        }
      }

      rowsCount+=tableRowsCount;

      // Наименование таблицы
      var tableCaptionRow = worksheet.addRow([[guardPost.number?'№'+guardPost.number:null, guardPost.name, guardPost.address].join(', ')]);
      var tableCustomCell = tableCaptionRow.getCell(1);
      tableCustomCell.font = Style.FontSmallBold;
      tableCustomCell.alignment = Style.AlignmentMiddleCenter;
      tableCustomCell.fill = Style.FillYelow;
      tableCustomCell.border = Style.BorderThin;
      worksheet.mergeCells(tableCaptionRow.number, 1, tableCaptionRow.number, columns);

      // Заголовок таблицы
      var tableHeaderRow = worksheet.addRow();
      tableHeaderRow.height=27;

      tableCustomCell = tableHeaderRow.getCell(1);
      tableCustomCell.value = tableHeader.Index.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYelow;
      tableCustomCell.border = Style.BorderThin;

      tableCustomCell = tableHeaderRow.getCell(2);
      tableCustomCell.value = tableHeader.Initials.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenter;
      tableCustomCell.fill = Style.FillYelow;
      tableCustomCell.border = Style.BorderThin;

      tableCustomCell = tableHeaderRow.getCell(3+daysCount);
      tableCustomCell.value = tableHeader.Count.text;
      tableCustomCell.font = Style.FontSmall;
      tableCustomCell.alignment = Style.AlignmentMiddleCenterWrapText;
      tableCustomCell.fill = Style.FillYelow;
      tableCustomCell.border = Style.BorderThin;

      for (let i = 0; i < daysCount; i++) {
        tableCustomCell = tableHeaderRow.getCell(3+i);
        tableCustomCell.value = i+1;
        tableCustomCell.font = Style.FontSmall;
        tableCustomCell.alignment = Style.AlignmentMiddleCenter;
        tableCustomCell.fill = Style.FillYelow;
        tableCustomCell.border = Style.BorderThin;
      }

      // Тело таблицы
      if(guardPost.guardRow?.length>0){

        var totalHoursCount = 0;
        var totalHoursAddressStart = '';
        var totalHoursAddressFinish = '';
        // Тело таблицы
        guardPost.guardRow.forEach((guard, i)=>{
          
          const tableBodyRow = worksheet.addRow();

          var tableBodyCell = tableBodyRow.getCell(1);
          tableBodyCell.value = i+1;
          tableBodyCell.font = Style.FontSmall;
          tableBodyCell.alignment = Style.AlignmentMiddleCenter;
          tableBodyCell.border = Style.BorderThin;
          
          tableBodyCell = tableBodyRow.getCell(2);
          tableBodyCell.value = [guard.surname, guard.firstName].join(' ');
          tableBodyCell.font = Style.FontSmall;
          tableBodyCell.alignment = Style.AlignmentMiddleLeft;
          tableBodyCell.border = Style.BorderThin;
          
          var hoursCount = 0;

          for (let i = 0; i < daysCount; i++) {

            tableBodyCell = tableBodyRow.getCell(3+i);
            tableBodyCell.font = Style.FontSmall;
            tableBodyCell.alignment = Style.AlignmentMiddleCenter;
            tableBodyCell.border = Style.BorderThin;

            let index = guard.timesheetDays?.indexOf(i);

            if( index>=0 ){

              let shift = parseInt(guard.timesheetShifts[index]);
              hoursCount += shift;

              tableBodyCell.value = shift;

            }
          }

          tableBodyCell = tableBodyRow.getCell(3+daysCount);
          tableBodyCell.value = { formula: `SUM(${tableBodyRow.getCell(3).address}:${tableBodyRow.getCell(2+daysCount).address})`, result: hoursCount };
          tableBodyCell.font = Style.FontSmall;
          tableBodyCell.alignment = Style.AlignmentMiddleCenter;
          tableBodyCell.border = Style.BorderThin;

          totalHoursCount +=hoursCount;

          if (i==0) {
            totalHoursAddressStart = tableBodyCell.address;
          }

          if (i==(guardPost.guardRow.length-1)) {
            totalHoursAddressFinish = tableBodyCell.address;
          }
          
        })

        // Строка итогов
        const tableFooterRow = worksheet.addRow();

        var tableFooterCell = tableFooterRow.getCell(1);
        tableFooterCell.font = Style.FontSmall;
        tableFooterCell.alignment = Style.AlignmentMiddleCenter;
        tableFooterCell.border = Style.BorderThin;
        
        tableFooterCell = tableFooterRow.getCell(2);
        tableFooterCell.font = Style.FontSmall;
        tableFooterCell.alignment = Style.AlignmentMiddleLeft;
        tableFooterCell.border = Style.BorderThin;

        for (let i = 0; i < daysCount; i++) {

          tableFooterCell = tableFooterRow.getCell(3+i);
          tableFooterCell.font = Style.FontSmall;
          tableFooterCell.alignment = Style.AlignmentMiddleCenter;
          tableFooterCell.border = Style.BorderThin;

        }

        tableFooterCell = tableFooterRow.getCell(3+daysCount);
        tableFooterCell.value = { formula: `SUM(${totalHoursAddressStart}:${totalHoursAddressFinish})`, result: totalHoursCount };
        tableFooterCell.font = Style.FontSmallBold;
        tableFooterCell.alignment = Style.AlignmentMiddleCenter;
        tableFooterCell.border = Style.BorderThin;

      }else{

        // Строка отсутствия данных
        var tableEmptyRow = worksheet.addRow();
        var tableEmptyCell = tableEmptyRow.getCell(1);
        tableEmptyCell.value = 'Отсутствуют данные';
        tableEmptyCell.font = Style.FontSmall;
        tableEmptyCell.alignment = Style.AlignmentMiddleCenter;
        tableEmptyCell.fill = Style.FillYelow;
        tableEmptyCell.border = Style.BorderThin;
        worksheet.mergeCells(tableEmptyRow.number, 1, tableEmptyRow.number, columns);

      }

    })
    
    // export to file
    return ExcelJSWorkbook.xlsx.writeBuffer();

}