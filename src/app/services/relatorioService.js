const relatorioDao = require('../daos/relatorioDao');

function buscarDadosParaRelatorio(filtros, callback) {
    if (!filtros) {
        return callback({ status: 400, erro: "Filtros não fornecidos" });
    }

    relatorioDao.buscarParaRelatorio(filtros, (err, rows) => {
        if (err) {
            return callback({ status: 500, erro: "Erro ao consultar dados do relatório", debug: err });
        }
        callback(null, rows);
    });
}

module.exports = {
    buscarDadosParaRelatorio
};