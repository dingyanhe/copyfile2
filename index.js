const { src } = require('./inPipe')
const { trans } = require('./transPipe')
const glob = require('glob')
const Stream = require('stream')
const { makeDebug, debug } = require('./debug')
const { toStream } = require('./inPipeBefore')

const writeFn = new Stream.Writable({
  objectMode: true,
  write(chunk, encode, cb) {
    const { dst, src } = chunk
    console.log(dst, src)
    cb()
  }
})

exports.copyfiles-v3 = (args, config, callback) => {
  if (typeof config === 'function') {
    callback = config;
    config = {
      up: 0
    };
  }

  if (typeof config !== 'object' && config) {
    config = {
      up: config
    };
  }

  makeDebug(config)

  const input = args.slice();
  const outDir = input.pop();
  debug('初始化数据', input, outDir)

  toStream(input)
    .pipe(src({
      ignore: config.exclude,
      dot: true,
      follow: true,
    }))
    .on('error', callback)
    // 输出文件
    .pipe(trans({ outDir, hoist: config.up })).on('error', callback)
    // 写文件
    .pipe(writeFn).on('error', callback)
}
