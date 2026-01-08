
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');

async function createPdf() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    page.drawText('Please sign here: $SIGNATURE$', {
        x: 50,
        y: 100,
        size: 20,
        color: rgb(0, 0, 0),
    });
    page.drawText('And secondary sign: $SIGNATURE$', {
        x: 350,
        y: 100,
        size: 20,
        color: rgb(0, 0, 0),
    });
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('test-signature-tag.pdf', pdfBytes);
    console.log('test-signature-tag.pdf created');
}

createPdf().catch(console.error);
