//import list from './list'

//console.log(list)
const initialList = require('./list')
//console.log(list.map)


const proxy = {
    // Priority processing.
    // apiMocker(app, path, option)
    // This is the option parameter setting for apiMocker
    _proxy: {
        proxy: {
            // Turn a path string such as `/user/:name` into a regular expression.
            // https://www.npmjs.com/package/path-to-regexp
            '/repos/(.*)': 'https://api.github.com/',
            '/:owner/:repo/raw/:ref/(.*)': 'http://127.0.0.1:2018',
            '/api/repos/(.*)': 'http://127.0.0.1:3721/'
        },
        // rewrite target's url path. Object-keys will be used as RegExp to match paths.
        // https://github.com/jaywcjlove/mocker-api/issues/62
        pathRewrite: {
            '^/api/repos/': '/repos/',
        },
        changeHost: true,
        // modify the http-proxy options
        httpProxy: {
            options: {
                ignorePath: true,
            },
            listeners: {
                proxyReq: function (proxyReq, req, res, options) {
                    console.log('proxyReq')
                },
            },
        },
    },
    'GET /api/user/list/': (req, res) => {
        const {page, show_error} = req.query
        const {no, size} = (page || {})
        if (show_error) return res.json({message: "Unable to fetch data."})
        console.log(page)
        let sort = req.query.sort || ''
        const desc = sort.startsWith('-')
        sort = sort.replace(/[\+\-]/, '')
        const list = initialList.sort((a, b) => {
            if (a[sort] > b[sort]) return desc ? -1 : 1
            if (b[sort] > a[sort]) return desc ? 1 : -1
            return 0
        }).slice((no - 1) * size, no * size)
        const json = {
            total: {
                age: list.reduce((prevVal, currVal) => {return prevVal + currVal.age}, 0)
            },
            pagination: {
                rowsCount: initialList.length,
            },
            list
        }
        return res.json(json)
    },

    // =====================
    // The default GET request.
    // https://github.com/jaywcjlove/mocker-api/pull/63
    '/api/user': {
        id: 1,
        username: 'kenny',
        sex: 6
    },
    'GET /api/user': {
        id: 1,
        username: 'kenny',
        sex: 6
    },

    'GET /api/:owner/:repo/raw/:ref/(.*)': (req, res) => {
        const {owner, repo, ref} = req.params
        // http://localhost:8081/api/admin/webpack-mock-api/raw/master/add/ddd.md
        // owner => admin
        // repo => webpack-mock-api
        // ref => master
        // req.params[0] => add/ddd.md
        return res.json({
            id: 1,
            owner, repo, ref,
            path: req.params[0]
        })
    },
    'POST /api/login/account': (req, res) => {
        const {password, username} = req.body
        if (password === '888888' && username === 'admin') {
            return res.json({
                status: 'ok',
                code: 0,
                token: "sdfsdfsdfdsf",
                data: {
                    id: 1,
                    username: 'kenny',
                    sex: 6
                }
            })
        } else {
            return res.status(403).json({
                status: 'error',
                code: 403
            })
        }
    },
    'DELETE /api/user/:id': (req, res) => {
        console.log('---->', req.body)
        console.log('---->', req.params.id)
        res.send({status: 'ok', message: '删除成功！'})
    }
}
module.exports = proxy
