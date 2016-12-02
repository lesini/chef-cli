import fs from 'co-fs'
import { join } from 'path'

export default function *tree(path) {
    let config = require(`${path}/package.json`)

    return [
        `${config.name}@${config.version} ${path}`,
        treeify(yield treeObj(path)),
    ]
}

function *treeObj(path) {
    let result = {}

    for(let item of yield fs.readdir(path)) {
        let tmp = join(path, item)

        if((yield fs.lstat(tmp)).isDirectory()) {
            result[item] = yield treeObj(tmp)
        }else {
            result[item] = ''
        }
    }

    return result
}

function treeify(obj) {
    let tree = ''

    growBranch('.', obj, false, [], (line) => {
        tree += `${line}\n`
    })

    return tree
}

function growBranch(key, root, last, lastStates, callback) {
    let line, lastStatesCopy

    line = ''
    lastStatesCopy = lastStates.slice(0)

    if(lastStatesCopy.push([root, last]) && lastStates.length > 0) {
        lastStates.forEach((lastState, index) => {
            if (index > 0) {
                line += (lastState[1] ? ' ' : '│') + ' '
            }
        })

        line += prefix(key, last, Object.keys(root).length !== 0) + key
        callback(line)
    }

    if(typeof root === 'object') {
        keys(root).forEach((item, index, array) => {
            growBranch(item, root[item], ++index === array.length, lastStatesCopy, callback)
        })
    }
}

function prefix(key, last, isDirectory) {
    return (isDirectory ? (last ? '└─┬' : '├─┬') : (last ? '└──' : '├──')) + ' '
}

function keys(obj) {
    return Object.keys(obj).filter((key) => obj.hasOwnProperty(key))
}
