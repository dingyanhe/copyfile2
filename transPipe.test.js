const { src } = require('./inPipe')
const { trans } = require('./transPipe')
const glob = require('glob')
const Stream = require('stream')
const { toStream } = require('./inPipeBefore')
const { makeDebug } = require('./debug')

const writeFn = new Stream.Writable({
	objectMode: true,
	write(chunk, encode, cb) {
		console.log(chunk.toString())
		cb()
	}
})

makeDebug({ verbose: true })


toStream(['./foo/**/*.txt']).pipe(src()).pipe(trans({ hoist: 1 })).pipe(writeFn)
