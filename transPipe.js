const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const Stream = require('stream')
const { debug } = require('./debug')

const depth = (str, hoist) => {
	const arr = path.normalize(str).split(path.sep)
	if (arr.length - 1 < hoist) {
		throw new Error(`当前长度${arr.length}, 期望裁取长度 ${hoist}`)
	}

	if (!hoist) { // 0 false
		return str
	}

	const res = arr.slice(hoist)

	if (!res.length) {
		return '/'
	}

  return path.join(...res)
}

const copyFile = (src, dst, srcStat, callback = () => {}) => new Promise((resolve, reject) => {
	// fs.statSync
	const dstExists = fs.existsSync(dst)
	if (dstExists) {
		debug('in copyFile existsSync: ', dst, ' 已存在')
		resolve()
		callback()
		return
	}

	try {
		fs.createReadStream(src)
			.once('error', e => {
				debug('in copyFile createReadStream: ', src, ' 失败')
				reject(e)
				callback(e)
			})
			.pipe(fs.createWriteStream(dst))
			.once('error', (e) => {
				debug('in copyFile createWriteStream: 从 ', src, ' 失败')
				reject(e)
				callback(e)
			})
			.once('finish', () => {
				try {
					fs.chmod(dst, srcStat.mode, (e) => {
						if (!e) {
							debug('in copyFile chmod: 修改文件', dst, '权限', 'srcStat.mode', '成功')
							resolve()
						} else {
							debug('in copyFile chmod: 修改文件 ', dst, ' 权限 ', srcStat.mode, ' 失败')
							reject(e)
						}
					})
				} catch (error) {
					debug('in copyFile chmod catch: 修改文件 ', dst, ' 权限 ', srcStat.mode, ' 失败')
					reject(error)
					callback(error)
				}
			})
	} catch (error) {
		debug('in copyFile catch: 读写流创建失败 疑似非读写流创建问题')
		reject(error)
		callback(error)
	}
})

const defaultObj = () => ({ outDir: './lib', hoist: 0 })

exports.trans = function (res = defaultObj()) {
	const { outDir, hoist } = { ...defaultObj(), ...res }
	const transFn = new Stream.Transform({
		objectMode: true,
		transform(chunk, encode, cb) {
			const src = path.resolve(chunk)
			const srcStat = fs.statSync(chunk)

			const dstRoot = path.resolve(process.cwd(), outDir)

			// 处理提升后顶层文件丢弃
			// a/a.js a/b/b.js
			// 指定 -u 1 会丢弃掉 a.js，只会输出 b/b.js
			let dstRelativeDir
			try {
				dstRelativeDir = depth(path.dirname(chunk), hoist)
			} catch (error) {
				cb()
				return
			}

			const fileName = path
			const dst = path.join(dstRoot, dstRelativeDir, path.basename(src))
			const dstDir = path.join(dstRoot, dstRelativeDir)

			if (!fs.existsSync(dstDir)) {
				try {
					debug('inTransPipe: 创建目录', dstDir)
					mkdirp.sync(dstDir)
					debug('inTransPipe: 目录', dstDir, '创建成功')
				} catch (error) {
					debug('inTransPipe: 目录', dstDir, '创建失败')
				}
			} else {
				debug('inTransPipe: 目录', dstDir, '已存在')
			}

			copyFile(src, dst, srcStat).then(() => {
				debug('inTransPipe copyFile: 【from】 ', src, ' 【to】 ', dst)
				this.push({ src, dst })
				cb()
			}, cb)
		}
	})

	return transFn
}
