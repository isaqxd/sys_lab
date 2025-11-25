const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const relatorioService = require('../services/relatorioService');

router.get('/gerar', (req, res) => {
    const filtros = {
        dataInicio: req.query.dataInicio,
        dataFim: req.query.dataFim,
        idSala: req.query.idSala,
        nomeUsuario: req.query.nomeUsuario
    };

    relatorioService.buscarDadosParaRelatorio(filtros, (err, rows) => {
        if (err) {
            return res.status(err.status || 500).json({ sucesso: false, erro: err.erro });
        }

        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio_reservas.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Relatório de Uso de Salas', { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
        
        let periodoTexto = 'Período: Todo o histórico';
        if (filtros.dataInicio) {
            periodoTexto = `Período: ${filtros.dataInicio} até ${filtros.dataFim || 'Hoje'}`;
        }
        doc.text(periodoTexto);
        doc.moveDown();

        const tableTop = 150;
        let y = tableTop;

        function desenharLinha(y, c1, c2, c3, c4, c5) {
            doc.fontSize(9)
                .text(c1, 50, y, { width: 60 })
                .text(c2, 120, y, { width: 110 })
                .text(c3, 240, y, { width: 140 })
                .text(c4, 390, y, { width: 80 })
                .text(c5, 480, y, { width: 80 });
        }

        doc.font('Helvetica-Bold');
        desenharLinha(y, 'Data', 'Sala', 'Usuário', 'Turno', 'Status');
        
        doc.moveTo(30, y + 15).lineTo(570, y + 15).stroke();
        
        y += 25;
        doc.font('Helvetica');

        rows.forEach((row) => {
            const dataFormatada = new Date(row.data_reserva).toLocaleDateString('pt-BR');
            
            if (y > 750) {
                doc.addPage();
                y = 50;
                doc.font('Helvetica-Bold');
                desenharLinha(y, 'Data', 'Sala', 'Usuário', 'Turno', 'Status');
                y += 20;
                doc.font('Helvetica');
            }

            desenharLinha(
                y, 
                dataFormatada, 
                row.nome_sala, 
                row.nome_usuario, 
                row.turno, 
                row.status
            );
            
            y += 20;
        });

        if (rows.length === 0) {
            doc.moveDown().fontSize(12).text('Nenhum registro encontrado para os filtros selecionados.', { align: 'center' });
        }

        doc.end();
    });
});

module.exports = router;