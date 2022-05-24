const Stream = require('stream')
const { debug } = require('./debug')

exports.toStream = (src) => {
	const r = new Stream.Readable({
		objectMode: true,
		read() {
			while(src.length) {
				const s = src.pop()
				debug('in toStream: ', s)
				this.push(s)
			}
		},
	})

	return r
}