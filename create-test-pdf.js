
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');

async function createPdf() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    page.drawText('Test PDF for SigNeed', {
        x: 50,
        y: 350,
        size: 30,
        color: rgb(0, 0.53, 0.71),
    });
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('test-upload.pdf', pdfBytes);
    console.log('test-upload.pdf created');
}

createPdf().catch(console.error);
