/**
 * @exports log
 * @function log
 * @description Debug logger to console
 * @param  {string} msg - Message to console
 * @param  {int} level - Debug level to output
 * @param  {mixed} details - Extra debug details
 */
export default (msg, level = 1, details = null) => {
  if (window.debugLevel >= level) {
    // eslint-disable-next-line
    console.info(msg)
    if (details) {
      // eslint-disable-next-line
      console.info(details)
    }
  }
}
