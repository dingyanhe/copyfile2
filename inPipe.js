const path = require('path')
const Stream = require('stream')
const glob = require('glob')
const { debug } = require('./debug')

exports.src = (globConfig) => {
	const inputStream = new Stream.Transform({
		objectMode: true,
		transform(chunk, encode, cb) {
			glob(chunk, globConfig, (e, files) => {
				if (e) {
					cb()
					throw e
				}

				while(files.length) {
					const p = files.pop()
					debug('inPipe: ', p)
					this.push(p)
				}

				cb()
			})
		},
	})

	return inputStream
}
