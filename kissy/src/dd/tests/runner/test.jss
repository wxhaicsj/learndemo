module.exports = function (req, res, utils) {
    res.send(utils.render('runner', {
        externalStyle: '.ks-dd-proxy {position:absolute;left:-9999px;top:-9999px}',
        externalLinks: ['/kissy/src/dd/tests/specs/base.css'],
        component: 'dd'
    }));
};