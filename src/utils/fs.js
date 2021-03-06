import _fs from 'fs'
import ncp from 'ncp'
import fs from 'co-fs'
import rimraf from 'rimraf'
import extract from 'unzip'
import { join } from 'path'
import inquirer from 'inquirer'

export function* exists(path) {
    return yield fs.exists(path)
}

export function* rm(path) {
    if (!(yield exists(path))) {
        return false
    }

    yield fs.unlink(path)
    return true
}

export function* mkdir(path) {
    if (yield exists(path)) {
        return false
    }

    yield fs.mkdir(path)
    return true
}

export function *readdir(path) {
    let result = []

    for (let item of yield fs.readdir(path)) {
        if (item[0] === '.') {
            continue
        }

        result.push(item)
    }

    return result
}

export function* rmdir(path) {
    return new Promise((resolve, reject) => {
        rimraf(path, (err) => {
            if (err) {
                return reject(false)
            }

            resolve(true)
        })
    })
}

export function* unzip(path, dest) {
    return new Promise((resolve, reject) => {
        _fs.createReadStream(path).on('end', () => {
            setTimeout(() => {
                resolve(dest)
            }, 1000)
        }).pipe(extract.Extract({ path: dest }))
    })
}

export function* cp(path, dest) {
    return new Promise((resolve, reject) => {
        ncp.ncp(path, dest, function (err) {
            if (err) {
                reject(err)
            }

            resolve(true)
        })
    })
}

export function* readFile(path){
    return yield fs.readFile(path)
}

export function* isEmpty(path) {
    if (!(yield exists(path))) {
        return true
    }

    if ((yield fs.lstat(path)).isDirectory()) {
        let result = []

        for (let item of yield readdir(path)) {
            if (item[0] === '.') {
                continue
            }

            result.push(item)
        }

        return !result.length
    } else {
        let data = yield readFile(path)

        return !data || !result.length
    }
}

export function* confirm(message) {
    return new Promise((resolve, reject) => {
        inquirer.prompt([{
            message,
            name: 'ok',
            type: 'confirm'
        }]).then((answers) => {
            resolve(answers.ok)
        })
    })
}
