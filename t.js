import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const docDefinition = {
    content: [
        { text: 'Hello, this is a PDF with JavaScript!', fontSize: 16 },
    ]
};

pdfMake.createPdf(docDefinition).download('sample.pdf');
