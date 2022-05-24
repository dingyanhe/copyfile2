let debugFn = () => {}

exports.makeDebug = (config) => {
  if (config.verbose) {
		debugFn = function (...args) {
      console.log(...args);
    }
  }
}

exports.debug = (...args) => debugFn(...args)