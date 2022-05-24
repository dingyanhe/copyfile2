
const { toStream } = require('./inPipeBefore')
const glob = require('glob')
const Stream = require('stream')

const writeFn = new Stream.Writable({
	objectmode: true,
	write(chunk, encode, cb) {
		console.log(chunk.toString())
		cb()
	}
})

toStream(['./foo/**/*']).pipe(writeFn)
