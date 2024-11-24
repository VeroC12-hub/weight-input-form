const express = require('express');
const ExcelJS = require('exceljs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Change this path to where you want to save the Excel file
const EXCEL_FILE = 'C:/WeightCheck/weight-checks.xlsx';

app.post('/api/weight-check', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    let sheet;
    
    try {
      await workbook.xlsx.readFile(EXCEL_FILE);
      sheet = workbook.getWorksheet('Weight Checks');
    } catch {
      sheet = workbook.addWorksheet('Weight Checks');
      sheet.columns = [
        { header: 'Date', key: 'date' },
        { header: 'Time', key: 'time' },
        { header: 'Operator', key: 'operatorName' },
        { header: 'Shift', key: 'shift' },
        { header: 'Spout', key: 'spout' },
        { header: 'Sample 1', key: 'sample1' },
        { header: 'Sample 2', key: 'sample2' },
        { header: 'Sample 3', key: 'sample3' },
        { header: 'Average', key: 'average' },
        { header: 'Comments', key: 'comments' }
      ];
    }
    
    req.body.spoutData.forEach((spout, index) => {
      sheet.addRow({
        date: req.body.date,
        time: req.body.time,
        operatorName: req.body.operatorName,
        shift: req.body.shift,
        spout: `Spout ${index + 1}`,
        sample1: spout.samples[0],
        sample2: spout.samples[1],
        sample3: spout.samples[2],
        average: spout.average,
        comments: spout.comments
      });
    });

    await workbook.xlsx.writeFile(EXCEL_FILE);
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});