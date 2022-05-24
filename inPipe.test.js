const { src } = require('./inPipe')
const glob = require('glob')
const Stream = require('stream')
const { toStream } = require('./inPipeBefore')

const writeFn = new Stream.Writable({
	objectmode: true,
	write(chunk, encode, cb) {
		console.log(chunk.toString())
		cb()
	}
})


toStream(['./foo/**/*.txt']).pipe(src('./foo/**/*.txt')).pipe(writeFn)